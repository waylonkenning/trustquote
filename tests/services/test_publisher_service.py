import pytest
from unittest import mock
from datetime import datetime, timezone

from fastapi import HTTPException

from src.services.publisher_service.publisher_service import PublisherService
from src.core.schemas.schemas import PublishContentRequestSchema
from src.core.models.models import VerifiableContentModel
from cryptography.hazmat.primitives.asymmetric import ed25519 # For creating mock public key objects

# Mock data
MOCK_CONTENT_TEXT = "This is a test content."
MOCK_SOURCE_URL = "http://example.com/source"
MOCK_DID = "did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH"
MOCK_TIMESTAMP_STR = datetime.now(timezone.utc).isoformat()
MOCK_SIGNATURE = "mock_signature_base64_encoded"
MOCK_PUBLIC_KEY_PEM = """-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAGb6ffG/n8qlOf/UEw25L2xTPlfJ/LZE6z2lgB9Lp7cE=
-----END PUBLIC KEY-----"""
MOCK_INVALID_PUBLIC_KEY_PEM = "invalid_pem_content"
MOCK_CONTENT_HASH = "mock_content_hash_hex"
MOCK_CALCULATED_DID = MOCK_DID # Assume it matches for happy path
MOCK_DIFFERENT_DID = "did:key:zDifferentDidValue"

@pytest.fixture
def publisher_service():
    return PublisherService()

@pytest.fixture
def mock_public_key_object():
    # Create a dummy Ed25519PublicKey object for mocking purposes
    # This doesn't need to be a real key, just needs the public_bytes_raw method
    mock_key = mock.Mock(spec=ed25519.Ed25519PublicKey)
    mock_key.public_bytes_raw.return_value = b"mock_public_key_bytes_32_longg" # 32 bytes
    return mock_key

@pytest.fixture
def valid_publish_request_data():
    return PublishContentRequestSchema(
        content_text=MOCK_CONTENT_TEXT,
        source_url=MOCK_SOURCE_URL,
        did=MOCK_DID,
        timestamp=MOCK_TIMESTAMP_STR,
        signature=MOCK_SIGNATURE,
        public_key_pem=MOCK_PUBLIC_KEY_PEM
    )

@mock.patch('src.services.publisher_service.publisher_service.generate_content_hash')
@mock.patch('src.services.publisher_service.publisher_service.public_key_bytes_to_did_key')
@mock.patch('src.services.publisher_service.publisher_service.deserialize_public_key_from_pem')
def test_publish_new_content_success(
    mock_deserialize_pem, mock_pk_to_did, mock_gen_hash,
    publisher_service, valid_publish_request_data, mock_public_key_object
):
    mock_deserialize_pem.return_value = mock_public_key_object
    mock_pk_to_did.return_value = MOCK_CALCULATED_DID
    mock_gen_hash.return_value = MOCK_CONTENT_HASH

    result = publisher_service.publish_new_content(valid_publish_request_data)

    assert isinstance(result, VerifiableContentModel)
    assert result.content == MOCK_CONTENT_TEXT
    assert result.content_hash == MOCK_CONTENT_HASH
    assert result.did == MOCK_DID
    assert result.public_key_pem == MOCK_PUBLIC_KEY_PEM
    assert publisher_service._published_data[MOCK_CONTENT_HASH] == result

    mock_deserialize_pem.assert_called_once_with(MOCK_PUBLIC_KEY_PEM)
    mock_public_key_object.public_bytes_raw.assert_called_once()
    mock_pk_to_did.assert_called_once_with(b"mock_public_key_bytes_32_longg")
    # Verify canonical JSON hashing input
    expected_payload_dict = {
        "content_text": MOCK_CONTENT_TEXT,
        "source_url": MOCK_SOURCE_URL,
        "timestamp": MOCK_TIMESTAMP_STR,
        "did": MOCK_DID,
    }
    import json
    expected_canonical_json = json.dumps(expected_payload_dict, sort_keys=True, separators=(',', ':'))
    mock_gen_hash.assert_called_once_with(expected_canonical_json.encode('utf-8'))


