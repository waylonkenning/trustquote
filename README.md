# Verifiable Credentials API

A FastAPI application for issuing and verifying simple verifiable credentials. This project aims to combat misinformation and deepfakes by establishing a robust framework for verifiable information, based on W3C Verifiable Credentials principles.

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Create and activate a virtual environment (recommended):**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

## Running the Application

To run the FastAPI application locally, use Uvicorn:

```bash
uvicorn src.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

## Technologies Used

-   **FastAPI:** For building the API.
-   **Pydantic:** For data validation and settings management.
-   **Cryptography:** For cryptographic operations.
-   **Uvicorn:** As the ASGI server.
-   **Python:** The primary programming language.