# src/core/crypto/crypto_utils.py
import hashlib
from typing import Optional
from cryptography.hazmat.primitives.asymmetric import ed25519, ec
from cryptography.exceptions import InvalidSignature # Ensure this import is present
from cryptography.hazmat.primitives import serialization
import base58

def generate_content_hash(content: bytes) -> str:
    """Generates a SHA-256 hash of the content."""
    if not isinstance(content, bytes):
        raise ValueError("Content must be bytes.")
    return hashlib.sha256(content).hexdigest()

def generate_ed25519_key_pair() -> tuple:
    """Generates an Ed25519 private/public key pair."""
    private_key = ed25519.Ed25519PrivateKey.generate()
    public_key = private_key.public_key()
    return private_key, public_key

def sign_message(private_key_bytes: bytes, message: bytes) -> bytes:
    """Signs a message using an Ed25519 private key provided as bytes."""
    if not isinstance(private_key_bytes, bytes) or len(private_key_bytes) != 32:
        raise ValueError("Private key must be 32 bytes.")
    if not isinstance(message, bytes):
        raise ValueError("Message must be bytes.")
        
    private_key = ed25519.Ed25519PrivateKey.from_private_bytes(private_key_bytes)
    signature = private_key.sign(message)
    return signature

def verify_signature(public_key_bytes: bytes, message: bytes, signature: bytes) -> bool:
    """Verifies a signature using an Ed25519 public key provided as bytes."""
    if not isinstance(public_key_bytes, bytes) or len(public_key_bytes) != 32:
        # print("Debug: Public key bytes length issue or type.") # Optional debug
        # raise ValueError("Public key must be 32 bytes.") # Or just return False
        return False # Fail early if key format is wrong
    if not isinstance(message, bytes):
        # print("Debug: Message not bytes.") # Optional debug
        # raise ValueError("Message must be bytes.")
        return False
    if not isinstance(signature, bytes) or len(signature) != 64:
        # print("Debug: Signature length issue or type.") # Optional debug
        # raise ValueError("Signature must be 64 bytes.")
        return False # Fail early if signature format is wrong

    public_key = ed25519.Ed25519PublicKey.from_public_bytes(public_key_bytes)
    try:
        public_key.verify(signature, message)
        return True
    except InvalidSignature:
        return False
    except Exception as e:
        # For unexpected errors during verification, you might want to log them
        # print(f"Unexpected error during signature verification: {type(e).__name__} - {e}") # For debugging
        return False
def serialize_private_key_to_pem(private_key: ed25519.Ed25519PrivateKey) -> bytes:
    """Serializes an Ed25519PrivateKey object to PEM format."""
    return private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )

def serialize_public_key_to_pem(public_key: ed25519.Ed25519PublicKey) -> bytes:
    """Serializes an Ed25519PublicKey object to PEM format."""
    return public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )

def deserialize_private_key_from_pem(pem_data: str) -> ed25519.Ed25519PrivateKey:
    """Deserializes an Ed25519 private key from PEM format."""
    return serialization.load_pem_private_key(
        pem_data.encode('utf-8'),
        password=None
    )

def deserialize_public_key_from_pem(pem_data: str) -> ec.EllipticCurvePublicKey | ed25519.Ed25519PublicKey:
    """Deserializes a public key from PEM format (supports EC and Ed25519)."""
    return serialization.load_pem_public_key(pem_data.encode('utf-8'))

def public_key_bytes_to_did_key(public_key_bytes: bytes, public_key_object: Optional[object] = None) -> str:
    """
    Converts raw public key bytes into a did:key string.
    Supports Ed25519 and common Elliptic Curve keys (P-256/secp256r1).

    For Ed25519:
    - Uses multicodec 0xed01.
    - Expects 32 raw public key bytes.

    For P-256 (secp256r1) Elliptic Curve:
    - Uses multicodec 0x1200 (for uncompressed public key).
    - Expects 65 bytes for uncompressed public key (0x04 + X + Y).

    Args:
        public_key_bytes: The raw bytes of the public key.
        public_key_object: The cryptography public key object, used to determine type.

    Returns:
        The did:key string.

    Raises:
        ValueError: If key type is unsupported or byte length is incorrect for the type.
    """
    if public_key_object and isinstance(public_key_object, ed25519.Ed25519PublicKey):
        if not isinstance(public_key_bytes, bytes) or len(public_key_bytes) != 32:
            raise ValueError("Ed25519 public key must be 32 bytes.")
        MULTIKEY_PREFIX = b'\xed\x01' # Ed25519 multicodec prefix
        prefixed_key = MULTIKEY_PREFIX + public_key_bytes
    elif public_key_object and isinstance(public_key_object, ec.EllipticCurvePublicKey):
        if public_key_object.curve.name == 'secp256r1': # P-256
            # Expecting uncompressed key bytes (0x04 + x + y), typically 65 bytes
            if not isinstance(public_key_bytes, bytes) or len(public_key_bytes) != 65:
                 raise ValueError(f"P-256 (secp256r1) uncompressed public key must be 65 bytes, got {len(public_key_bytes)}.")
            MULTIKEY_PREFIX = b'\x12\x00' # P-256 (secp256r1) uncompressed public key multicodec prefix
            # The public_key_bytes for P-256 uncompressed already includes the 0x04 prefix.
            # The multicodec spec for did:key usually means prefixing the *value* of the key.
            prefixed_key = MULTIKEY_PREFIX + public_key_bytes
        # Add other curves here if needed, e.g., secp256k1 (0xe7 prefix, different byte expectations)
        # elif public_key_object.curve.name == 'secp256k1':
        #     # Compressed: 33 bytes (0x02/0x03 + x), Uncompressed: 65 bytes (0x04 + x + y)
        #     # did:key multicodec for secp256k1 is 0xe7
        #     # This example assumes you get the appropriate bytes for this (e.g. compressed)
        #     if not isinstance(public_key_bytes, bytes) or len(public_key_bytes) != 33: # Assuming compressed
        #         raise ValueError(f"secp256k1 compressed public key must be 33 bytes, got {len(public_key_bytes)}.")
        #     MULTIKEY_PREFIX = b'\xe7' # secp256k1 public key multicodec value
        #     prefixed_key = MULTIKEY_PREFIX + public_key_bytes
        else:
            raise ValueError(f"Unsupported Elliptic Curve: {public_key_object.curve.name}")
    elif isinstance(public_key_bytes, bytes) and len(public_key_bytes) == 32 and not public_key_object:
        # Fallback for old Ed25519 calls if public_key_object is not passed
        # This maintains backward compatibility for calls not yet updated
        MULTIKEY_PREFIX = b'\xed\x01'
        prefixed_key = MULTIKEY_PREFIX + public_key_bytes
    else:
        key_type_info = type(public_key_object).__name__ if public_key_object else "Unknown (no object provided)"
        raise ValueError(f"Unsupported public key type for DID generation or mismatched bytes. Type: {key_type_info}, Bytes length: {len(public_key_bytes)}")

    base58_encoded_bytes = base58.b58encode(prefixed_key)
    base58_encoded_str = base58_encoded_bytes.decode('utf-8')
    
    return f"did:key:z{base58_encoded_str}"