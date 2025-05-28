import pytest
from unittest import mock
from datetime import datetime, timezone

from fastapi import HTTPException

from src.services.publisher_service.publisher_service import PublisherService
from src.core.schemas.schemas import PublishContentRequestSchema
from src.core.models.models import VerifiableContentModel
from cryptography.hazmat.primitives.asymmetric import ed25519 # For creating mock public key objects
# Import ec for EllipticCurvePublicKey
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization
from jose import jws, jwt # Import jws
from jose.exceptions import JOSEError, JWSSignatureError # Keep these
import json # Keep json
import asyncio # For running async methods

# Import schemas for constructing test data
# Ensure all necessary schemas are imported, including VerifiableContentSchema
from src.core.schemas.schemas import VerifiableCredentialSchema, VCProof, PublishContentRequestSchema, VerifiableContentSchema


# Mock data
MOCK_CONTENT_TEXT = "This is a test content."
MOCK_SOURCE_URL = "http://example.com/source"
MOCK_DID = "did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH" # Assuming P-256 for ES256
MOCK_TIMESTAMP_STR = datetime.now(timezone.utc).isoformat()
MOCK_SIGNATURE = "mock_signature_base64_encoded_for_tests_longer_for_real_jws"
MOCK_PUBLIC_KEY_PEM = """-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEQiTEN8EEQ0i5m2jQj6y7q7NlI5fS
J2VjWJtQoEFh6oVvH4kIgcEpDFfMAb0k2gQxW/s0h0SPKzT8x7a1ZzGjrg==
-----END PUBLIC KEY-----""" # Example P-256 PEM
MOCK_INVALID_PUBLIC_KEY_PEM = "invalid_pem_content"
MOCK_CONTENT_HASH = "mock_content_hash_hex_value"
MOCK_CALCULATED_DID = MOCK_DID
MOCK_DIFFERENT_DID = "did:key:zDifferentDidValueForMismatchTest"

# New Mocks for VC Structure
MOCK_VC_ID = "urn:uuid:mock-vc-id-for-test-12345"
MOCK_VC_TYPE = ["VerifiableCredential", "TestContentCredentialFromPytest"]
MOCK_ISSUANCE_DATE_STR = MOCK_TIMESTAMP_STR # Can reuse or keep distinct if needed
MOCK_PROOF_TYPE = "JsonWebSignature2020" # Standard proof type for JWS
MOCK_VERIFICATION_METHOD = f"{MOCK_DID}#keys-1" # Common pattern for verification method


@pytest.fixture
def publisher_service():
    return PublisherService()

@pytest.fixture
def mock_ec_public_key_object(): # Renamed to be specific for EC keys
    # Use ec.EllipticCurvePublicKey for P-256 keys
    mock_key = mock.Mock(spec=ec.EllipticCurvePublicKey)
    # Example P-256 uncompressed public key bytes (65 bytes: 0x04 + 32 bytes for X + 32 bytes for Y)
    # This is just a placeholder; real tests might need actual key material for crypto ops.
    mock_key.public_bytes.return_value = (
        b'\x04' + b'x_coord_bytes_for_p256_key_mock' * 2 + b'y_coord_bytes_for_p256_key_mock' * 2
    )[:65] # Ensure it's 65 bytes if used for P256 uncompressed
    return mock_key


@pytest.fixture
def mock_vc_proof() -> VCProof:
    return VCProof(
        type=MOCK_PROOF_TYPE,
        created=MOCK_ISSUANCE_DATE_STR,
        verificationMethod=MOCK_VERIFICATION_METHOD,
        proofPurpose="assertionMethod",
        jws=MOCK_SIGNATURE # This will be the JWS string
    )

@pytest.fixture
def mock_vc_credential(mock_vc_proof) -> VerifiableCredentialSchema:
    return VerifiableCredentialSchema(
        context=["https://www.w3.org/2018/credentials/v1", "https://www.w3.org/2018/credentials/examples/v1"],
        id=MOCK_VC_ID,
        type=MOCK_VC_TYPE,
        issuer=MOCK_DID, # Issuer is the DID string
        issuanceDate=MOCK_ISSUANCE_DATE_STR,
        credentialSubject={
            "id": f"did:example:subject-{MOCK_CONTENT_HASH[:10]}", # Example subject ID
            "content_text": MOCK_CONTENT_TEXT,
            "source_url": MOCK_SOURCE_URL,
            "metadata": {"category": "test_fixture_data"}
        },
        proof=mock_vc_proof
    )

