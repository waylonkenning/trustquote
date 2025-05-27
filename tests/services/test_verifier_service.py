import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime, timezone
import base64
import json

from src.services.verifier_service.verifier_service import VerifierService
from src.core.schemas.schemas import VerificationRequestSchema, VerificationResultSchema
from src.core.crypto.crypto_utils import (
    generate_ed25519_key_pair, 
    sign_message, 
    generate_content_hash,
    deserialize_public_key_from_pem
)
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ed25519

# Helper to generate keys for testing
@pytest.fixture(scope="module")
def test_keys():
    priv_key, pub_key = generate_ed25519_key_pair()
    public_key_pem = pub_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode('utf-8')
    private_key_bytes = priv_key.private_bytes(
        encoding=serialization.Encoding.Raw,
        format=serialization.PrivateFormat.Raw,
        encryption_algorithm=serialization.NoEncryption()
    )
    return {"private_key_bytes": private_key_bytes, "public_key_pem": public_key_pem, "public_key_obj": pub_key}

@pytest.fixture
def verifier_service():
    return VerifierService(verifier_id="test_verifier_001")

@pytest.fixture
def sample_payload_dict():
    return {
        "content_text": "This is a test content.",
        "source_url": "http://example.com/content",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "did": "did:example:12345"
    }

@pytest.fixture
def canonical_json_and_hash(sample_payload_dict):
    canonical_string = json.dumps(sample_payload_dict, sort_keys=True, separators=(',', ':'))
    content_hash = generate_content_hash(canonical_string.encode('utf-8'))
    return canonical_string, content_hash

@pytest.fixture
def valid_signature(test_keys, canonical_json_and_hash):
    canonical_string, _ = canonical_json_and_hash
    signature_bytes = sign_message(test_keys["private_key_bytes"], canonical_string.encode('utf-8'))
    return base64.b64encode(signature_bytes).decode('utf-8')

@pytest.fixture
def valid_verification_request(test_keys, sample_payload_dict, canonical_json_and_hash, valid_signature):
    _, content_hash = canonical_json_and_hash
    return VerificationRequestSchema(
        public_key_pem=test_keys["public_key_pem"],
        original_content_text=sample_payload_dict["content_text"],
        source_url=sample_payload_dict["source_url"],
        timestamp=sample_payload_dict["timestamp"],
        did=sample_payload_dict["did"],
        original_content_hash=content_hash,
        original_signature=valid_signature
    )

