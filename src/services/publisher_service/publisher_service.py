import json
import base64
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone

from fastapi import HTTPException
from jose import jws, jwt
from jose.exceptions import JOSEError, JWTError
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.exceptions import UnsupportedAlgorithm

from src.core.models.models import VerifiableContentModel # May not be directly used if response is VerifiableContentSchema
from src.core.schemas.schemas import PublishContentRequestSchema, VerifiableContentSchema, VerifiableCredentialSchema
from src.core.crypto.crypto_utils import (
    generate_content_hash,
    deserialize_public_key_from_pem,
    public_key_bytes_to_did_key,
)

class PublisherService:
    def __init__(self):
        # In-memory store for published content, keyed by content_hash derived from VC subject
        self._published_data: Dict[str, VerifiableContentSchema] = {}

    async def _verify_vc_signature(self, vc: VerifiableCredentialSchema, public_key_pem: Optional[str]) -> ec.EllipticCurvePublicKey:
        """
        Verifies the JWS signature of the Verifiable Credential.
        Returns the public key object if verification is successful.
        Raises HTTPException on failure.
        """
        if not vc.proof or not vc.proof.jws:
            raise HTTPException(status_code=400, detail="VC proof or JWS missing.")

        jws_token = vc.proof.jws

        # 1. Resolve Public Key
        # For now, prioritize public_key_pem from the request if provided.
        # Otherwise, attempt to derive/resolve from vc.proof.verificationMethod (more complex, future step)
        if not public_key_pem:
            # Basic attempt: if verificationMethod is a DID and public_key_pem was expected from client for did:key
            # This part needs robust implementation for resolving various DIDs and key types.
            # For now, if public_key_pem is not directly provided, we might be stuck if it's not embedded.
            # The task implies client might send public_key_pem or it's derivable/embedded.
            # Let's assume for now if not in request, it must be resolvable from verificationMethod,
            # but we'll require it from request for simplicity in this step.
            raise HTTPException(status_code=400, detail="Public key PEM must be provided for signature verification at this stage.")

        try:
            public_key_object = deserialize_public_key_from_pem(public_key_pem)
            if not isinstance(public_key_object, ec.EllipticCurvePublicKey): # Assuming P-256 as per client
                raise HTTPException(status_code=400, detail="Public key is not an Elliptic Curve key (e.g., P-256).")
        except (ValueError, UnsupportedAlgorithm) as e:
            raise HTTPException(status_code=400, detail=f"Invalid or unsupported public key PEM: {str(e)}")

        # 2. Reconstruct the payload that was signed
        # The JWS payload is typically the VC object without the 'proof' field, then canonicalized.
        vc_payload_dict = vc.model_dump(exclude_none=True, by_alias=True)
        if 'proof' in vc_payload_dict:
            del vc_payload_dict['proof']

        try:
            # Canonicalize the payload as JSON string (UTF-8, sorted keys, no extra whitespace)
            # This must match exactly how the client prepared it.
            canonical_payload_string = json.dumps(vc_payload_dict, sort_keys=True, separators=(',', ':'), ensure_ascii=False)
            signed_payload_bytes = canonical_payload_string.encode('utf-8')
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error canonicalizing VC payload for verification: {str(e)}")

        # 3. Verify JWS
        try:
            # Extract headers to check alg
            jws_header_b64 = jws_token.split('.')[0]
            jws_header_json = base64.urlsafe_b64decode(jws_header_b64 + '=' * (-len(jws_header_b64) % 4)).decode('utf-8')
            jws_header = json.loads(jws_header_json)
            expected_alg = "ES256" # For P-256 keys
            if jws_header.get("alg") != expected_alg:
                raise HTTPException(status_code=400, detail=f"Invalid JWS algorithm. Expected {expected_alg}, got {jws_header.get('alg')}")

            # python-jose's jws.verify expects the raw payload string, not bytes for some flows,
            # but for detached JWS or specific algs, bytes might be needed.
            # Here, we pass the reconstructed payload string.
            # The `jws.verify` function will internally handle hashing if the JWS was signed over a hash.
            # However, W3C VCs are usually signed over the canonicalized VC data itself.
            jws.verify(jws_token, public_key_object, algorithms=[expected_alg], detached_payload=signed_payload_bytes)
            # If verify doesn't raise an exception, the signature is valid.
        except JWTError as e: # Covers various JWS issues like signature invalid, alg mismatch etc.
            raise HTTPException(status_code=400, detail=f"JWS signature verification failed: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Unexpected error during JWS verification: {str(e)}")

        return public_key_object

    async def _validate_issuer_did(self, vc_issuer: str, public_key_object: ec.EllipticCurvePublicKey):
        """
        Validates that the VC issuer DID matches the DID derived from the public key.
        """
        try:
            # For EC keys (P-256), use X962 uncompressed format for did:key generation
            public_key_bytes = public_key_object.public_bytes(
                encoding=serialization.Encoding.X962,
                format=serialization.PublicFormat.UncompressedPoint
            )
            server_calculated_did = public_key_bytes_to_did_key(public_key_bytes, public_key_object)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error deriving DID from public key: {str(e)}")

        if server_calculated_did != vc_issuer:
            # Allow for the did:key resolver on the client to potentially use a different multicodec prefix
            # for the *same key type* if the raw key bytes match.
            # This is a simplified check; a robust solution would involve a proper DID resolver.
            allow_mismatch = False
            if vc_issuer.startswith("did:key:z") and server_calculated_did.startswith("did:key:z"):
                try:
                    # Extract raw key material part from both DIDs (after 'did:key:z')
                    vc_issuer_key_material_b58 = vc_issuer.split(':')[-1][1:] # remove 'z'
                    server_calc_key_material_b58 = server_calculated_did.split(':')[-1][1:] # remove 'z'

                    # This is a very basic check. A full multicodec parsing would be better.
                    # If the base58 encoded key material (without prefixes) is the same, it's likely the same key.
                    # This check is naive as different prefixes could lead to different base58.
                    # A better check: decode base58 for both, compare raw bytes after prefixes.
                    # For now, we rely on public_key_bytes_to_did_key to produce the canonical did:key for P-256.
                    # The client should ideally send a did:key that matches this canonical form.
                    # The previous complex DID mismatch logic was for Ed25519 and might not directly apply here.
                    # The core issue is ensuring the key that signed the VC is the key associated with vc.issuer.
                    pass # For now, strict match after server calculation.
                except Exception:
                    pass # Fall through to raise error

            if not allow_mismatch and server_calculated_did != vc_issuer:
                 raise HTTPException(
                    status_code=400,
                    detail=f"VC issuer DID '{vc_issuer}' does not match DID derived from public key '{server_calculated_did}'."
                )


    async def publish_new_content(
        self, request_data: PublishContentRequestSchema
    ) -> VerifiableContentSchema:
        """
        Processes a Verifiable Credential for publication.
        1. Receives PublishContentRequestSchema (containing VC and optional public_key_pem).
        2. Verifies the VC's JWS signature.
        3. Validates the VC issuer's DID against the public key used for signature verification.
        4. Extracts credentialSubject data.
        5. Constructs and stores a VerifiableContentSchema.
        6. Returns the VerifiableContentSchema.
        """
        vc = request_data.verifiable_credential
        public_key_pem_from_request = request_data.public_key_pem

        print(f"PublisherService: Processing VC publish request for issuer '{vc.issuer}'...")

        # 1. Verify VC Signature (and get public key object)
        try:
            verified_public_key_object = await self._verify_vc_signature(vc, public_key_pem_from_request)
        except HTTPException:
            raise
        except Exception as e:
            # Log e for debugging
            raise HTTPException(status_code=500, detail=f"Unexpected error during VC signature verification: {str(e)}")

        # 2. Validate Issuer DID
        # Ensure vc.issuer is a string (DID)
        vc_issuer_did_str = ""
        if isinstance(vc.issuer, str):
            vc_issuer_did_str = vc.issuer
        elif hasattr(vc.issuer, 'id') and isinstance(vc.issuer.id, str) : # If issuer is a VCDIDDocument
            vc_issuer_did_str = vc.issuer.id
        else:
            raise HTTPException(status_code=400, detail="VC issuer is not a valid DID string or object with id.")

        try:
            await self._validate_issuer_did(vc_issuer_did_str, verified_public_key_object)
        except HTTPException:
            raise
        except Exception as e:
            # Log e for debugging
            raise HTTPException(status_code=500, detail=f"Unexpected error during VC issuer DID validation: {str(e)}")

        # 3. Extract data from credentialSubject
        credential_subject = vc.credentialSubject
        content_text = credential_subject.get("content_text")
        source_url = credential_subject.get("source_url")

        if not content_text: # Basic validation
            raise HTTPException(status_code=400, detail="VC credentialSubject must contain 'content_text'.")

        # 4. Construct VerifiableContentSchema for response and storage
        # The VerifiableContentSchema is what we return and store.
        # It needs a content_hash, signature (from VC proof), did (issuer), public_key_pem, etc.

        # Generate a hash of the core content for identification/storage key
        # This hash is of the *credential subject content*, not the whole VC.
        payload_to_hash_dict = {"content_text": content_text, "source_url": source_url}
        canonical_subject_payload_string = json.dumps(payload_to_hash_dict, sort_keys=True, separators=(',', ':'))
        content_hash_of_subject = generate_content_hash(canonical_subject_payload_string.encode('utf-8'))

        # Use the public_key_pem that was successfully used for verification
        # If verification used an embedded key, this might need to be reconstructed or fetched.
        # For now, assume public_key_pem_from_request was valid and used.
        final_public_key_pem = public_key_pem_from_request
        if not final_public_key_pem and isinstance(verified_public_key_object, ec.EllipticCurvePublicKey):
             # If PEM was not in request but key was resolved (e.g. embedded in VC, future state)
             # we might need to serialize verified_public_key_object back to PEM.
             # This is complex if it wasn't originally from PEM.
             # For now, if public_key_pem_from_request is None, this will be None.
             # The VerifiableContentSchema allows public_key_pem to be optional.
             pass


        response_schema = VerifiableContentSchema(
            content=content_text,
            content_hash=content_hash_of_subject, # Hash of the credentialSubject's main data
            signature=vc.proof.jws, # The JWS of the VC
            did=vc_issuer_did_str,
            public_key_pem=final_public_key_pem, # The PEM used for verification
            source_url=source_url,
            timestamp=datetime.fromisoformat(vc.issuanceDate.replace("Z", "+00:00")), # Ensure timezone aware
            algorithm=vc.proof.type, # e.g., JsonWebSignature2020
            # version and metadata could be extracted if present in VC or credentialSubject
            metadata=credential_subject.get("metadata", None)
        )

        # Store in the in-memory dictionary
        self._published_data[content_hash_of_subject] = response_schema
        print(f"PublisherService: VC for content with subject hash '{content_hash_of_subject}' published and stored for issuer '{vc_issuer_did_str}'.")

        return response_schema

    def get_published_content_by_hash(self, content_hash: str) -> Optional[VerifiableContentSchema]:
        model = self._published_data.get(content_hash)
        if model:
            print(f"PublisherService: Retrieving content with hash '{content_hash}'.")
            return model
        print(f"PublisherService: Content with hash '{content_hash}' not found.")
        return None

    def list_all_published_content(self) -> List[VerifiableContentSchema]:
        print(f"PublisherService: Retrieving all {len(self._published_data)} published items.")
        return list(self._published_data.values())