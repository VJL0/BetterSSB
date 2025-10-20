from fastapi import FastAPI

# from core.config import settings

app = FastAPI()


@app.get("/")
def root():
    return "service is working"


# app.include_router(api_router, prefix=settings.API_V1_STR)
