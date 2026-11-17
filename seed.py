"""
seed.py — Populates the database with sample data for development and demo.
Run once after starting the app for the first time:
    python seed.py

Creates:
  - 2 Wards
  - 3 Departments
  - 6 Officers (2 per dept: 1 officer + 1 supervisor, plus 1 commissioner)
  - Routing rules for all categories × wards
"""

from database import SessionLocal, init_db
from models.ward import Ward, RoutingRule
from models.department import Department, Officer

init_db()
db = SessionLocal()

# --- Wards ---
ward1 = Ward(name="Ward 1 - Central", city="CivicCity")
ward2 = Ward(name="Ward 2 - North", city="CivicCity")
db.add_all([ward1, ward2])
db.flush()

# --- Departments ---
dept_roads = Department(name="Roads & Infrastructure", contact_email="roads@civic.gov")
dept_water = Department(name="Water & Sanitation", contact_email="water@civic.gov")
dept_power = Department(name="Electricity & Lighting", contact_email="power@civic.gov")
db.add_all([dept_roads, dept_water, dept_power])
db.flush()

# --- Commissioner (shared across departments) ---
commissioner = Officer(
    name="Commissioner Rajan",
    email="commissioner@civic.gov",
    phone="9000000001",
    role="commissioner",
    department_id=dept_roads.id,
    ward_id=None,
    is_active=True,
)
db.add(commissioner)
db.flush()

# --- Officers for Roads ---
officer_roads = Officer(
    name="Officer Priya",
    email="priya@civic.gov",
    phone="9000000002",
    role="officer",
    department_id=dept_roads.id,
    ward_id=ward1.id,
)
supervisor_roads = Officer(
    name="Supervisor Arjun",
    email="arjun@civic.gov",
    phone="9000000003",
    role="supervisor",
    department_id=dept_roads.id,
    ward_id=None,
)

# --- Officers for Water ---
officer_water = Officer(
    name="Officer Meena",
    email="meena@civic.gov",
    phone="9000000004",
    role="officer",
    department_id=dept_water.id,
    ward_id=ward1.id,
)
supervisor_water = Officer(
    name="Supervisor Kiran",
    email="kiran@civic.gov",
    phone="9000000005",
    role="supervisor",
    department_id=dept_water.id,
    ward_id=None,
)

# --- Officers for Power ---
officer_power = Officer(
    name="Officer Suresh",
    email="suresh@civic.gov",
    phone="9000000006",
    role="officer",
    department_id=dept_power.id,
    ward_id=ward2.id,
)
supervisor_power = Officer(
    name="Supervisor Divya",
    email="divya@civic.gov",
    phone="9000000007",
    role="supervisor",
    department_id=dept_power.id,
    ward_id=None,
)

db.add_all([
    officer_roads, supervisor_roads,
    officer_water, supervisor_water,
    officer_power, supervisor_power,
])
db.flush()

# --- Routing Rules ---
# Map: (category, ward) → (dept, officer, supervisor, commissioner)
routing_rules = [
    # Ward 1
    RoutingRule(category="Road Damage",   ward_id=ward1.id, department_id=dept_roads.id,
                assigned_officer_id=officer_roads.id, supervisor_id=supervisor_roads.id,
                commissioner_id=commissioner.id),
    RoutingRule(category="Water Supply",  ward_id=ward1.id, department_id=dept_water.id,
                assigned_officer_id=officer_water.id, supervisor_id=supervisor_water.id,
                commissioner_id=commissioner.id),
    RoutingRule(category="Sanitation",    ward_id=ward1.id, department_id=dept_water.id,
                assigned_officer_id=officer_water.id, supervisor_id=supervisor_water.id,
                commissioner_id=commissioner.id),
    RoutingRule(category="Electricity",   ward_id=ward1.id, department_id=dept_power.id,
                assigned_officer_id=officer_power.id, supervisor_id=supervisor_power.id,
                commissioner_id=commissioner.id),
    RoutingRule(category="Street Light",  ward_id=ward1.id, department_id=dept_power.id,
                assigned_officer_id=officer_power.id, supervisor_id=supervisor_power.id,
                commissioner_id=commissioner.id),
    RoutingRule(category="Garbage",       ward_id=ward1.id, department_id=dept_water.id,
                assigned_officer_id=officer_water.id, supervisor_id=supervisor_water.id,
                commissioner_id=commissioner.id),
    RoutingRule(category="Park & Garden", ward_id=ward1.id, department_id=dept_roads.id,
                assigned_officer_id=officer_roads.id, supervisor_id=supervisor_roads.id,
                commissioner_id=commissioner.id),
    # Ward 2
    RoutingRule(category="Road Damage",   ward_id=ward2.id, department_id=dept_roads.id,
                assigned_officer_id=officer_roads.id, supervisor_id=supervisor_roads.id,
                commissioner_id=commissioner.id),
    RoutingRule(category="Water Supply",  ward_id=ward2.id, department_id=dept_water.id,
                assigned_officer_id=officer_water.id, supervisor_id=supervisor_water.id,
                commissioner_id=commissioner.id),
    RoutingRule(category="Electricity",   ward_id=ward2.id, department_id=dept_power.id,
                assigned_officer_id=officer_power.id, supervisor_id=supervisor_power.id,
                commissioner_id=commissioner.id),
    RoutingRule(category="Street Light",  ward_id=ward2.id, department_id=dept_power.id,
                assigned_officer_id=officer_power.id, supervisor_id=supervisor_power.id,
                commissioner_id=commissioner.id),
    RoutingRule(category="Garbage",       ward_id=ward2.id, department_id=dept_water.id,
                assigned_officer_id=officer_water.id, supervisor_id=supervisor_water.id,
                commissioner_id=commissioner.id),
    RoutingRule(category="Sanitation",    ward_id=ward2.id, department_id=dept_water.id,
                assigned_officer_id=officer_water.id, supervisor_id=supervisor_water.id,
                commissioner_id=commissioner.id),
    RoutingRule(category="Park & Garden", ward_id=ward2.id, department_id=dept_roads.id,
                assigned_officer_id=officer_roads.id, supervisor_id=supervisor_roads.id,
                commissioner_id=commissioner.id),
]

db.add_all(routing_rules)
db.commit()

# Capture names before closing session
ward_names = f"{ward1.name}, {ward2.name}"
dept_names = f"{dept_roads.name}, {dept_water.name}, {dept_power.name}"
commissioner_name = commissioner.name

db.close()

print("✅ Seed complete!")
print(f"   Wards:          {ward_names}")
print(f"   Departments:    {dept_names}")
print(f"   Officers:       6 field officers + supervisors")
print(f"   Commissioner:   {commissioner_name}")
print(f"   Routing rules:  {len(routing_rules)}")
