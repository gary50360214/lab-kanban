from fastapi import FastAPI

app = FastAPI(
    title="ND2A33 Backend",
    description="Internal Department Tool API"
)


@app.get("/")
def root():
    return {
        "message": "ND2A33 backend is running"
    }


@app.get("/health")
def health():
    return {
        "status": "OK"
    }
