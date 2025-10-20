# app/api/v1/routers/professors.py
from fastapi import APIRouter, Depends
from typing import List
from app.services.professors_service import ProfessorsService, get_professors_service

router = APIRouter(prefix="/professors", tags=["professors"])

@router.get("/")
async def list_professors(
    service: ProfessorsService = Depends(get_professors_service),
):
    return await service.get_professors()
