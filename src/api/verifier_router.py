from fastapi import APIRouter, HTTPException, Depends
from src.core.schemas.schemas import VerificationRequestSchema, VerificationResultSchema
from src.services.verifier_service.verifier_service import VerifierService

router = APIRouter()

# Dependency for VerifierService
def get_verifier_service():
    return VerifierService()

@router.post("/verify", response_model=VerificationResultSchema)
async def verify_content(
    request: VerificationRequestSchema,
    verifier_service: VerifierService = Depends(get_verifier_service)
):
    """
    Verify the authenticity and integrity of content.
    """
    try:
        is_valid, message = await verifier_service.verify_content(
            did=request.did,
            content_id=request.content_id,
            signature=request.signature,
            signed_payload=request.signed_payload
        )
        return VerificationResultSchema(is_valid=is_valid, message=message)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Log the exception e for debugging
        raise HTTPException(status_code=500, detail="An unexpected error occurred during verification.")