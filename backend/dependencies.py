from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Usuario

# =========================
# JWT CONFIG
# =========================
SECRET_KEY = "technoblade_secret_key"
ALGORITHM = "HS256"

security = HTTPBearer()

# =========================
# DB SESSION
# =========================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# =========================
# USUÁRIO LOGADO
# =========================
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        username = payload.get("sub")

        if not username:
            raise HTTPException(
                status_code=401,
                detail="Token inválido"
            )

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Token inválido"
        )

    user = (
        db.query(Usuario)
        .filter(Usuario.username == username)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Usuário não encontrado"
        )

    if not user.ativo:
        raise HTTPException(
            status_code=403,
            detail="Usuário desativado"
        )

    return user

# =========================
# SOMENTE TI
# =========================
def require_ti(
    current_user: Usuario = Depends(get_current_user)
):
    if current_user.role != "ti":
        raise HTTPException(
            status_code=403,
            detail="Acesso permitido apenas para TI"
        )

    return current_user

# =========================
# ADMIN E TI
# =========================
def require_admin(
    current_user: Usuario = Depends(get_current_user)
):
    if current_user.role not in ["admin", "ti"]:
        raise HTTPException(
            status_code=403,
            detail="Acesso permitido apenas para Admin"
        )

    return current_user

# =========================
# QUALQUER USUÁRIO LOGADO
# =========================
def require_auth(
    current_user: Usuario = Depends(get_current_user)
):
    return current_user