@pytest.fixture
def valid_publish_request_data(mock_vc_credential): # Now uses the structured VC
    return PublishContentRequestSchema(
        verifiable_credential=mock_vc_credential,
        public_key_pem=MOCK_PUBLIC_KEY_PEM # public_key_pem is still at the top level of the request
    )

# This test seems to be for the main publish_new_content, let's keep its mocks.
# The _create_verifiable_content_entry test is separate.
@mock.patch('src.services.publisher_service.publisher_service.PublisherService._create_verifiable_content_entry')
@mock.patch('src.services.publisher_service.publisher_service.PublisherService._validate_issuer_did')
@mock.patch('src.services.publisher_service.publisher_service.PublisherService._verify_vc_signature')
def test_publish_new_content_success(
    mock_verify_vc_sig, mock_validate_issuer_did, mock_create_vc_entry,
    publisher_service, valid_publish_request_data, mock_ec_public_key_object
):
    # Setup mocks for the main publish_new_content flow
    mock_verify_vc_sig.return_value = mock_ec_public_key_object # Returns the public key object
    mock_validate_issuer_did.return_value = None # Does not return, just validates
    
    # Mock what _create_verifiable_content_entry would return
    expected_response_schema = VerifiableContentSchema(
        content=MOCK_CONTENT_TEXT,
        content_hash=MOCK_CONTENT_HASH,
        signature=valid_publish_request_data.verifiable_credential.proof.jws,
        did=valid_publish_request_data.verifiable_credential.issuer,
        public_key_pem=valid_publish_request_data.public_key_pem,
        source_url=MOCK_SOURCE_URL,
        timestamp=datetime.fromisoformat(MOCK_ISSUANCE_DATE_STR.replace("Z", "+00:00")),
        algorithm=valid_publish_request_data.verifiable_credential.proof.type,
        metadata=valid_publish_request_data.verifiable_credential.credentialSubject.get("metadata")
    )
    mock_create_vc_entry.return_value = expected_response_schema

    # Call the method under test
    result = asyncio.run(publisher_service.publish_new_content(valid_publish_request_data))

    assert result == expected_response_schema
    mock_verify_vc_sig.assert_called_once_with(
        valid_publish_request_data.verifiable_credential,
        valid_publish_request_data.public_key_pem
    )
    # Extract issuer DID string correctly, as vc.issuer can be an object
    vc_issuer_did_str = valid_publish_request_data.verifiable_credential.issuer
    if not isinstance(vc_issuer_did_str, str): # If issuer is VCDIDDocument
        vc_issuer_did_str = vc_issuer_did_str.id

    mock_validate_issuer_did.assert_called_once_with(
        vc_issuer_did_str,
        mock_ec_public_key_object
    )
    mock_create_vc_entry.assert_called_once()
    # Check that data is stored
    assert publisher_service._published_data[MOCK_CONTENT_HASH] == expected_response_schema


@mock.patch('src.services.publisher_service.publisher_service.PublisherService._verify_vc_signature')
def test_publish_new_content_invalid_pem( # This test now checks if _verify_vc_signature raises error
    mock_verify_vc_sig, publisher_service, valid_publish_request_data
):
    mock_verify_vc_sig.side_effect = HTTPException(status_code=400, detail="Invalid or unsupported public key PEM")
    
    # Create a request with an invalid PEM (though the mock above will trigger error)
    # request_data_invalid_pem = valid_publish_request_data.model_copy(update={"public_key_pem": MOCK_INVALID_PUBLIC_KEY_PEM})

    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(publisher_service.publish_new_content(valid_publish_request_data)) # Use original valid_publish_request_data

    assert exc_info.value.status_code == 400
    assert "Invalid or unsupported public key PEM" in exc_info.value.detail
    mock_verify_vc_sig.assert_called_once()


@mock.patch('src.services.publisher_service.publisher_service.PublisherService._validate_issuer_did')
@mock.patch('src.services.publisher_service.publisher_service.PublisherService._verify_vc_signature')
def test_publish_new_content_did_mismatch(
    mock_verify_vc_sig, mock_validate_issuer_did,
    publisher_service, valid_publish_request_data, mock_ec_public_key_object
):
    mock_verify_vc_sig.return_value = mock_ec_public_key_object
    mock_validate_issuer_did.side_effect = HTTPException(status_code=400, detail="VC issuer DID does not match DID derived from public key")

    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(publisher_service.publish_new_content(valid_publish_request_data))

    assert exc_info.value.status_code == 400
    assert "VC issuer DID does not match DID derived from public key" in exc_info.value.detail
    mock_verify_vc_sig.assert_called_once()
    mock_validate_issuer_did.assert_called_once()


