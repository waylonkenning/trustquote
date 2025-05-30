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
            *   Verify JWS signature in `vc.proof.jws` using `jwt.decode()` from `python-jose` to support detached payloads (ES256 algorithm assumed for P-256 keys). The signed payload is the canonicalized VC object excluding the `proof`.
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
            *   Verify JWS signature in `vc.proof.jws` using `jwt.decode()` from `python-jose` to support detached payloads (ES256 algorithm assumed for P-256 keys). The signed payload is the canonicalized VC object excluding the `proof`.
            *   Validate `vc.issuer` DID against the public key used for signature verification (derived from `public_key_pem` provided in the request).
            *   Extract `content_text` and `source_url` from `vc.credentialSubject`.
        *   Added `python-jose[cryptography]` to `requirements.txt` for JWS processing and installed it.
    *   Implications: The publisher endpoint now expects a full VC. Error handling for invalid VCs, signature failures, and DID mismatches is incorporated into the service layer.
*   [2025-05-28 08:02:32] - Modified [`static/js/app.js`](static/js/app.js:1) in the `createAndPublishVerifiableInformation` function. The `fetch` call to `/api/v1/publisher/` now sends the Verifiable Credential (VC) nested under the key `verifiable_credential` in the request body (i.e., `JSON.stringify({ verifiable_credential: vcObject })`).
    *   Rationale: To align the client-side request payload with the backend Pydantic model expectation (`PublishContentRequestSchema`), resolving a 422 Unprocessable Content error. The backend expects the VC to be under a specific key.
    *   Implications: The frontend request to the publisher endpoint should now be correctly processed by the backend.
*   [2025-05-28 09:01:24] - Added `base58` to [`requirements.txt`](requirements.txt:1) to resolve `ModuleNotFoundError` on Vercel.
    *   Rationale: The application was failing due to the missing `base58` dependency, which is imported in [`src/core/crypto/crypto_utils.py`](src/core/crypto/crypto_utils.py:7).
    *   Implications: Vercel build process should now install `base58`, resolving the runtime error.
*   [2025-05-28 14:44:20] - Changed `json.dumps` in [`src/services/publisher_service/publisher_service.py`](src/services/publisher_service/publisher_service.py:65) to use `ensure_ascii=True`.
    *   Rationale: To align server-side JWS payload canonicalization with client-side behavior where non-ASCII characters are escaped, resolving a signature mismatch.
    *   Implications: The server will now escape non-ASCII characters in the JSON payload before signing, matching the client's canonicalization.
*   [2025-05-28 14:57:00] - Modified `jwt.decode` options in [`src/services/publisher_service/publisher_service.py`](src/services/publisher_service/publisher_service.py:85) to disable default JWT claim verification (e.g., `exp`, `aud`) for Verifiable Credential payloads. Options `verify_aud`, `verify_iat`, `verify_exp`, `verify_nbf`, `verify_iss`, `verify_sub`, `verify_jti` set to `False`.
    *   Rationale: To prevent `python-jose` from rejecting Verifiable Credentials that lack standard JWT claims, resolving "JWS signature verification failed" errors when canonicalized payloads match.
    *   Implications: The JWS signature is still verified, but the application no longer enforces the presence or validity of standard JWT claims within the VC payload itself.
*   [2025-05-28 15:28:00] - Modified JWS verification in [`src/services/publisher_service/publisher_service.py`](src/services/publisher_service/publisher_service.py:65) to use `ensure_ascii=False` in `json.dumps` for canonicalization. Cleaned up JWS header decoding.
    *   Rationale: To ensure server-side JWS payload canonicalization correctly handles UTF-8 characters, matching the client-side `JSON.stringify()` behavior which does not escape non-ASCII characters by default. This addresses potential signature mismatches when non-ASCII characters are present.
    *   Implications: JWS signature verification should now be consistent between client and server, regardless of non-ASCII characters in the payload.