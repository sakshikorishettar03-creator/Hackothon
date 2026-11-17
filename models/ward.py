"""
models/ward.py — Ward and RoutingRule tables.

Ward: A geographic/administrative division of the city.
RoutingRule: Maps (category + ward) → (department + officer + supervisor + commissioner).
"""

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Ward(Base):
    __tablename__ = "wards"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(100), nullable=False, unique=True)
    city       = Column(String(100), nullable=False, default="CivicCity")

    # Relationships
    routing_rules = relationship("RoutingRule", back_populates="ward")
    officers      = relationship("Officer", back_populates="ward")
    issues        = relationship("Issue", back_populates="ward_rel")


class RoutingRule(Base):
    """
    Defines which department/officer handles a given issue category in a given ward.
    Also stores the escalation chain: officer → supervisor → commissioner.
    """
    __tablename__ = "routing_rules"

    id                  = Column(Integer, primary_key=True, index=True)
    category            = Column(String(100), nullable=False)
    ward_id             = Column(Integer, ForeignKey("wards.id"), nullable=False)
    department_id       = Column(Integer, ForeignKey("departments.id"), nullable=False)
    assigned_officer_id = Column(Integer, ForeignKey("officers.id"), nullable=True)
    supervisor_id       = Column(Integer, ForeignKey("officers.id"), nullable=True)
    commissioner_id     = Column(Integer, ForeignKey("officers.id"), nullable=True)
    is_active           = Column(Boolean, default=True)

    # Relationships
    ward            = relationship("Ward", back_populates="routing_rules")
    department      = relationship("Department", back_populates="routing_rules")
    assigned_officer = relationship("Officer", foreign_keys=[assigned_officer_id])
    supervisor       = relationship("Officer", foreign_keys=[supervisor_id])
    commissioner     = relationship("Officer", foreign_keys=[commissioner_id])
