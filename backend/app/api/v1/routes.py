from fastapi import APIRouter

from app.api.v1.endpoints.professors import router as professors_router

routers = APIRouter()


router_list = [professors_router]

for router in router_list:
    router.tags = routers.tags.append("v1")
    routers.include_router(router)
