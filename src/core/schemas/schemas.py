from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from typing import List, Union # Added Union and List

# New Models for W3C Verifiable Credential
class VCDIDDocument(BaseModel):
    id: str
    type: Optional[str] = None # e.g., EcdsaSecp256k1VerificationKey2019
    controller: Optional[str] = None
    publicKeyPem: Optional[str] = None # Or publicKeyJwk, publicKeyMultibase etc.

class VCProof(BaseModel):
    type: str = Field(..., example="JsonWebSignature2020") # Or Ed25519Signature2018, EcdsaSecp256k1Signature2019 etc.
    created: str = Field(..., example="2024-05-27T10:00:00Z") # ISO8601 datetime
    verificationMethod: str = Field(..., example="did:key:zQ3sh...#keys-1")
    proofPurpose: Optional[str] = Field("assertionMethod", example="assertionMethod") # Or authentication, etc. Made optional with default
    jws: str = Field(..., example="eyJh...SflK") # The JWS signature string

class VerifiableCredentialSchema(BaseModel):
    context: Union[str, List[Union[str, Dict[str, Any]]]] = Field(..., alias="@context", example=["https://www.w3.org/2018/credentials/v1", "https://www.w3.org/2018/credentials/examples/v1"])
    id: Optional[str] = Field(None, example="http://example.edu/credentials/3732")
    type: List[str] = Field(..., example=["VerifiableCredential", "UniversityDegreeCredential"])
    issuer: Union[str, VCDIDDocument] = Field(..., example="did:key:zQ3sh...") # Can be a DID string or a DID Document
    issuanceDate: str = Field(..., example="2024-05-27T12:00:00Z") # ISO8601 datetime
    credentialSubject: Dict[str, Any] = Field(..., example={"id": "did:example:ebfeb1f712ebc6f1c276e12ec21", "degree": {"type": "BachelorDegree", "name": "Baccalauréat en musiques numériques"}})
    proof: VCProof

    class Config:
        populate_by_name = True # Allows use of alias '@context'
        json_schema_extra = {
            "example": {
                "@context": [
                    "https://www.w3.org/2018/credentials/v1",
                    "https://w3id.org/security/suites/jws-2020/v1"
                ],
                "id": "urn:uuid:some-unique-id",
                "type": ["VerifiableCredential", "PublishedContentCredential"],
                "issuer": "did:key:zQ3shokFTS3H2qPJ2DKXfXg1G2dG1Xa3a9s9y5b3H5PzE6rQ2",
                "issuanceDate": "2024-05-28T00:00:00Z",
                "credentialSubject": {
                    "content_text": "This is my new article about DIDs.",
                    "source_url": "https://myblog.com/dids-explained"
                },
                "proof": {
                    "type": "JsonWebSignature2020",
                    "created": "2024-05-28T00:00:00Z",
                    "verificationMethod": "did:key:zQ3shokFTS3H2qPJ2DKXfXg1G2dG1Xa3a9s9y5b3H5PzE6rQ2#zQ3shokFTS3H2qPJ2DKXfXg1G2dG1Xa3a9s9y5b3H5PzE6rQ2",
                    "proofPurpose": "assertionMethod",
                    "jws": "eyJhbGciOiJFUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..exampleSignature"
                }
            }
        }

class VerifiableContentSchema(BaseModel):
    """
    Represents a piece of content that has been cryptographically signed.
    This schema is used for API responses and reflects the VerifiableContentModel.
    """
    content: str = Field(..., title="Original Content", description="The actual text or data that was signed.", example="This is a sample news article.")
    content_hash: str = Field(..., title="Content Hash", description="The cryptographic hash (e.g., SHA-256) of the original content.", example="a1b2c3d4e5f6...")
    signature: str = Field(..., title="Digital Signature", description="The base64 encoded digital signature of the content_hash.", example="base64_encoded_signature_string")
    did: str = Field(..., title="Decentralized Identifier", description="The DID of the publisher (e.g., 'did:key:zQ3sh...').", example="did:key:zQ3sh...")
    public_key_pem: Optional[str] = Field(None, title="Public Key PEM", description="PEM-formatted public key associated with the DID.", example="-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----")
    source_url: Optional[str] = Field(None, title="Source URL", description="Optional URL of the original content source.", example="https://example.com/article/123")
    timestamp: datetime = Field(..., title="Publication Timestamp", description="The ISO 8601 timestamp indicating when the content was signed/published.", example="2023-10-26T12:00:00Z")
    algorithm: Optional[str] = Field(None, title="Signature Algorithm", description="The algorithm used for signing (e.g., 'Ed25519'). Inferred if not provided.", example="Ed25519")
    version: Optional[str] = Field(None, title="Schema Version", description="Version of this verifiable content schema, if applicable.", example="1.0.0")
    metadata: Optional[Dict[str, Any]] = Field(None, title="Additional Metadata", description="An optional dictionary for any other relevant metadata about the content.", example={"category": "news"})

    class Config:
        json_schema_extra = {
            "example": {
                "content": "This is an important announcement.",
                "content_hash": "abcdef1234567890...",
                "signature": "SGVsbG8gV29ybGQh...",
                "did": "did:key:zQ3shokFTS3H2qPJ2DKXfXg1G2dG1Xa3a9s9y5b3H5PzE6rQ2",
                "public_key_pem": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0p9pT...\n-----END PUBLIC KEY-----",
                "source_url": "https://example.com/article/123",
                "timestamp": "2024-01-15T10:30:00Z",
                "algorithm": "Ed25519",
                "version": "1.0",
                "metadata": {"tags": ["urgent", "official"]}
            }
        }
