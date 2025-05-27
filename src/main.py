from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from src.api.publisher_router import router as publisher_router
from src.api.verifier_router import router as verifier_router

app = FastAPI(
    title="Verifiable Information API",
    description="API for publishing and verifying information.",
    version="0.1.0",
)

app.include_router(publisher_router, prefix="/api/v1/publisher", tags=["Publisher"])
app.include_router(verifier_router, prefix="/api/v1/verifier", tags=["Verifier"])

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def read_index():
    with open("static/index.html") as f:
        return HTMLResponse(content=f.read(), status_code=200)