@mock.patch('src.services.publisher_service.publisher_service.deserialize_public_key_from_pem')
def test_publish_new_content_invalid_pem(
    mock_deserialize_pem, publisher_service, valid_publish_request_data
):
    mock_deserialize_pem.side_effect = ValueError("Invalid PEM")
    request_data_invalid_pem = valid_publish_request_data.model_copy(update={"public_key_pem": MOCK_INVALID_PUBLIC_KEY_PEM})

    with pytest.raises(HTTPException) as exc_info:
        publisher_service.publish_new_content(request_data_invalid_pem)

    assert exc_info.value.status_code == 400
    assert "Invalid PEM format: Invalid PEM" in exc_info.value.detail
    mock_deserialize_pem.assert_called_once_with(MOCK_INVALID_PUBLIC_KEY_PEM)


@mock.patch('src.services.publisher_service.publisher_service.public_key_bytes_to_did_key')
@mock.patch('src.services.publisher_service.publisher_service.deserialize_public_key_from_pem')
def test_publish_new_content_did_mismatch(
    mock_deserialize_pem, mock_pk_to_did,
    publisher_service, valid_publish_request_data, mock_public_key_object
):
    mock_deserialize_pem.return_value = mock_public_key_object
    mock_pk_to_did.return_value = MOCK_DIFFERENT_DID # Simulate DID mismatch

    with pytest.raises(HTTPException) as exc_info:
        publisher_service.publish_new_content(valid_publish_request_data)

    assert exc_info.value.status_code == 400
    assert "Provided DID does not match public key." in exc_info.value.detail
    mock_deserialize_pem.assert_called_once_with(MOCK_PUBLIC_KEY_PEM)
    mock_public_key_object.public_bytes_raw.assert_called_once()
    mock_pk_to_did.assert_called_once_with(b"mock_public_key_bytes_32_longg")


def test_get_published_content_by_hash_found(publisher_service):
    mock_model = VerifiableContentModel(
        content="test", content_hash="found_hash", signature="sig", did="did",
        public_key_pem="pem", timestamp=datetime.now(timezone.utc)
    )
    publisher_service._published_data["found_hash"] = mock_model

    result = publisher_service.get_published_content_by_hash("found_hash")
    assert result == mock_model

def test_get_published_content_by_hash_not_found(publisher_service):
    result = publisher_service.get_published_content_by_hash("not_found_hash")
    assert result is None

def test_list_all_published_content_empty(publisher_service):
    result = publisher_service.list_all_published_content()
    assert result == []

def test_list_all_published_content_with_data(publisher_service):
    mock_model1 = VerifiableContentModel(
        content="test1", content_hash="hash1", signature="sig1", did="did1",
        public_key_pem="pem1", timestamp=datetime.now(timezone.utc)
    )
    mock_model2 = VerifiableContentModel(
        content="test2", content_hash="hash2", signature="sig2", did="did2",
        public_key_pem="pem2", timestamp=datetime.now(timezone.utc)
    )
    publisher_service._published_data = {"hash1": mock_model1, "hash2": mock_model2}

    result = publisher_service.list_all_published_content()
    assert len(result) == 2
    assert mock_model1 in result
    assert mock_model2 in result

# Test for _create_verifiable_content_entry directly (optional, as it's covered by publish_new_content)
@mock.patch('src.services.publisher_service.publisher_service.generate_content_hash')
@mock.patch('src.services.publisher_service.publisher_service.public_key_bytes_to_did_key')
@mock.patch('src.services.publisher_service.publisher_service.deserialize_public_key_from_pem')
def test_create_verifiable_content_entry_success(
    mock_deserialize_pem, mock_pk_to_did, mock_gen_hash,
    publisher_service, mock_public_key_object
):
    mock_deserialize_pem.return_value = mock_public_key_object
    mock_pk_to_did.return_value = MOCK_CALCULATED_DID
    mock_gen_hash.return_value = MOCK_CONTENT_HASH

    # Convert MOCK_TIMESTAMP_STR back to datetime for the model
    dt_timestamp = datetime.fromisoformat(MOCK_TIMESTAMP_STR)

    entry = publisher_service._create_verifiable_content_entry(
        content_text=MOCK_CONTENT_TEXT,
        source_url=MOCK_SOURCE_URL,
        did_from_request=MOCK_DID,
        timestamp_from_request=MOCK_TIMESTAMP_STR, # Pass as string
        signature_from_request=MOCK_SIGNATURE,
        public_key_pem_from_request=MOCK_PUBLIC_KEY_PEM
    )
    assert entry.content == MOCK_CONTENT_TEXT
    assert entry.content_hash == MOCK_CONTENT_HASH
    assert entry.did == MOCK_DID
    assert entry.timestamp == dt_timestamp # VerifiableContentModel expects datetime
    assert entry.public_key_pem == MOCK_PUBLIC_KEY_PEM