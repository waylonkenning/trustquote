import sys
import os
import json
import base64
from datetime import datetime, timezone

# Add the project root to sys.path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Ensure the project root is in PYTHONPATH to run this script directly.
# Example: export PYTHONPATH=$PYTHONPATH:/path/to/your/project
# Or run from project root: python examples/run_core_example.py

from src.core.crypto.crypto_utils import (
    generate_ed25519_key_pair,
    public_key_bytes_to_did_key,
    generate_content_hash,
    sign_message,
    serialize_private_key_to_pem,
    serialize_public_key_to_pem
)
from src.services.publisher_service.publisher_service import PublisherService
from src.services.verifier_service.verifier_service import VerifierService
from src.core.schemas.schemas import PublishContentRequestSchema, VerificationRequestSchema

def run_example():
    # Instantiate Services
    publisher_service = PublisherService()
    verifier_service = VerifierService()

    # 1. Generate an Ed25519 key pair.
    private_key, public_key = generate_ed25519_key_pair()
    priv_key_bytes = private_key.private_bytes_raw()
    pub_key_bytes = public_key.public_bytes_raw()
    priv_key_pem = serialize_private_key_to_pem(private_key).decode('utf-8')
    pub_key_pem = serialize_public_key_to_pem(public_key).decode('utf-8')
    print(f"Generated Private Key (PEM):\n{priv_key_pem[:100]}...") # Truncated for brevity
    print(f"Generated Public Key (PEM):\n{pub_key_pem}")
    print("-" * 30)

    # 2. Generate a did:key from the public key.
    did = public_key_bytes_to_did_key(pub_key_bytes)
    print(f"Generated DID: {did}")
    print("-" * 30)

    # 3. Define content_text, source_url, and timestamp.
    content_text = "Core example: Hello DID world!"
    source_url = "http://example.com/core/hello-did"
    timestamp = datetime.now(timezone.utc).isoformat()
    print(f"Content Text: {content_text}")
    print(f"Source URL: {source_url}")
    print(f"Timestamp: {timestamp}")
    print("-" * 30)

    # 4. Construct the canonical JSON payload string.
    payload_dict = {
        "content_text": content_text,
        "source_url": source_url,
        "timestamp": timestamp,
        "did": did
    }
    canonical_json_payload = json.dumps(payload_dict, sort_keys=True, separators=(',', ':'))
    print(f"Canonical JSON Payload: {canonical_json_payload}")
    print("-" * 30)

    # 5. Sign this canonical JSON string.
    signature_bytes = sign_message(priv_key_bytes, canonical_json_payload.encode('utf-8'))

    # 6. Base64 encode the signature.
    signature_b64 = base64.b64encode(signature_bytes).decode('utf-8')
    print(f"Base64 Encoded Signature: {signature_b64}")
    print("-" * 30)

    # 7. Calculate the content_hash of this canonical JSON string.
    content_hash = generate_content_hash(canonical_json_payload.encode('utf-8'))
    print(f"Content Hash (of canonical payload): {content_hash}")
    print("-" * 30)

    # Call PublisherService.publish_new_content
    publish_request = PublishContentRequestSchema(
        content_text=content_text,
        source_url=source_url,
        timestamp=timestamp,
        did=did,
        signature=signature_b64,
        public_key_pem=pub_key_pem
    )
    print("Publish Request Data:")
    print(publish_request.model_dump_json(indent=2))
    
    published_item_model = publisher_service.publish_new_content(request_data=publish_request)
    print("\nPublished Item Model:")
    print(published_item_model.model_dump_json(indent=2))
    print("-" * 30)

    # Call VerifierService.verify (Successful Case)
    verify_request_valid = VerificationRequestSchema(
        original_content_text=content_text,
        original_content_hash=content_hash,
        original_signature=signature_b64,
        public_key_pem=pub_key_pem,
        did=did,
        source_url=source_url,
        timestamp=timestamp
    )
    print("Verification Request Data (Valid):")
    print(verify_request_valid.model_dump_json(indent=2))

    verification_result_valid = verifier_service.verify(request_data=verify_request_valid)
    print("\nVerification Result (Valid Case):")
    print(verification_result_valid.model_dump_json(indent=2))
    print("-" * 30)

    # Tampered Content Example
    tampered_content_text = "Core example: Hello TAMPERED DID world!"
    # Note: For a realistic tampered scenario, the signature and hash would NOT match.
    # Here, we are testing if the service correctly identifies a mismatch if original_content_text
    # is different from what would produce the given original_content_hash.
    # The verifier service re-calculates the hash from original_content_text, source_url, timestamp, did.
    
    verify_request_tampered = VerificationRequestSchema(
        original_content_text=tampered_content_text, # Tampered
        original_content_hash=content_hash,          # Original hash
        original_signature=signature_b64,            # Original signature
        public_key_pem=pub_key_pem,
        did=did,
        source_url=source_url,
        timestamp=timestamp
    )
    print("Verification Request Data (Tampered Content Text):")
    print(verify_request_tampered.model_dump_json(indent=2))

    verification_result_tampered = verifier_service.verify(request_data=verify_request_tampered)
    print("\nVerification Result (Tampered Content Text Case):")
    print(verification_result_tampered.model_dump_json(indent=2))
    print("-" * 30)

if __name__ == "__main__":
    run_example()