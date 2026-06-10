from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, Base, SessionLocal
from models import Empresa, Usuario, Chamado, MensagemChamado
from dependencies import get_current_user
from schemas import EmpresaCreate

from auth import verify_password, create_access_token

app = FastAPI()

# =========================
# CORS
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# Criar tabelas
# =========================
Base.metadata.create_all(bind=engine)

# =========================
# DB Session
# =========================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# =========================
# Home
# =========================
@app.get("/")
def home():
    return {"message": "Technoblade API Online"}

# =========================
# Login
# =========================
@app.post("/login")
def login(data: dict, db: Session = Depends(get_db)):
    username = data.get("username")
    password = data.get("password")

    user = (
        db.query(Usuario)
        .filter(Usuario.username == username)
        .first()
    )

    if not user:
        return {
            "success": False,
            "message": "Usuário inválido"
        }

    if not verify_password(password, user.password_hash):
        return {
            "success": False,
            "message": "Senha inválida"
        }

    token = create_access_token(
        {
            "sub": user.username,
            "role": user.role,
            "empresa_id": user.empresa_id,
        }
    )

    return {
        "success": True,
        "token": token,
        "username": user.username,
        "role": user.role,
    }

@app.get("/me")
def me(user = Depends(get_current_user)):
    return {
        "id": user.id,
        "username": user.username,
        "role": user.role,
        "empresa_id": user.empresa_id,
    }

@app.post("/empresas")
def criar_empresa(
    data: EmpresaCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    
    if current_user.role != "ti":
        raise HTTPException(
            status_code=403,
            detail="Somente TI pode criar empresas"
        )

    existe = (
        db.query(Empresa)
        .filter(Empresa.slug == data.slug)
        .first()
    )

    if existe:
        raise HTTPException(
            status_code=400,
            detail="Empresa já existe"
        )

    empresa = Empresa(
        nome=data.nome,
        slug=data.slug
    )

    db.add(empresa)
    db.commit()
    db.refresh(empresa)

    return empresa