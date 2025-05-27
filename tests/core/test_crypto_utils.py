import unittest
import hashlib
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives.serialization import (
    Encoding,
    PrivateFormat,
    PublicFormat,
    NoEncryption
)
from src.core.crypto.crypto_utils import (
    generate_content_hash,
    generate_ed25519_key_pair,
    sign_message,
    verify_signature,
    serialize_public_key_to_pem,
    deserialize_public_key_from_pem,
    serialize_private_key_to_pem,
    deserialize_private_key_from_pem,
    public_key_bytes_to_did_key
)

class TestCryptoUtils(unittest.TestCase):

    def test_generate_content_hash(self):
        content = "Hello, World!".encode('utf-8')
        expected_hash = hashlib.sha256(content).hexdigest()
        self.assertEqual(generate_content_hash(content), expected_hash)

    def test_generate_ed25519_key_pair(self):
        private_key, public_key = generate_ed25519_key_pair()
        self.assertIsInstance(private_key, ed25519.Ed25519PrivateKey)
        self.assertIsInstance(public_key, ed25519.Ed25519PublicKey)
        self.assertNotEqual(
            private_key.private_bytes(
                Encoding.Raw,
                PrivateFormat.Raw,
                NoEncryption()
            ),
            public_key.public_bytes(
                Encoding.Raw,
                PublicFormat.Raw
            )
        )

    def test_sign_verify_roundtrip(self):
        private_key, public_key = generate_ed25519_key_pair()
        message = "This is a test message.".encode('utf-8')
        
        # Serialize keys to raw bytes for signing and verification
        private_key_bytes = private_key.private_bytes(
            Encoding.Raw,
            PrivateFormat.Raw,
            NoEncryption()
        )
        public_key_bytes = public_key.public_bytes(
            Encoding.Raw,
            PublicFormat.Raw
        )
        
        signature = sign_message(private_key_bytes, message)
        self.assertTrue(verify_signature(public_key_bytes, message, signature))

    def test_verify_fails_different_message(self):
        private_key, public_key = generate_ed25519_key_pair()
        message1 = "Original message.".encode('utf-8')
        message2 = "Different message.".encode('utf-8')

        private_key_bytes = private_key.private_bytes(
            Encoding.Raw,
            PrivateFormat.Raw,
            NoEncryption()
        )
        public_key_bytes = public_key.public_bytes(
            Encoding.Raw,
            PublicFormat.Raw
        )

        signature = sign_message(private_key_bytes, message1)
        self.assertFalse(verify_signature(public_key_bytes, message2, signature))

    def test_verify_fails_different_public_key(self):
        private_key1, _ = generate_ed25519_key_pair()
        _, public_key2 = generate_ed25519_key_pair() # Different key pair
        message = "Test message for different public key.".encode('utf-8')

        private_key1_bytes = private_key1.private_bytes(
            Encoding.Raw,
            PrivateFormat.Raw,
            NoEncryption()
        )
        public_key2_bytes = public_key2.public_bytes( # Using the wrong public key
            Encoding.Raw,
            PublicFormat.Raw
        )
        
        signature = sign_message(private_key1_bytes, message)
        self.assertFalse(verify_signature(public_key2_bytes, message, signature))

    def test_verify_fails_tampered_signature(self):
        private_key, public_key = generate_ed25519_key_pair()
        message = "Test message for tampered signature.".encode('utf-8')

        private_key_bytes = private_key.private_bytes(
            Encoding.Raw,
            PrivateFormat.Raw,
            NoEncryption()
        )
        public_key_bytes = public_key.public_bytes(
            Encoding.Raw,
            PublicFormat.Raw
        )

        signature = sign_message(private_key_bytes, message)
        
        # Tamper the signature
        tampered_signature_list = list(signature)
        tampered_signature_list[0] = (tampered_signature_list[0] + 1) % 256 # Modify the first byte
        tampered_signature = bytes(tampered_signature_list)
        
        self.assertFalse(verify_signature(public_key_bytes, message, tampered_signature))

    def test_serialize_deserialize_public_key_pem(self):
        _, public_key = generate_ed25519_key_pair()
        pem_data = serialize_public_key_to_pem(public_key)
        self.assertIsInstance(pem_data, bytes)
        self.assertTrue(pem_data.startswith(b"-----BEGIN PUBLIC KEY-----"))
        
        deserialized_public_key = deserialize_public_key_from_pem(pem_data)
        self.assertIsInstance(deserialized_public_key, ed25519.Ed25519PublicKey)
        self.assertEqual(
            public_key.public_bytes(Encoding.Raw, PublicFormat.Raw),
            deserialized_public_key.public_bytes(Encoding.Raw, PublicFormat.Raw)
        )

    def test_serialize_deserialize_private_key_pem(self):
        private_key, _ = generate_ed25519_key_pair()
        pem_data = serialize_private_key_to_pem(private_key)
        self.assertIsInstance(pem_data, bytes)
        self.assertTrue(pem_data.startswith(b"-----BEGIN PRIVATE KEY-----"))

        deserialized_private_key = deserialize_private_key_from_pem(pem_data)
        self.assertIsInstance(deserialized_private_key, ed25519.Ed25519PrivateKey)
        self.assertEqual(
            private_key.private_bytes(Encoding.Raw, PrivateFormat.Raw, NoEncryption()),
            deserialized_private_key.private_bytes(Encoding.Raw, PrivateFormat.Raw, NoEncryption())
        )

    def test_hash_content_invalid_input(self):
        with self.assertRaises(ValueError):
            generate_content_hash("not bytes") # type: ignore

    def test_sign_message_invalid_private_key(self):
        message = b"test message"
        with self.assertRaises(ValueError):
            sign_message(b"not 32 bytes", message)
        with self.assertRaises(ValueError):
            sign_message("not bytes", message) # type: ignore

    def test_sign_message_invalid_message(self):
        private_key_bytes = b'\0' * 32
        with self.assertRaises(ValueError):
            sign_message(private_key_bytes, "not bytes") # type: ignore

    def test_verify_signature_invalid_public_key(self):
        message = b"test message"
        signature = b'\0' * 64
        self.assertFalse(verify_signature(b"not 32 bytes", message, signature))
        self.assertFalse(verify_signature("not bytes", message, signature)) # type: ignore

    def test_verify_signature_invalid_message(self):
        public_key_bytes = b'\0' * 32
        signature = b'\0' * 64
        self.assertFalse(verify_signature(public_key_bytes, "not bytes", signature)) # type: ignore

    def test_verify_signature_invalid_signature(self):
        public_key_bytes = b'\0' * 32
        message = b"test message"
        self.assertFalse(verify_signature(public_key_bytes, message, b"not 64 bytes"))
        self.assertFalse(verify_signature(public_key_bytes, message, "not bytes")) # type: ignore

    def test_public_key_bytes_to_did_key(self):
        # Example from did:key spec
        public_key_hex = "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a"
        public_key_bytes = bytes.fromhex(public_key_hex)
        expected_did_key = "did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw"
        
        did_key_str = public_key_bytes_to_did_key(public_key_bytes)
        self.assertEqual(did_key_str, expected_did_key)

    def test_public_key_bytes_to_did_key_invalid_length(self):
        invalid_public_key_bytes_short = b'\x00' * 31
        invalid_public_key_bytes_long = b'\x00' * 33
        
        with self.assertRaisesRegex(ValueError, "Public key must be 32 bytes."):
            public_key_bytes_to_did_key(invalid_public_key_bytes_short)
            
        with self.assertRaisesRegex(ValueError, "Public key must be 32 bytes."):
            public_key_bytes_to_did_key(invalid_public_key_bytes_long)

if __name__ == '__main__':
    unittest.main()