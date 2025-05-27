# Decision Log

This file records architectural and implementation decisions using a list format.
2025-05-26 18:33:49 - Log of updates made.

*
2025-05-26 18:35:49 - Logged initial architectural and technology stack decisions.

## Decision

*   [2025-05-26 18:35:49] - Defined initial project directory structure (`src`, `core`, `services`, `utils`, `docs`, `examples`, `tests`, `config`).
*   [2025-05-26 18:35:49] - Selected Python as the primary programming language.
*   [2025-05-26 18:35:49] - Identified initial core libraries: `cryptography`, `pysha3`/`py-multihash`, `ipfshttpclient`, `web3.py`/`ethers.py`.

*   [2025-05-26 19:02:11] - Added `fastapi` and `uvicorn[standard]` to project dependencies for REST API development.
*   [2025-05-27 21:04:47] - Configured FastAPI to serve static files from the "static" directory by mounting `StaticFiles`.
## Rationale

*   Project Structure: Standard layout for Python projects, promoting modularity and separation of concerns.
*   Python: Strong cryptography support, large ecosystem of libraries, good for rapid prototyping and scalability, readable.
*   Libraries: Chosen for their relevance to core project needs (cryptography, hashing, potential IPFS/blockchain integration).

## Implementation Details

*   Project structure will be created as empty directories initially.
*   Core libraries will be added to a `requirements.txt` or similar dependency management file as development begins.
*   [`README.md`](README.md:1) created to document these initial decisions.
*   [2025-05-27 22:35:36] - Implemented W3C Verifiable Credential (VC) creation in [`static/js/app.js`](static/js/app.js:1). The frontend now constructs the VC object, including `credentialSubject` from UI inputs, and sends the entire VC to the `/api/v1/publisher/` endpoint. The `proof.jws` field is a placeholder.
*   [2025-05-27 22:48:47] - Implemented JWS signing for Verifiable Credentials in [`static/js/app.js`](static/js/app.js:1). The `createAndPublishVerifiableInformation` function now retrieves the P-256 private key from localStorage, prepares the VC as a JWS payload, signs it using Web Crypto API (ES256), formats the signature as a JWS, and populates the `proof.jws` field. Helper functions for Base64URL encoding were added.
*   [2025-05-27 23:15:00] - Updated backend to process W3C Verifiable Credentials (VCs) for the `/api/v1/publisher/` endpoint.
    *   Rationale: Align backend with frontend updates sending VCs, enabling standardized and verifiable data submission.
    *   Implementation:
        *   Modified Pydantic schemas in [`src/core/schemas/schemas.py`](src/core/schemas/schemas.py:1) to define VC structure (`VerifiableCredentialSchema`, `VCProof`, etc.) and updated `PublishContentRequestSchema`.
        *   Updated [`src/api/publisher_router.py`](src/api/publisher_router.py:1) to use the new request schema.
        *   Overhauled [`src/services/publisher_service/publisher_service.py`](src/services/publisher_service/publisher_service.py:1) to:
            *   Extract VC from the request.
            *   Verify JWS signature in `vc.proof.jws` using `python-jose` (ES256 algorithm assumed for P-256 keys). The signed payload is the canonicalized VC object excluding the `proof`.
            *   Validate `vc.issuer` DID against the public key used for signature verification (derived from `public_key_pem` provided in the request).
            *   Extract `content_text` and `source_url` from `vc.credentialSubject`.
        *   Added `python-jose[cryptography]` to `requirements.txt` for JWS processing and installed it.
    *   Implications: The publisher endpoint now expects a full VC. Error handling for invalid VCs, signature failures, and DID mismatches is incorporated into the service layer.
*   [2025-05-27 23:15:00] - Updated backend to process W3C Verifiable Credentials (VCs) for the `/api/v1/publisher/` endpoint.
    *   Rationale: Align backend with frontend updates sending VCs, enabling standardized and verifiable data submission.
    *   Implementation:
        *   Modified Pydantic schemas in [`src/core/schemas/schemas.py`](src/core/schemas/schemas.py:1) to define VC structure (`VerifiableCredentialSchema`, `VCProof`, etc.) and updated `PublishContentRequestSchema`.
        *   Updated [`src/api/publisher_router.py`](src/api/publisher_router.py:1) to use the new request schema.
        *   Overhauled [`src/services/publisher_service/publisher_service.py`](src/services/publisher_service/publisher_service.py:1) to:
            *   Extract VC from the request.
            *   Verify JWS signature in `vc.proof.jws` using `python-jose` (ES256 algorithm assumed for P-256 keys). The signed payload is the canonicalized VC object excluding the `proof`.
            *   Validate `vc.issuer` DID against the public key used for signature verification (derived from `public_key_pem` provided in the request).
            *   Extract `content_text` and `source_url` from `vc.credentialSubject`.
        *   Added `python-jose[cryptography]` to `requirements.txt` for JWS processing and installed it.
    *   Implications: The publisher endpoint now expects a full VC. Error handling for invalid VCs, signature failures, and DID mismatches is incorporated into the service layer.
*   [2025-05-28 08:02:32] - Modified [`static/js/app.js`](static/js/app.js:1) in the `createAndPublishVerifiableInformation` function. The `fetch` call to `/api/v1/publisher/` now sends the Verifiable Credential (VC) nested under the key `verifiable_credential` in the request body (i.e., `JSON.stringify({ verifiable_credential: vcObject })`).
    *   Rationale: To align the client-side request payload with the backend Pydantic model expectation (`PublishContentRequestSchema`), resolving a 422 Unprocessable Content error. The backend expects the VC to be under a specific key.
    *   Implications: The frontend request to the publisher endpoint should now be correctly processed by the backend.