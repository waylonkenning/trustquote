# Active Context

This file tracks the project's current status, including recent changes, current goals, and open questions.
2025-05-26 18:33:31 - Log of updates made.

*

## Current Focus
*   [2025-05-27 23:15:00] - Backend updated to handle W3C Verifiable Credentials. Next steps involve testing the end-to-end flow with the frontend and potentially refining error handling or DID resolution logic in `PublisherService`.

*   [2025-05-26 18:35:07] - Initial project setup and architecture definition.
*   [2025-05-26 19:02:11] - Adding FastAPI and Uvicorn for REST API development.

## Recent Changes
*   [2025-05-28 08:02:45] - Modified [`static/js/app.js`](static/js/app.js:1) to nest the Verifiable Credential under the `verifiable_credential` key in the payload sent to `/api/v1/publisher/`, resolving a 422 error.
*   [2025-05-27 23:15:00] - Updated backend (`schemas.py`, `publisher_router.py`, `publisher_service.py`) to accept and process W3C Verifiable Credentials. Added `python-jose` for JWS handling.

*   [2025-05-26 18:35:07] - Defined initial project directory structure.
*   [2025-05-26 18:35:07] - Recommended Python as the primary language with key libraries (`cryptography`, `pysha3`, `ipfshttpclient`, `web3.py`).
*   [2025-05-26 18:35:07] - Created initial `README.md` with project vision, architecture, structure, and technology stack.
*   [2025-05-27 18:22:03] - Created [`src/api/verifier_router.py`](src/api/verifier_router.py:1) with the FastAPI router for verifier operations.

*   [2025-05-27 21:04:47] - Updated [`src/main.py`](src/main.py:1) to serve static files from the `static` directory.
## Open Questions/Issues

*
2025-05-26 18:35:07 - Updated current focus and recent changes after initial project setup.
*   [2025-05-26 19:05:49] - Current Focus: Completed initial FastAPI setup with publisher and verifier endpoints.
*   [2025-05-26 19:05:49] - Recent Changes: Created [`src/main.py`](src/main.py:1), [`src/api/publisher_router.py`](src/api/publisher_router.py:1), [`src/api/verifier_router.py`](src/api/verifier_router.py:1), and [`src/api/__init__.py`](src/api/__init__.py:1). Updated [`src/core/crypto/crypto_utils.py`](src/core/crypto/crypto_utils.py:1) to include `serialization` import.
*   [2025-05-27 22:36:55] - Recent Changes: Modified [`static/js/app.js`](static/js/app.js:1) to construct and publish W3C Verifiable Credentials. The `createAndPublishVerifiableInformation` function now gathers credential subject data, builds the VC object, displays it in the UI, and sends it to the backend.
*   [2025-05-27 22:36:55] - Current Focus: Frontend implementation of Verifiable Credential creation and publishing.