import json
import base64
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone

from fastapi import HTTPException
from jose import jws, jwt
from jose.exceptions import JOSEError, JWTError
from cryptography.hazmat.primitives import serialization, hashes # Added hashes for direct verification
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.exceptions import UnsupportedAlgorithm, InvalidSignature # Added InvalidSignature

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
        print(f"SERVER_JWS_TOKEN_RECEIVED: {jws_token}") 

        if not public_key_pem:
            raise HTTPException(status_code=400, detail="Public key PEM must be provided for signature verification at this stage.")

        print(f"SERVER_RECEIVED_PUBLIC_KEY_PEM_FOR_VERIFICATION:\n{public_key_pem}") 

        vc_payload_dict = vc.model_dump(exclude_none=True, by_alias=True)
        if 'proof' in vc_payload_dict:
            del vc_payload_dict['proof']

        try:
            canonical_payload_string = json.dumps(vc_payload_dict, sort_keys=True, separators=(',', ':'), ensure_ascii=False)
            print(f"SERVER_CANONICAL_PAYLOAD_FOR_VERIFICATION: {canonical_payload_string}")
            signed_payload_bytes = canonical_payload_string.encode('utf-8')
            print(f"SERVER_CANONICAL_PAYLOAD_BYTES (hex): {signed_payload_bytes.hex()}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error canonicalizing VC payload for verification: {str(e)}")

        try:
            try:
                public_key_object = deserialize_public_key_from_pem(public_key_pem)
                if not isinstance(public_key_object, ec.EllipticCurvePublicKey):
                    raise HTTPException(status_code=400, detail="Public key is not an Elliptic Curve key (e.g., P-256).")
            except (ValueError, UnsupportedAlgorithm) as e:
                raise HTTPException(status_code=400, detail=f"Invalid or unsupported public key PEM: {str(e)}")

            jws_parts = jws_token.split('.')
            if len(jws_parts) != 3: 
                raise HTTPException(status_code=400, detail=f"Invalid JWS format: expected 3 segments (header..signature), got {len(jws_parts)}.")
            
            jws_header_b64 = jws_parts[0]
            # jws_signature_b64url = jws_parts[2] # Not needed if only python-jose is used for final verification

            try:
                padded_jws_header_b64 = jws_header_b64 + '=' * (-len(jws_header_b64) % 4)
                jws_header_str = base64.urlsafe_b64decode(padded_jws_header_b64).decode('utf-8')
                jws_header = json.loads(jws_header_str)
                print(f"SERVER_JWS_PROTECTED_HEADER: {jws_header_str}")
            except json.JSONDecodeError as e:
                # Using jws_header_b64 directly in the error message as jws_header_json_decoded might not be defined
                raise HTTPException(status_code=400, detail=f"Invalid JWS header: not valid JSON. Error: {str(e)}. Header (b64): '{jws_header_b64}'")
            except UnicodeDecodeError as e:
                raise HTTPException(status_code=400, detail=f"Invalid JWS header: not valid UTF-8. Error: {str(e)}. Header (b64): '{jws_header_b64}'")
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Invalid JWS header: cannot decode or parse. Error: {str(e)}")

            if not isinstance(jws_header, dict):
                error_detail = f"Invalid JWS header: expected a JSON object (dict), but got {type(jws_header).__name__}."
                # Simplified content logging for non-dict header
                if isinstance(jws_header, (bytes, str)): # Check if it's bytes or str before trying to decode/use directly
                     error_detail += f" Content: {jws_header!r}" # Use !r for unambiguous representation
                raise HTTPException(status_code=400, detail=error_detail)

            expected_alg = "ES256"
            actual_alg = jws_header.get("alg")

            if actual_alg != expected_alg:
                raise HTTPException(status_code=400, detail=f"Invalid JWS algorithm. Expected {expected_alg}, got {actual_alg or 'None'}.")

            # --- Direct signature verification using cryptography library (COMMENTED OUT FOR THIS TEST) ---
            # try:
            #     jws_signature_b64url_for_direct = jws_parts[2] # Need to define this if direct check is active
            #     padded_signature_b64url_direct = jws_signature_b64url_for_direct + '=' * (-len(jws_signature_b64url_for_direct) % 4)
            #     signature_bytes_direct = base64.urlsafe_b64decode(padded_signature_b64url_direct)
            #     print(f"SERVER_DECODED_SIGNATURE_BYTES (direct check - hex): {signature_bytes_direct.hex()}")
            #     public_key_object.verify(
            #         signature_bytes_direct,
            #         signed_payload_bytes, 
            #         ec.ECDSA(hashes.SHA256())
            #     )
            #     print("Direct cryptography signature verification SUCCEEDED.")
            # except InvalidSignature:
            #     print("Direct cryptography signature verification FAILED: InvalidSignature.")
            #     # Not raising here to let python-jose try
            # except Exception as e_crypto:
            #     print(f"Direct cryptography signature verification FAILED with error: {str(e_crypto)}")
            #     # Not raising here to let python-jose try
            # --- End direct signature verification ---

            # Attempt verification ONLY with python-jose to get its specific error.
            try:
                jwt.decode(jws_token, public_key_object, algorithms=[expected_alg], options={
                    'detached_payload': signed_payload_bytes,
                    'verify_aud': False,
                    'verify_iat': False,
                    'verify_exp': False,
                    'verify_nbf': False,
                    'verify_iss': False,
                    'verify_sub': False,
                    'verify_jti': False
                })
                print("python-jose jwt.decode SUCCEEDED.")
            except JWTError as e_jose:
                print(f"python-jose jwt.decode FAILED: {str(e_jose)}")
                raise HTTPException(status_code=400, detail=f"JWS signature verification failed (python-jose): {str(e_jose)}")
            except Exception as e_jose_other: # Catch other unexpected errors from jwt.decode
                print(f"python-jose jwt.decode FAILED with other error: {str(e_jose_other)}")
                raise HTTPException(status_code=500, detail=f"Unexpected error during JWS verification (python-jose other): {str(e_jose_other)}")

        except HTTPException as e_http: 
            raise e_http
        except Exception as e: 
            print(f"General unexpected error in _verify_vc_signature: {str(e)}")
            raise HTTPException(status_code=500, detail=f"General unexpected error during JWS verification setup: {str(e)}")

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

        # 1. Verify VC Signature (and get public key object, though it's now just the PEM string if direct passing works)
        try:
            # _verify_vc_signature will now effectively just check the signature
            # and return the public_key_pem if successful, not a key object.
            # We need to adjust what _validate_issuer_did expects or how it gets the key object.
            # For now, let's assume _verify_vc_signature returns the PEM, and _validate_issuer_did will re-deserialize.
            # This is slightly inefficient but isolates the jwt.decode step.
            await self._verify_vc_signature(vc, public_key_pem_from_request)
            # If _verify_vc_signature passes, we need the key object for _validate_issuer_did
            verified_public_key_object = deserialize_public_key_from_pem(public_key_pem_from_request)

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

        # 4. Construct VerifiableContentSchema
        response_schema = await self._create_verifiable_content_entry(
            vc=vc,
            vc_issuer_did_str=vc_issuer_did_str,
            public_key_pem_from_request=public_key_pem_from_request,
            verified_public_key_object=verified_public_key_object,
            content_text=content_text,
            source_url=source_url
        )

        # Store in the in-memory dictionary
        content_hash_of_subject = response_schema.content_hash # Get hash from created schema
        self._published_data[content_hash_of_subject] = response_schema
        print(f"PublisherService: VC for content with subject hash '{content_hash_of_subject}' published and stored for issuer '{vc_issuer_did_str}'.")

        return response_schema

    async def _create_verifiable_content_entry(
        self,
        vc: VerifiableCredentialSchema,
        vc_issuer_did_str: str,
        public_key_pem_from_request: Optional[str],
        verified_public_key_object: ec.EllipticCurvePublicKey,
        content_text: str,
        source_url: Optional[str],
        did_from_request: Optional[str] = None,
        timestamp_from_request: Optional[datetime] = None,
        signature_from_request: Optional[str] = None  # Added signature_from_request
    ) -> VerifiableContentSchema:
        """
        Constructs and returns a VerifiableContentSchema instance.
        """
        # Generate a hash of the core content for identification/storage key
        # This hash is of the *credential subject content*, not the whole VC.
        payload_to_hash_dict = {"content_text": content_text, "source_url": source_url}
        canonical_subject_payload_string = json.dumps(payload_to_hash_dict, sort_keys=True, separators=(',', ':'))
        content_hash_of_subject = generate_content_hash(canonical_subject_payload_string.encode('utf-8'))

        # Use the public_key_pem that was successfully used for verification
        final_public_key_pem = public_key_pem_from_request
        # (Logic for deriving PEM if not in request can be added here if needed)

        final_timestamp = timestamp_from_request
        if final_timestamp is None:
            try:
                if isinstance(vc.issuanceDate, str):
                    final_timestamp = datetime.fromisoformat(vc.issuanceDate.replace("Z", "+00:00"))
                elif isinstance(vc.issuanceDate, datetime):
                    final_timestamp = vc.issuanceDate
                    if final_timestamp.tzinfo is None or final_timestamp.tzinfo.utcoffset(final_timestamp) is None:
                        final_timestamp = final_timestamp.replace(tzinfo=timezone.utc)
                else:
                    raise ValueError("vc.issuanceDate is not a valid ISO string or datetime object.")
            except ValueError as e:
                print(f"Warning: Could not parse vc.issuanceDate '{vc.issuanceDate}'. Error: {e}. Falling back to current UTC time.")
                final_timestamp = datetime.now(timezone.utc)
        
        if final_timestamp is None: # Should not happen if logic above is correct
            print("Warning: final_timestamp is still None. Defaulting to current UTC time.")
            final_timestamp = datetime.now(timezone.utc)

        # Determine the signature to use
        final_signature = signature_from_request if signature_from_request is not None else vc.proof.jws

        response_schema = VerifiableContentSchema(
            content=content_text,
            content_hash=content_hash_of_subject,
            signature=final_signature, # Use final_signature
            did=did_from_request if did_from_request is not None else vc_issuer_did_str,
            public_key_pem=final_public_key_pem,
            source_url=source_url,
            timestamp=final_timestamp,
            algorithm=vc.proof.type, # Assuming this is the algorithm of the VC proof
            metadata=vc.credentialSubject.get("metadata", None)
        )
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