def test_verify_successful(verifier_service, valid_verification_request, test_keys, canonical_json_and_hash):
    """Test successful verification."""
    _, expected_hash = canonical_json_and_hash
    
    with patch('src.services.verifier_service.verifier_service.datetime') as mock_datetime:
        mock_now = datetime(2023, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
        mock_datetime.now.return_value = mock_now

        result = verifier_service.verify(valid_verification_request)

        assert result.status == "VALID"
        assert result.is_content_hash_match is True
        assert result.is_signature_valid is True
        assert result.content_hash_checked == expected_hash
        assert result.verification_timestamp == mock_now
        assert result.verifier_id == "test_verifier_001"
        assert result.error_message is None

def test_verify_invalid_public_key_format(verifier_service, valid_verification_request):
    """Test verification with an invalid public key PEM format."""
    request_data = valid_verification_request.model_copy()
    request_data.public_key_pem = "INVALID_PEM_CONTENT"
    
    with patch('src.services.verifier_service.verifier_service.datetime') as mock_datetime:
        mock_now = datetime(2023, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
        mock_datetime.now.return_value = mock_now

        result = verifier_service.verify(request_data)

        assert result.status == "INVALID_PUBLIC_KEY"
        assert result.is_content_hash_match is False
        assert result.is_signature_valid is False
        assert result.error_message == "Invalid public key format."
        assert result.verification_timestamp == mock_now

@patch('src.services.verifier_service.verifier_service.crypto_utils.deserialize_public_key_from_pem')
def test_verify_public_key_deserialization_error(mock_deserialize, verifier_service, valid_verification_request):
    """Test error during public key deserialization."""
    mock_deserialize.side_effect = Exception("Deserialization failed")
    
    with patch('src.services.verifier_service.verifier_service.datetime') as mock_datetime:
        mock_now = datetime(2023, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
        mock_datetime.now.return_value = mock_now
        result = verifier_service.verify(valid_verification_request)

        assert result.status == "VERIFICATION_ERROR"
        assert result.is_content_hash_match is False
        assert result.is_signature_valid is False
        assert "Error deserializing public key: Deserialization failed" in result.error_message
        assert result.verification_timestamp == mock_now

@patch('src.services.verifier_service.verifier_service.json.dumps')
def test_verify_canonical_json_error(mock_json_dumps, verifier_service, valid_verification_request):
    """Test error during canonical JSON payload creation."""
    mock_json_dumps.side_effect = TypeError("Cannot serialize")

    with patch('src.services.verifier_service.verifier_service.datetime') as mock_datetime:
        mock_now = datetime(2023, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
        mock_datetime.now.return_value = mock_now
        result = verifier_service.verify(valid_verification_request)
        
        assert result.status == "VERIFICATION_ERROR"
        assert result.is_content_hash_match is False
        assert result.is_signature_valid is False
        assert "Error creating canonical JSON payload: Cannot serialize" in result.error_message
        assert result.verification_timestamp == mock_now

@patch('src.services.verifier_service.verifier_service.crypto_utils.generate_content_hash')
def test_verify_generate_hash_error(mock_generate_hash, verifier_service, valid_verification_request):
    """Test error during content hash generation."""
    mock_generate_hash.side_effect = Exception("Hashing failed")

    with patch('src.services.verifier_service.verifier_service.datetime') as mock_datetime:
        mock_now = datetime(2023, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
        mock_datetime.now.return_value = mock_now
        result = verifier_service.verify(valid_verification_request)

        assert result.status == "VERIFICATION_ERROR"
        assert result.is_content_hash_match is False
        assert result.is_signature_valid is False
        assert "Error generating content hash: Hashing failed" in result.error_message
        assert result.verification_timestamp == mock_now

def test_verify_content_hash_mismatch(verifier_service, valid_verification_request):
    """Test verification when content hash does not match."""
    request_data = valid_verification_request.model_copy()
    request_data.original_content_hash = "tampered_hash_value"

    with patch('src.services.verifier_service.verifier_service.datetime') as mock_datetime:
        mock_now = datetime(2023, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
        mock_datetime.now.return_value = mock_now
        result = verifier_service.verify(request_data)

        assert result.status == "TAMPERED_CONTENT"
        assert result.is_content_hash_match is False
        assert result.is_signature_valid is False # Explicitly set to False
        assert result.error_message == "Content hash mismatch, content may have been tampered."
        assert result.verification_timestamp == mock_now

def test_verify_invalid_signature_base64(verifier_service, valid_verification_request):
    """Test verification with invalid base64 encoding for signature."""
    request_data = valid_verification_request.model_copy()
    request_data.original_signature = "this is not base64"

    with patch('src.services.verifier_service.verifier_service.datetime') as mock_datetime:
        mock_now = datetime(2023, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
        mock_datetime.now.return_value = mock_now
        result = verifier_service.verify(request_data)

        assert result.status == "INVALID_SIGNATURE"
        assert result.is_content_hash_match is True # Hash check passes before sig decode
        assert result.is_signature_valid is False
        assert result.error_message == "Invalid base64 encoding for signature."
        assert result.verification_timestamp == mock_now

@patch('src.services.verifier_service.verifier_service.base64.b64decode')
def test_verify_signature_decode_error(mock_b64decode, verifier_service, valid_verification_request):
    """Test error during signature decoding (not binascii.Error)."""
    mock_b64decode.side_effect = Exception("Decode error")

    with patch('src.services.verifier_service.verifier_service.datetime') as mock_datetime:
        mock_now = datetime(2023, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
        mock_datetime.now.return_value = mock_now
        result = verifier_service.verify(valid_verification_request)

        assert result.status == "VERIFICATION_ERROR"
        assert result.is_content_hash_match is True
        assert result.is_signature_valid is False
        assert "Error decoding signature: Decode error" in result.error_message
        assert result.verification_timestamp == mock_now

@patch('src.services.verifier_service.verifier_service.crypto_utils.deserialize_public_key_from_pem')
def test_verify_public_key_bytes_error(mock_deserialize, verifier_service, valid_verification_request):
    """Test error when getting public_bytes from key object."""
    mock_pub_key_obj = MagicMock(spec=ed25519.Ed25519PublicKey)
    mock_pub_key_obj.public_bytes.side_effect = Exception("Cannot get public bytes")
    mock_deserialize.return_value = mock_pub_key_obj
    
    with patch('src.services.verifier_service.verifier_service.datetime') as mock_datetime:
        mock_now = datetime(2023, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
        mock_datetime.now.return_value = mock_now
        result = verifier_service.verify(valid_verification_request)

        assert result.status == "VERIFICATION_ERROR"
        assert result.is_content_hash_match is True
        assert result.is_signature_valid is False
        assert "An unexpected error occurred during signature verification: Cannot get public bytes" in result.error_message
        assert result.verification_timestamp == mock_now

def test_verify_signature_verification_failed(verifier_service, valid_verification_request, test_keys):
    """Test when signature verification itself fails (crypto_utils.verify_signature returns False)."""
    # Create a request with a bad signature
    request_data = valid_verification_request.model_copy()
    request_data.original_signature = base64.b64encode(b"bad_signature_bytes").decode('utf-8')

    with patch('src.services.verifier_service.verifier_service.datetime') as mock_datetime:
        mock_now = datetime(2023, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
        mock_datetime.now.return_value = mock_now
        result = verifier_service.verify(request_data)

        assert result.status == "INVALID_SIGNATURE"
        assert result.is_content_hash_match is True
        assert result.is_signature_valid is False
        assert result.error_message == "Signature verification failed."
        assert result.verification_timestamp == mock_now

@patch('src.services.verifier_service.verifier_service.crypto_utils.verify_signature')
def test_verify_signature_unexpected_error(mock_verify_sig, verifier_service, valid_verification_request):
    """Test an unexpected error from crypto_utils.verify_signature."""
    mock_verify_sig.side_effect = Exception("Crypto verify blew up")

    with patch('src.services.verifier_service.verifier_service.datetime') as mock_datetime:
        mock_now = datetime(2023, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
        mock_datetime.now.return_value = mock_now
        result = verifier_service.verify(valid_verification_request)

        assert result.status == "VERIFICATION_ERROR"
        assert result.is_content_hash_match is True
        assert result.is_signature_valid is False
        assert "An unexpected error occurred during signature verification: Crypto verify blew up" in result.error_message
        assert result.verification_timestamp == mock_now