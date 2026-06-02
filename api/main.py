import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.auth import router as auth_router
from routes.plants import router as plants_router

app = FastAPI(title="Rootly API", docs_url="/docs")

_origins = os.getenv("CORS_ORIGINS", "http://localhost").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(plants_router)


@app.get("/health")
def health():
    return {"status": "ok"}
