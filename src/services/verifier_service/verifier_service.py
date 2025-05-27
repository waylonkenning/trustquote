import base64
import json
import binascii
from datetime import datetime, timezone
from typing import Optional

from cryptography.hazmat.primitives import serialization # For public_key_obj.public_bytes()
# cryptography.exceptions.InvalidSignature is handled by crypto_utils.verify_signature returning False

from src.core.schemas.schemas import VerificationRequestSchema, VerificationResultSchema
from src.core.crypto import crypto_utils

class VerifierService:
    def __init__(self, verifier_id: Optional[str] = "default_verifier_v1"):
        self.verifier_id = verifier_id

    def verify(self, request_data: VerificationRequestSchema) -> VerificationResultSchema:
        """
        Verifies the content by checking the hash and signature, using DID-centric schemas.
        """
        status: str = ""
        message: str = ""
        is_content_hash_match: bool = False
        is_signature_valid: bool = False
        # Ensure all paths populate these before returning VerificationResultSchema

        # 1. Deserialize Public Key
        try:
            # .encode('utf-8') is used as deserialize_public_key_from_pem expects bytes
            public_key_obj = crypto_utils.deserialize_public_key_from_pem(request_data.public_key_pem.encode('utf-8'))
        except ValueError: # Handles bad PEM format as per crypto_utils behavior
            status = "INVALID_PUBLIC_KEY"
            message = "Invalid public key format."
            return VerificationResultSchema(
                status=status, is_content_hash_match=False, is_signature_valid=False,
                verification_timestamp=datetime.now(timezone.utc),
                content_hash_checked=request_data.original_content_hash, # from request
                verifier_id=self.verifier_id, error_message=message
            )
        except Exception as e: # Catch any other unexpected error during key deserialization
            status = "VERIFICATION_ERROR"
            message = f"Error deserializing public key: {str(e)}"
            return VerificationResultSchema(
                status=status, is_content_hash_match=False, is_signature_valid=False,
                verification_timestamp=datetime.now(timezone.utc),
                content_hash_checked=request_data.original_content_hash,
                verifier_id=self.verifier_id, error_message=message
            )

        # 2. Reconstruct Canonical Payload for Hashing & Verification
        payload_dict = {
            "content_text": request_data.original_content_text,
            "source_url": request_data.source_url,
            "timestamp": request_data.timestamp, # Assumed to be string (e.g., ISO 8601) as per schema
            "did": request_data.did
        }
        try:
            canonical_json_payload_string = json.dumps(payload_dict, sort_keys=True, separators=(',', ':'))
        except TypeError as e: # Should not happen if schema enforces types and timestamp is string
            status = "VERIFICATION_ERROR"
            message = f"Error creating canonical JSON payload: {str(e)}"
            return VerificationResultSchema(
                status=status, is_content_hash_match=False, is_signature_valid=False,
                verification_timestamp=datetime.now(timezone.utc),
                content_hash_checked=request_data.original_content_hash,
                verifier_id=self.verifier_id, error_message=message
            )

        # 3. Verify Content Hash
        try:
            calculated_hash = crypto_utils.generate_content_hash(canonical_json_payload_string.encode('utf-8'))
        except Exception as e: # Catch errors from generate_content_hash
            status = "VERIFICATION_ERROR"
            message = f"Error generating content hash: {str(e)}"
            return VerificationResultSchema(
                status=status, is_content_hash_match=False, is_signature_valid=False,
                verification_timestamp=datetime.now(timezone.utc),
                content_hash_checked=request_data.original_content_hash,
                verifier_id=self.verifier_id, error_message=message
            )
        
        is_content_hash_match = (calculated_hash == request_data.original_content_hash)

        if not is_content_hash_match:
            status = "TAMPERED_CONTENT"
            message = "Content hash mismatch, content may have been tampered."
            is_signature_valid = False # Explicitly set as per instruction
            return VerificationResultSchema(
                status=status, is_content_hash_match=is_content_hash_match, is_signature_valid=is_signature_valid,
                verification_timestamp=datetime.now(timezone.utc),
                content_hash_checked=request_data.original_content_hash,
                verifier_id=self.verifier_id, error_message=message
            )

        # 4. Verify Signature (only if content hash matches)
        message_bytes_to_verify = canonical_json_payload_string.encode('utf-8')
        
        try:
            signature_bytes = base64.b64decode(request_data.original_signature, validate=True)
        except binascii.Error: # Error from base64.b64decode as per instruction
            status = "INVALID_SIGNATURE"
            message = "Invalid base64 encoding for signature."
            is_signature_valid = False # As per instruction
            # The 'message' variable here holds the specific error string.
            return VerificationResultSchema(
                status=status, is_content_hash_match=is_content_hash_match, is_signature_valid=is_signature_valid,
                verification_timestamp=datetime.now(timezone.utc),
                content_hash_checked=request_data.original_content_hash,
                verifier_id=self.verifier_id, error_message=message
            )
        except Exception as e: # Other unexpected errors during decode
            status = "VERIFICATION_ERROR"
            message = f"Error decoding signature: {str(e)}"
            is_signature_valid = False
            return VerificationResultSchema(
                status=status, is_content_hash_match=is_content_hash_match, is_signature_valid=is_signature_valid,
                verification_timestamp=datetime.now(timezone.utc),
                content_hash_checked=request_data.original_content_hash,
                verifier_id=self.verifier_id, error_message=message
            )

        try:
            # Get raw public key bytes from the deserialized public key object
            public_key_bytes_for_verify = public_key_obj.public_bytes(
                encoding=serialization.Encoding.Raw,
                format=serialization.PublicFormat.Raw
            )
            # crypto_utils.verify_signature handles cryptography.exceptions.InvalidSignature by returning False
            is_signature_valid = crypto_utils.verify_signature(
                public_key_bytes_for_verify,
                message_bytes_to_verify,
                signature_bytes
            )
        except Exception as e: # Catches errors from public_bytes or if verify_signature itself raises an *unexpected* error
            status = "VERIFICATION_ERROR"
            message = f"An unexpected error occurred during signature verification: {str(e)}"
            is_signature_valid = False # As per instruction
            return VerificationResultSchema(
                status=status, is_content_hash_match=is_content_hash_match, is_signature_valid=is_signature_valid,
                verification_timestamp=datetime.now(timezone.utc),
                content_hash_checked=request_data.original_content_hash,
                verifier_id=self.verifier_id, error_message=message
            )

        # 5. Determine Final Status
        if is_content_hash_match and is_signature_valid:
            status = "VALID"
            message = "Content is valid and signature verified."
        elif is_content_hash_match and not is_signature_valid:
            status = "INVALID_SIGNATURE"
            message = "Signature verification failed."
        # All other error statuses (INVALID_PUBLIC_KEY, TAMPERED_CONTENT, VERIFICATION_ERROR from various stages)
        # should have caused an early return.
        else: 
            # This fallback should ideally not be reached if logic is exhaustive.
            if not status: 
                status = "UNKNOWN_ERROR"
                message = "An unknown error occurred during verification logic."

        # The 'message' variable here is the general status message determined by the logic.
        # If status is not "VALID", this 'message' becomes the 'error_message'.
        # If status is "VALID", 'error_message' is None.
        final_error_message = message if status != "VALID" else None

        return VerificationResultSchema(
            status=status,
            is_content_hash_match=is_content_hash_match,
            is_signature_valid=is_signature_valid,
            verification_timestamp=datetime.now(timezone.utc),
            content_hash_checked=request_data.original_content_hash,
            verifier_id=self.verifier_id,
            error_message=final_error_message
        )