def test_get_published_content_by_hash_found(publisher_service, mock_vc_credential): # Use more complete schema
    # Use VerifiableContentSchema for storing, as that's what publish_new_content produces
    dt_timestamp = datetime.fromisoformat(MOCK_ISSUANCE_DATE_STR.replace("Z", "+00:00"))
    mock_stored_item = VerifiableContentSchema(
        content=MOCK_CONTENT_TEXT, content_hash="found_hash", signature=MOCK_SIGNATURE,
        did=MOCK_DID, public_key_pem=MOCK_PUBLIC_KEY_PEM, timestamp=dt_timestamp,
        source_url=MOCK_SOURCE_URL, algorithm=MOCK_PROOF_TYPE
    )
    publisher_service._published_data["found_hash"] = mock_stored_item

    result = publisher_service.get_published_content_by_hash("found_hash")
    assert result == mock_stored_item

def test_get_published_content_by_hash_not_found(publisher_service):
    result = publisher_service.get_published_content_by_hash("not_found_hash")
    assert result is None

def test_list_all_published_content_empty(publisher_service):
    result = publisher_service.list_all_published_content()
    assert result == []

def test_list_all_published_content_with_data(publisher_service):
    dt_timestamp = datetime.fromisoformat(MOCK_ISSUANCE_DATE_STR.replace("Z", "+00:00"))
    mock_item1 = VerifiableContentSchema(
        content="test1", content_hash="hash1", signature="sig1", did="did1",
        public_key_pem="pem1", timestamp=dt_timestamp, algorithm="alg1"
    )
    mock_item2 = VerifiableContentSchema(
        content="test2", content_hash="hash2", signature="sig2", did="did2",
        public_key_pem="pem2", timestamp=dt_timestamp, algorithm="alg2"
    )
    publisher_service._published_data = {"hash1": mock_item1, "hash2": mock_item2}

    result = publisher_service.list_all_published_content()
    assert len(result) == 2
    assert mock_item1 in result
    assert mock_item2 in result

# Test for _create_verifiable_content_entry (this is the one that had TypeError)
@mock.patch('src.services.publisher_service.publisher_service.generate_content_hash')
def test_create_verifiable_content_entry_success( # Removed other mocks not used by this unit
    mock_gen_hash,
    publisher_service,
    mock_ec_public_key_object, # Use the EC key mock
    mock_vc_credential # Use the VC fixture
):
    mock_gen_hash.return_value = MOCK_CONTENT_HASH
    # Ensure timestamp is datetime, and UTC if no tzinfo
    dt_timestamp_from_request = datetime.fromisoformat(MOCK_TIMESTAMP_STR.replace("Z", "+00:00"))
    if dt_timestamp_from_request.tzinfo is None:
        dt_timestamp_from_request = dt_timestamp_from_request.replace(tzinfo=timezone.utc)

    # Extract necessary fields from mock_vc_credential for the call
    vc_issuer_did_str = mock_vc_credential.issuer
    if not isinstance(vc_issuer_did_str, str): # Handle if issuer is VCDIDDocument
        vc_issuer_did_str = vc_issuer_did_str.id
    
    content_text_from_vc = mock_vc_credential.credentialSubject.get("content_text")
    source_url_from_vc = mock_vc_credential.credentialSubject.get("source_url")


    entry = asyncio.run(publisher_service._create_verifiable_content_entry(
        vc=mock_vc_credential, # Pass the VerifiableCredentialSchema object
        vc_issuer_did_str=vc_issuer_did_str, # Pass the issuer DID string
        verified_public_key_object=mock_ec_public_key_object, # Pass the EC public key mock
        content_text=content_text_from_vc, # From VC's credentialSubject
        source_url=source_url_from_vc, # From VC's credentialSubject
        did_from_request=MOCK_DID, # Can be different or same as vc_issuer_did_str
        timestamp_from_request=dt_timestamp_from_request, # Pass datetime object
        signature_from_request=MOCK_SIGNATURE, # Pass a signature
        public_key_pem_from_request=MOCK_PUBLIC_KEY_PEM # Pass a PEM
    ))

    assert entry.content == content_text_from_vc
    assert entry.content_hash == MOCK_CONTENT_HASH
    assert entry.did == MOCK_DID # Based on did_from_request
    assert entry.timestamp == dt_timestamp_from_request
    assert entry.public_key_pem == MOCK_PUBLIC_KEY_PEM
    assert entry.signature == MOCK_SIGNATURE
    assert entry.algorithm == mock_vc_credential.proof.type
    assert entry.metadata == mock_vc_credential.credentialSubject.get("metadata")
