"""
models/department.py — Department and Officer tables.
"""

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Department(Base):
    __tablename__ = "departments"

    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(150), nullable=False, unique=True)
    contact_email = Column(String(200), nullable=True)

    # Relationships
    officers      = relationship("Officer", back_populates="department")
    routing_rules = relationship("RoutingRule", back_populates="department")
    issues        = relationship("Issue", back_populates="department")


class Officer(Base):
    """
    Represents any staff member: field officer, supervisor, or commissioner.
    Role distinguishes their level in the escalation chain.
    """
    __tablename__ = "officers"

    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(150), nullable=False)
    email         = Column(String(200), nullable=True)
    phone         = Column(String(20), nullable=True)
    role          = Column(String(50), nullable=False, default="officer")
    # role values: "officer" | "supervisor" | "commissioner"
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    ward_id       = Column(Integer, ForeignKey("wards.id"), nullable=True)
    is_active     = Column(Boolean, default=True)

    # Relationships
    department = relationship("Department", back_populates="officers")
    ward       = relationship("Ward", back_populates="officers")