# Example of how it might be used (for testing or integration):
# if __name__ == '__main__':
#     from src.core.crypto.crypto_utils import generate_ed25519_key_pair, sign_message
#     from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat, PrivateFormat, NoEncryption
#
#     # 1. Generate Keys
#     priv_key_obj, pub_key_obj = generate_ed25519_key_pair()
#    
#     # Get PEM format for public key (as string)
#     public_key_pem = pub_key_obj.public_bytes(
#         encoding=Encoding.PEM,
#         format=PublicFormat.SubjectPublicKeyInfo
#     ).decode('utf-8')
#
#     # Get raw private key bytes for signing
#     private_key_bytes_for_signing = priv_key_obj.private_bytes(
#         encoding=Encoding.Raw,
#         format=PrivateFormat.Raw,
#         encryption_algorithm=NoEncryption()
#     )
#
#     # 2. Prepare Content
#     test_content = "This is a test content for verifier service."
#     test_content_bytes = test_content.encode('utf-8')
#     test_content_hash = generate_content_hash(test_content_bytes) # This example hash is on content, not canonical JSON
#    
#     # 3. Sign Content
#     signature_bytes = sign_message(private_key_bytes_for_signing, test_content_bytes) # Signs content, not canonical JSON
#     signature_b64 = base64.b64encode(signature_bytes).decode('utf-8')
#
#     # 4. Prepare Verification Request (EXAMPLE NEEDS UPDATE FOR NEW SCHEMA)
#     # The VerificationRequestSchema now expects fields like did, source_url, timestamp,
#     # original_content_text, original_content_hash, original_signature, public_key_pem.
#     # The old VerifiableContentSchema is not used directly.
#     # This example would need significant rework to align with the new VerifierService logic.
#
#     # Example:
#     # request_data_example = VerificationRequestSchema(
#     #     did="did:example:123",
#     #     source_url="http://example.com/content",
#     #     timestamp=datetime.now(timezone.utc).isoformat(),
#     #     original_content_text=test_content,
#     #     original_content_hash="some_hash_of_canonical_payload", # Must match the new hashing logic
#     #     original_signature="some_signature_on_canonical_payload", # Must match new signing logic
#     #     public_key_pem=public_key_pem
#     # )
#
#     # # 5. Initialize and use VerifierService
#     # verifier_service = VerifierService(verifier_id="test_verifier_001")
#     # result = verifier_service.verify(request_data_example)
#
#     # print(f"Verification Result:")
#     # print(f"  Status: {result.status}")
#     # print(f"  Is Signature Valid: {result.is_signature_valid}")
#     # print(f"  Is Content Hash Match: {result.is_content_hash_match}")
#     # print(f"  Timestamp: {result.verification_timestamp}")
#     # print(f"  Verifier ID: {result.verifier_id}")
#     # if result.error_message:
#     #     print(f"  Error: {result.error_message}")