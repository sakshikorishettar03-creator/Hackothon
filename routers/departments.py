"""
routers/departments.py — Department and Officer endpoints.
Thin layer: validates input, delegates to service (or direct DB for simple CRUD).
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.department import Department, Officer
from schemas.department import DepartmentCreate, DepartmentOut, OfficerCreate, OfficerUpdate, OfficerOut
from schemas.common import APIResponse

router = APIRouter()


# ── Departments ──────────────────────────────────────────────────────────────

@router.get("/departments", response_model=APIResponse[List[DepartmentOut]])
def list_departments(db: Session = Depends(get_db)):
    depts = db.query(Department).all()
    return APIResponse(data=depts)


@router.post("/departments", response_model=APIResponse[DepartmentOut], status_code=201)
def create_department(payload: DepartmentCreate, db: Session = Depends(get_db)):
    dept = Department(**payload.model_dump())
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return APIResponse(data=dept, message="Department created")


@router.patch("/departments/{dept_id}", response_model=APIResponse[DepartmentOut])
def update_department(dept_id: int, payload: DepartmentCreate, db: Session = Depends(get_db)):
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(dept, field, value)
    db.commit()
    db.refresh(dept)
    return APIResponse(data=dept, message="Department updated")


@router.get("/departments/{dept_id}/officers", response_model=APIResponse[List[OfficerOut]])
def list_officers_in_dept(dept_id: int, db: Session = Depends(get_db)):
    officers = db.query(Officer).filter(Officer.department_id == dept_id).all()
    return APIResponse(data=officers)


# ── Officers ─────────────────────────────────────────────────────────────────

@router.post("/officers", response_model=APIResponse[OfficerOut], status_code=201)
def create_officer(payload: OfficerCreate, db: Session = Depends(get_db)):
    officer = Officer(**payload.model_dump())
    db.add(officer)
    db.commit()
    db.refresh(officer)
    return APIResponse(data=officer, message="Officer created")


@router.patch("/officers/{officer_id}", response_model=APIResponse[OfficerOut])
def update_officer(officer_id: int, payload: OfficerUpdate, db: Session = Depends(get_db)):
    officer = db.query(Officer).filter(Officer.id == officer_id).first()
    if not officer:
        raise HTTPException(status_code=404, detail="Officer not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(officer, field, value)
    db.commit()
    db.refresh(officer)
    return APIResponse(data=officer, message="Officer updated")