def test_verify_vc_signature_detached_payload_non_ascii_no_claim_check(publisher_service, mock_vc_credential): # Added mock_vc_credential
    """
    Tests _verify_vc_signature with a detached JWS payload, non-ASCII characters.
    The service's _verify_vc_signature internally disables JWT claim checks like exp, aud etc.
    """
    # 1. Generate ES256 (SECP256R1) key pair for the test
    private_key_obj = ec.generate_private_key(ec.SECP256R1())
    public_key_obj = private_key_obj.public_key()
    public_key_pem_for_service = public_key_obj.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode('utf-8')

    # 2. Construct the VC that will be passed to the service.
    # Its dump (excluding proof) will be the payload for signing.
    # Use non-ASCII characters in credentialSubject.
    test_vc_data_dict = {
        "@context": ["https://www.w3.org/2018/credentials/v1", {"@base": "did:example:test"}],
        "id": "urn:uuid:test-non-ascii-vc",
        "type": ["VerifiableCredential", "TestNonAsciiCredential"],
        "issuer": f"did:key:zExampleIssuer{MOCK_CONTENT_HASH[:5]}", # A DID string
        "issuanceDate": datetime.now(timezone.utc).isoformat(),
        "credentialSubject": {
            "id": "did:example:holder_non_ascii",
            "greeting": "Bonjour le monde!",
            "summary": "Ceci est un résumé."
        }
        # Proof will be added after signing
    }
    # Create a VerifiableCredentialSchema instance from this data.
    # To get the payload for signing (which excludes the proof), we first instantiate
    # the VC with a placeholder or dummy proof, then dump it excluding the proof.
    dummy_proof_for_signing = VCProof( # Create a valid VCProof instance
        type="temp", created=datetime.now(timezone.utc).isoformat(),
        verificationMethod="temp", jws="temp"
    )
    vc_object_for_dumping = VerifiableCredentialSchema(**test_vc_data_dict, proof=dummy_proof_for_signing)

    # 3. Canonicalize the payload (VC dump without proof)
    # This is what the service's _verify_vc_signature will reconstruct and what needs to be signed.
    # Use by_alias=True for "@context". ensure_ascii=False for non-ASCII.
    payload_to_sign_dict = vc_object_for_dumping.model_dump(exclude_none=True, by_alias=True, exclude={'proof'})
    canonical_payload_bytes = json.dumps(
        payload_to_sign_dict, sort_keys=True, separators=(',', ':'), ensure_ascii=False
        ).encode('utf-8')

    # 4. JWS Protected Header
    jws_protected_header = {"alg": "ES256"} # `typ` is optional for JWS, often for JWT. ES256 is for P-256.

    # 5. Sign the canonical_payload_bytes using jws.sign()
    # This creates the full JWS string (header.payload.signature), but the service's
    # jwt.decode with detached_payload option will use the externally provided payload.
    signed_jws_token = jws.sign(
        payload=canonical_payload_bytes, # The bytes that were actually signed
        key=private_key_obj,
        headers=jws_protected_header,
        algorithm="ES256"
    )

    # 6. Construct the full VerifiableCredentialSchema with the proof containing the JWS
    final_proof = VCProof(
        type=MOCK_PROOF_TYPE, # e.g., "JsonWebSignature2020"
        created=vc_object_for_dumping.issuanceDate, # Changed vc_for_signing to vc_object_for_dumping
        verificationMethod=f"{vc_object_for_dumping.issuer}#keys-1", # Changed vc_for_signing to vc_object_for_dumping
        proofPurpose="assertionMethod",
        jws=signed_jws_token # The JWS generated
    )
    vc_to_verify = VerifiableCredentialSchema(**payload_to_sign_dict, proof=final_proof)


    # 7. Call _verify_vc_signature with the VC and the public key PEM
    try:
        verified_pk_object = asyncio.run(
            publisher_service._verify_vc_signature(
                vc=vc_to_verify,
                public_key_pem=public_key_pem_for_service
            )
        )
        assert verified_pk_object is not None
        # Compare public key bytes to ensure the correct key was returned/used
        assert verified_pk_object.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ) == public_key_obj.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
    except HTTPException as e:
        pytest.fail(f"_verify_vc_signature raised an HTTPException unexpectedly: {e.detail}")
    except Exception as e:
        pytest.fail(f"_verify_vc_signature raised an unexpected exception type: {type(e).__name__} - {e}")