from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class VerifiableContentModel(BaseModel):
    content: str
    content_hash: str  # e.g., "sha256:xyz789..."
    signature: str  # e.g., "Ed25519:abc123..."
    did: str # e.g., "did:key:zQ3sh..."
    public_key_pem: str # PEM format of the public key
    source_url: Optional[str] = None # URL of the original content
    timestamp: datetime
    algorithm: Optional[str] = "Ed25519"  # e.g., "Ed25519"
    version: Optional[str] = "1.0.0-did"  # e.g., "1.0"
    metadata: Optional[Dict[str, Any]] = None

class PublisherProfileModel(BaseModel):
    publisher_id: str
    name: Optional[str] = None
    description: Optional[str] = None
    public_key_pem: Optional[str] = None
    verification_methods: Optional[List[Dict[str, Any]]] = None
    reputation_score: Optional[float] = None
    affiliation: Optional[str] = None

class VerificationResultModel(BaseModel):
    content_hash_checked: str
    is_signature_valid: bool
    is_content_hash_match: bool
    verification_timestamp: datetime
    verifier_id: Optional[str] = None
    error_message: Optional[str] = None
    confidence_score: Optional[float] = None
    status: str  # e.g., "VALID", "INVALID_SIGNATURE"