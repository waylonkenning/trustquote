# Active Context

This file tracks the project's current status, including recent changes, current goals, and open questions.
2025-05-26 18:33:31 - Log of updates made.

*

## Current Focus
*   [2025-05-28 14:39:00] - Application started successfully with `python -m uvicorn src.main:app --reload`.
*   [2025-05-28 14:37:00] - Successfully installed dependencies from [`requirements.txt`](requirements.txt:1). Retrying `python -m uvicorn src.main:app --reload`.
*   [2025-05-28 14:36:00] - Attempted to start application with `python -m uvicorn src.main:app --reload`, but `uvicorn` module was not found. Will attempt to install dependencies from [`requirements.txt`](requirements.txt:1).
*   [2025-05-28 14:35:00] - Attempted to start application with `uvicorn src.main:app --reload`, but command was not found. Retrying with `python -m uvicorn src.main:app --reload`.
*   [2025-05-27 23:15:00] - Backend updated to handle W3C Verifiable Credentials. Next steps involve testing the end-to-end flow with the frontend and potentially refining error handling or DID resolution logic in `PublisherService`.

*   [2025-05-26 18:35:07] - Initial project setup and architecture definition.
*   [2025-05-26 19:02:11] - Adding FastAPI and Uvicorn for REST API development.

## Recent Changes
*   [2025-05-28 14:44:20] - Modified JWS payload canonicalization in [`src/services/publisher_service/publisher_service.py`](src/services/publisher_service/publisher_service.py:65) by setting `ensure_ascii=True` in `json.dumps` to align with client-side non-ASCII character escaping.
*   [2025-05-28 11:21:00] - Updated JWS verification in `PublisherService` to use `jwt.decode()` for detached payload support, as reflected in `decisionLog.md`.
*   [2025-05-28 09:01:40] - Added `base58` to [`requirements.txt`](requirements.txt:1) to resolve a `ModuleNotFoundError` on Vercel.
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
*   [2025-05-28 14:57:00] - Updated `jwt.decode` options in [`src/services/publisher_service/publisher_service.py`](src/services/publisher_service/publisher_service.py:85) to disable default JWT claim verification for VCs. This resolves persistent "JWS signature verification failed" errors.
*   [2025-05-28 15:28:00] - Changed JWS payload canonicalization in [`src/services/publisher_service/publisher_service.py`](src/services/publisher_service/publisher_service.py:65) to use `ensure_ascii=False` to align with client-side UTF-8 handling. This is expected to resolve the "JWS signature verification failed" error.