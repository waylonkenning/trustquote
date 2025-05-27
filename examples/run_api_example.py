import asyncio
import base64
import json
from datetime import datetime, timezone

import httpx

from src.core.crypto.crypto_utils import (
    generate_content_hash,
    generate_ed25519_key_pair,
    public_key_bytes_to_did_key,
    sign_message,
)

BASE_URL = "http://localhost:8000"


async def main():
    """
    Demonstrates the API publishing and verification workflow.
    """
    # 1. Generate Ed25519 key pair
    priv_key_bytes, pub_key_bytes, priv_key_pem, pub_key_pem = generate_ed25519_key_pair()
    print(f"Generated Private Key (PEM):\n{priv_key_pem}")
    print(f"Generated Public Key (PEM):\n{pub_key_pem}")

    # 2. Generate did:key from the public key
    did = public_key_bytes_to_did_key(pub_key_bytes)
    print(f"Generated DID: {did}")

    # 3. Define content details
    content_text = "API example: Hello secure DID world!"
    source_url = "http://example.com/api/hello-did"
    timestamp = datetime.now(timezone.utc).isoformat()
    print(f"Content Text: {content_text}")
    print(f"Source URL: {source_url}")
    print(f"Timestamp: {timestamp}")

    # 4. Construct canonical payload for signing and hash generation
    payload_dict_for_signing = {
        "content_text": content_text,
        "source_url": source_url,
        "timestamp": timestamp,
        "did": did,
    }
    canonical_json_payload = json.dumps(
        payload_dict_for_signing, sort_keys=True, separators=(",", ":")
    )
    print(f"Canonical JSON Payload for Signing:\n{canonical_json_payload}")

    content_hash_of_payload = generate_content_hash(canonical_json_payload)
    print(f"Content Hash of Canonical Payload: {content_hash_of_payload}")

    # 5. Sign the canonical JSON payload
    signature_bytes = sign_message(priv_key_bytes, canonical_json_payload.encode("utf-8"))
    signature_b64 = base64.b64encode(signature_bytes).decode("utf-8")
    print(f"Signature (Base64): {signature_b64}")

    async with httpx.AsyncClient() as client:
        # 6. Publish Content
        publish_data = {
            "content": content_text,  # Field name in schema is 'content'
            "source_url": source_url,
            "timestamp": timestamp,
            "did": did,
            "signature": signature_b64,
            "public_key_pem": pub_key_pem,
        }
        print(f"\nAttempting to publish content to: {BASE_URL}/api/v1/publish/")
        print(f"Publish Data:\n{json.dumps(publish_data, indent=2)}")
        try:
            response = await client.post(
                f"{BASE_URL}/api/v1/publish/", json=publish_data, timeout=10.0
            )
            response.raise_for_status()  # Raise an exception for bad status codes
            print(f"Publish Response Status: {response.status_code}")
            publish_response_json = response.json()
            print(f"Publish Response JSON:\n{json.dumps(publish_response_json, indent=2)}")
            
            # Store the content_hash from the response
            # It should match content_hash_of_payload if the server calculates it the same way
            # For this example, we'll use our locally calculated hash for verification
            # as the publish endpoint might return its own hash based on its internal representation.
            # The key is that the *verifier* uses the hash of the *original canonical payload*.
            # published_content_hash = publish_response_json.get("content_hash")
            # print(f"Content Hash from Publish Response: {published_content_hash}")

        except httpx.HTTPStatusError as e:
            print(f"HTTP error during publish: {e.response.status_code} - {e.response.text}")
            return
        except httpx.RequestError as e:
            print(f"Request error during publish: {e}")
            return
        except json.JSONDecodeError:
            print(f"Error decoding JSON from publish response: {response.text}")
            return


        # 7. Verify Content (using the locally calculated hash of the canonical payload)
        verify_data = {
            "original_content_text": content_text,
            "original_content_hash": content_hash_of_payload,
            "original_signature": signature_b64,
            "public_key_pem": pub_key_pem,
            "did": did,
            "source_url": source_url,
            "timestamp": timestamp,
        }
        print(f"\nAttempting to verify content at: {BASE_URL}/api/v1/verifier/verify/")
        print(f"Verify Data:\n{json.dumps(verify_data, indent=2)}")
        try:
            response = await client.post(
                f"{BASE_URL}/api/v1/verifier/verify/", json=verify_data, timeout=10.0
            )
            response.raise_for_status()
            print(f"Verify Response Status: {response.status_code}")
            print(f"Verify Response JSON:\n{json.dumps(response.json(), indent=2)}")
        except httpx.HTTPStatusError as e:
            print(f"HTTP error during verify: {e.response.status_code} - {e.response.text}")
        except httpx.RequestError as e:
            print(f"Request error during verify: {e}")
        except json.JSONDecodeError:
            print(f"Error decoding JSON from verify response: {response.text}")


        # 8. Tampered Content Example
        content_text_tampered = content_text + " (tampered)"
        # The hash and signature are for the *original* content.
        # We are sending tampered text but claiming it matches the original hash and signature.
        verify_data_tampered = {
            "original_content_text": content_text_tampered, # Tampered text
            "original_content_hash": content_hash_of_payload, # Hash of original canonical payload
            "original_signature": signature_b64, # Signature of original canonical payload
            "public_key_pem": pub_key_pem,
            "did": did,
            "source_url": source_url,
            "timestamp": timestamp, # Original timestamp
        }
        print(f"\nAttempting to verify tampered content at: {BASE_URL}/api/v1/verifier/verify/")
        print(f"Tampered Verify Data:\n{json.dumps(verify_data_tampered, indent=2)}")
        try:
            response = await client.post(
                f"{BASE_URL}/api/v1/verifier/verify/", json=verify_data_tampered, timeout=10.0
            )
            # We expect a non-200 status code here, likely 400 or 422 if verification fails
            print(f"Tampered Verify Response Status: {response.status_code}")
            print(f"Tampered Verify Response JSON:\n{json.dumps(response.json(), indent=2)}")
        except httpx.HTTPStatusError as e:
            print(f"Expected HTTP error for tampered content: {e.response.status_code} - {e.response.text}")
        except httpx.RequestError as e:
            print(f"Request error during tampered verify: {e}")
        except json.JSONDecodeError:
            print(f"Error decoding JSON from tampered verify response: {response.text}")


if __name__ == "__main__":
    asyncio.run(main())