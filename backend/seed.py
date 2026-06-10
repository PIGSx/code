from database import SessionLocal
from models import Empresa, Usuario

from werkzeug.security import generate_password_hash

db = SessionLocal()

# =========================
# EMPRESA
# =========================
empresa = Empresa(
    nome="Technoblade",
    slug="technoblade"
)

db.add(empresa)
db.commit()
db.refresh(empresa)

# =========================
# USUÁRIO ADMIN
# =========================
admin = Usuario(
    username="admin",
    password_hash=generate_password_hash("123456"),
    role="admin",
    empresa_id=empresa.id
)

db.add(admin)
db.commit()

print("✅ Empresa e usuário criados!")