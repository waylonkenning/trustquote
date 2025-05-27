import sys
from fastapi import APIRouter, HTTPException, Depends
from src.core.schemas.schemas import PublishContentRequestSchema, VerifiableContentSchema
from src.services.publisher_service.publisher_service import PublisherService

router = APIRouter(
    tags=["Publisher"],
)

async def get_publisher_service() -> PublisherService:
    """
    Dependency provider for PublisherService.
    In a real application, this might involve more complex instantiation
    or retrieval from a dependency injection container.
    """
    return PublisherService()

@router.post(
    "/",
    response_model=VerifiableContentSchema,
    summary="Publish new content",
    description="Accepts a W3C Verifiable Credential (VC) conforming to PublishContentRequestSchema, "
                "processes it using the PublisherService, and returns a "
                "VerifiableContentSchema (confirmation) or an error.",
    status_code=201 # Standard for successful POST creating a resource
)
async def publish_new_content(
    publish_request: PublishContentRequestSchema,
    service: PublisherService = Depends(get_publisher_service)
):
    """
    Handles the request to publish new content.

    - Validates the incoming data against `PublishContentRequestSchema` (which wraps a Verifiable Credential).
    - Uses `PublisherService` for the core publishing logic.
    - Returns `VerifiableContentSchema` on success.
    - Raises `HTTPException` for known errors (e.g., validation, service issues)
      or unexpected failures.
    """
    try:
        response_data = await service.publish_new_content(request_data=publish_request)
        return response_data
    except HTTPException as http_exc:
        # Re-raise HTTPException so FastAPI can handle it with its original status and detail
        raise http_exc
    except ValueError as ve:
        # This can catch other ValueErrors not already converted to HTTPException by the service
        print(f"ROUTER CAUGHT ValueError: Type: {type(ve)}, Args: {ve.args}, Str: {str(ve)}", file=sys.stderr)
        raise HTTPException(status_code=400, detail=f"Invalid input data: {str(ve)}")
    except Exception as e:
        # Catch any other unexpected exceptions
        print(f"ROUTER CAUGHT UNEXPECTED EXCEPTION: Type: {type(e)}, Args: {e.args}, Str: {str(e)}", file=sys.stderr)
        # import logging
        # logging.getLogger(__name__).error(f"Unexpected error publishing content: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An internal server error occurred processing the request.")