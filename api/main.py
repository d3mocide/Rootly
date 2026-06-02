from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routes.auth import router as auth_router
from routes.plants import router as plants_router
from routes.admin import router as admin_router

app = FastAPI(title="Rootly API", docs_url="/docs")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(plants_router)
app.include_router(admin_router)


@app.get("/health")
def health():
    return {"status": "ok"}
