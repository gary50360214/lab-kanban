from fastapi import FastAPI
from sqlalchemy import text
from .database import engine


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


@app.get("/db-health")
def db_health():

    try:

        with engine.connect() as connection:

            result = connection.execute(
                text("SELECT 1")
            )

            value = result.scalar()

        return {
            "status": "OK",
            "database": "connected",
            "result": value
        }

    except Exception as error:

        return {
            "status": "ERROR",
            "database": "connection_failed",
            "error": str(error)
        }