class PublishContentRequestSchema(BaseModel):
    """
    Schema for a request to publish new verifiable content using a W3C Verifiable Credential.
    """
    verifiable_credential: VerifiableCredentialSchema = Field(..., description="The W3C Verifiable Credential containing the content and proof.")
    # The public_key_pem might still be needed if not reliably derivable or embedded in the VC's verificationMethod
    public_key_pem: Optional[str] = Field(None, title="Public Key PEM", description="PEM-formatted public key. Required if not embedded or derivable from the VC's verificationMethod.", example="-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----")

    class Config:
        json_schema_extra = {
            "example": {
                "verifiable_credential": VerifiableCredentialSchema.Config.json_schema_extra["example"],
                "public_key_pem": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0p9pT\n...\n-----END PUBLIC KEY-----"
            }
        }

class VerificationResultSchema(BaseModel):
    """
    Represents the outcome of a content verification process.
    It indicates whether the content's signature is valid and if the content matches its hash.
    """
    content_hash_checked: str = Field(..., title="Content Hash Checked", description="The content hash that was used for verification.", example="a1b2c3d4e5f6...")
    is_signature_valid: bool = Field(..., title="Signature Validity", description="True if the digital signature is cryptographically valid for the given content hash and public key.", example=True)
    is_content_hash_match: bool = Field(..., title="Content Hash Match", description="True if the hash of the provided content matches the 'content_hash' field in the verifiable content.", example=True)
    verification_timestamp: datetime = Field(..., title="Verification Timestamp", description="The ISO 8601 timestamp indicating when this verification was performed.", example="2023-10-26T12:05:00Z")
    status: str = Field(..., title="Verification Status", description="A human-readable status of the verification (e.g., 'VALID', 'INVALID_SIGNATURE', 'TAMPERED_CONTENT').", example="VALID")
    verifier_id: Optional[str] = Field(None, title="Verifier ID", description="An optional identifier for the entity that performed the verification.", example="verifier_service_instance_01")
    error_message: Optional[str] = Field(None, title="Error Message", description="Details of any error that occurred during verification, if applicable.", example="Public key format is invalid.")
    confidence_score: Optional[float] = Field(None, title="Confidence Score", description="An optional score (0.0 to 1.0) indicating the verifier's confidence in the result, if applicable.", example=0.95)

    class Config:
        json_schema_extra = {
            "example": {
                "content_hash_checked": "abcdef1234567890...",
                "is_signature_valid": True,
                "is_content_hash_match": True,
                "verification_timestamp": "2024-01-15T10:35:00Z",
                "status": "VALID",
                "verifier_id": "verifier_main_instance",
                "error_message": None,
                "confidence_score": 0.99
            }
        }

class VerificationRequestSchema(BaseModel):
    """
    Represents a request to verify a piece of content using its components.
    """
    did: str = Field(..., title="Publisher DID", description="The DID of the original publisher.", example="did:key:zQ3sh...")
    source_url: Optional[str] = Field(None, title="Source URL", description="Optional URL of the original content source.", example="https://example.com/article/123")
    original_content_text: str = Field(..., title="Original Content Text", description="The original text of the content to be verified.", example="This is the article content.")
    original_content_hash: str = Field(..., title="Original Content Hash", description="The hash of the original content that was signed.", example="a1b2c3d4e5f6...")
    original_signature: str = Field(..., title="Original Signature", description="The base64 encoded signature to be verified.", example="base64_signature_string")
    public_key_pem: str = Field(..., title="Public Key PEM", description="PEM-formatted public key used for verification.", example="-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----")
    timestamp: str = Field(..., title="Original Timestamp", description="The ISO 8601 timestamp from the original signed payload.", example="2023-10-26T12:00:00Z")

    class Config:
        json_schema_extra = {
            "example": {
                "did": "did:key:zQ3shokFTS3H2qPJ2DKXfXg1G2dG1Xa3a9s9y5b3H5PzE6rQ2",
                "source_url": "https://example.com/article/123",
                "original_content_text": "This is the article content.",
                "original_content_hash": "a1b2c3d4e5f6789...",
                "original_signature": "ewoJImNvbnRlbnRfY...",
                "public_key_pem": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0p9pT\n...\n-----END PUBLIC KEY-----",
                "timestamp": "2023-10-26T12:00:00Z"
            }
        }