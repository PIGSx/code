# main.py — FastAPI unificada (login, materiais, rastreador/camera interativo, pendente)
# =========================================================
# main.py — Technoblade Unified API (FastAPI)
# =========================================================

import os
import uuid
import time
import json
import tempfile
import logging
import unicodedata
import re
import uvicorn
from pathlib import Path
from typing import List, Optional, Dict, Any

# -------------------- Third-party --------------------
import pandas as pd
from fastapi import (
    FastAPI,
    UploadFile,
    File,
    Form,
    HTTPException,
    Query,
    Header,
    Body,
    WebSocket,
    WebSocketDisconnect,
)
from fastapi.responses import (
    JSONResponse,
    StreamingResponse,
    Response,
    FileResponse,
)
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# -------------------- Selenium --------------------
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import TimeoutException, WebDriverException

class MensagemBody(BaseModel):
    texto: str

# ---------------- Config ----------------
LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")
logging.basicConfig(level=LOG_LEVEL, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("api")

TMP_DIR = Path(tempfile.gettempdir()) / "pendente_api"
TMP_DIR.mkdir(parents=True, exist_ok=True)

FILTERS_FILE = TMP_DIR / "filtros_salvos.json"
EXCEL_PATH = Path(os.path.dirname(__file__)) / "CODIGOS.xlsx"  # materiais

# ---------------- App ----------------
app = FastAPI(title="Technoblade Unified API (FastAPI)", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ajuste para produção: seu domínio React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Auth / Roles ----------------

allowed_credentials = {
    "jaya":  {"password": "697843", "role": "ti"},
    "hiury": {"password": "thebest", "role": "ti"},
    "renan": {"password": "renan2025", "role": "admin"},
    "p.henrique": {"password": "pead", "role": "admin"},
    "ana":   {"password": "deusa", "role": "admin"},
    "NovaSP":{"password": "cmnsp2025", "role": "comum"}
}

active_tokens = {}
TOKEN_EXPIRATION = 3600  # 1h

ROLE_LEVEL = {
    "comum": 1,
    "admin": 2,
    "ti": 3
}

def make_token(username: str, role: str) -> str:
    token = str(uuid.uuid4())
    active_tokens[token] = {
        "user": username,
        "role": role,
        "expira_em": time.time() + TOKEN_EXPIRATION
    }
    return token


def verify_token_header(auth_header: Optional[str]) -> Dict[str, Any]:
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token ausente")

    token = auth_header.split(" ", 1)[1]
    info = active_tokens.get(token)

    if not info:
        raise HTTPException(status_code=403, detail="Token inválido")

    if time.time() > info["expira_em"]:
        active_tokens.pop(token, None)
        raise HTTPException(status_code=403, detail="Token expirado")

    return info


def require_role(info: Dict[str, Any], minimum_role: str):
    user_role = info.get("role")
    if ROLE_LEVEL.get(user_role, 0) < ROLE_LEVEL.get(minimum_role, 0):
        raise HTTPException(status_code=403, detail="Permissão insuficiente")

# ---------------- Helpers de arquivos / excel ----------------
def save_uploaded_file(file: UploadFile) -> Path:
    file_id = str(uuid.uuid4())
    dest = TMP_DIR / f"{file_id}_{Path(file.filename).name}"
    with open(dest, "wb") as f:
        f.write(file.file.read())
    logger.info("Upload salvo: %s", dest)
    return dest

def read_workbook_sheets(path: Path) -> List[str]:
    xl = pd.ExcelFile(path)
    return xl.sheet_names

def make_response_file(df: pd.DataFrame, filename: str = "saida.xlsx"):
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx")
    df.to_excel(tmp.name, index=False)
    tmp.close()

    def iterfile():
        try:
            with open(tmp.name, "rb") as f:
                yield from f
        finally:
            try:
                os.remove(tmp.name)
            except Exception:
                logger.exception("Falha ao remover arquivo temporário: %s", tmp.name)

    headers = {"Content-Disposition": f'attachment; filename="{filename}"'}
    return StreamingResponse(iterfile(), media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers=headers)

def cleanup_temp_files(older_than_seconds: int = 60*60*24):
    now_ts = time.time()
    removed = 0
    for p in TMP_DIR.iterdir():
        try:
            if p.is_file():
                age = now_ts - p.stat().st_mtime
                if age > older_than_seconds:
                    p.unlink(missing_ok=True)
                    removed += 1
        except Exception:
            logger.exception("Erro ao limpar %s", p)
    logger.info("cleanup_temp_files removed=%d", removed)
    return removed

# ---------------- Routes - Auth ----------------
@app.post("/login")
def login(payload: Dict[str, str] = Body(...)):
    username = payload.get("username")
    password = payload.get("password")

    if not username or not password:
        raise HTTPException(status_code=400, detail="Usuário/senha ausentes")

    user = allowed_credentials.get(username)

    if not user or user["password"] != password:
        raise HTTPException(status_code=401, detail="Usuário ou senha inválidos")

    token = make_token(username, user["role"])

    return {
        "success": True,
        "token": token,
        "user": username,
        "role": user["role"]
    }


@app.post("/logout")
def logout(payload: Dict[str, str] = Body(...)):
    token = payload.get("token")
    if token and token in active_tokens:
        del active_tokens[token]
        return {"success": True, "message": "Logout realizado"}
    raise HTTPException(status_code=404, detail="Token não encontrado")


@app.get("/current_user")
def current_user(authorization: Optional[str] = Header(None)):
    info = verify_token_header(authorization)
    return {
        "logged_in": True,
        "user": info["user"],
        "role": info["role"]
    }


# ---------------- Routes - Materiais ----------------
@app.get("/materiais")
def listar_materiais():
    try:
        if not EXCEL_PATH.exists():
            raise HTTPException(status_code=404, detail="Arquivo de materiais não encontrado")
        df = pd.read_excel(EXCEL_PATH)
        df.columns = [c.strip() for c in df.columns]
        return df.to_dict(orient="records")
    except Exception as e:
        logger.exception("Erro listar_materiais: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload_materiais")
def upload_materiais(file: UploadFile = File(...), authorization: Optional[str] = Header(None)):
    info = verify_token_header(authorization)
    if info["role"] != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado")
    if not file.filename.lower().endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Arquivo inválido")
    try:
        dest = EXCEL_PATH
        with open(dest, "wb") as f:
            f.write(file.file.read())
        return {"message": "Planilha atualizada com sucesso ✅"}
    except Exception as e:
        logger.exception("Erro upload_materiais: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

# ---------------- Routes - Pendente (novo) ----------------




BASE_DIR = "files"
os.makedirs(BASE_DIR, exist_ok=True)


FILES_ORIGINAL: Dict[str, pd.DataFrame] = {}
FILES_FILTERED: Dict[str, pd.DataFrame] = {}
FILTERS = []

def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    def norm(col):
        col = unicodedata.normalize("NFKD", col)
        col = col.encode("ascii", "ignore").decode("ascii")
        col = col.lower().strip()
        col = re.sub(r"\s+", "_", col)
        return col

    df.columns = [norm(c) for c in df.columns]
    return df


# ===============================
# UPLOAD
# ===============================
@app.post("/pendente/upload")
async def pendente_upload(file: UploadFile = File(...)):
    try:
        df = pd.read_excel(file.file)
    except Exception:
        raise HTTPException(status_code=400, detail="Erro ao ler planilha")

    df = normalize_columns(df)

    required = ["contrato", "atc", "descricao_tss", "familia"]
    for col in required:
        if col not in df.columns:
            raise HTTPException(
                status_code=400,
                detail=f"Coluna obrigatória não encontrada: {col}"
            )

    file_id = str(uuid.uuid4())

    FILES_ORIGINAL[file_id] = df
    FILES_FILTERED[file_id] = df.copy()

    return {
        "file_id": file_id,
        "contratos": sorted(
            df["contrato"].dropna().astype(str).unique().tolist()
        ),
        "atcs": sorted(
            df["atc"]
            .dropna()
            .astype(str)
            .str.split("-")
            .str[0]
            .str.strip()
            .unique()
            .tolist()
        ),
        "familias": sorted(
            df["familia"].dropna().astype(str).unique().tolist()
        ),
        "descricoes": sorted(
            df["descricao_tss"].dropna().astype(str).unique().tolist()
        ),
    }


# ===============================
# FILTRAR
# ===============================
@app.post("/pendente/filter")
async def pendente_filter(payload: dict):
    file_id = payload.get("file_id")
    filtros = payload.get("filtros", {})

    if file_id not in FILES_ORIGINAL:
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")

    df = FILES_ORIGINAL[file_id].copy()

    if filtros.get("contratos"):
        df = df[df["contrato"].astype(str).isin(filtros["contratos"])]

    if filtros.get("atcs"):
        df["atc"] = (
            df["atc"]
            .astype(str)
            .str.split("-")
            .str[0]
            .str.strip()
        )
        df = df[df["atc"].isin(filtros["atcs"])]

    if filtros.get("familias"):
        df = df[df["familia"].astype(str).isin(filtros["familias"])]

    if filtros.get("descricoes"):
        df = df[df["descricao_tss"].astype(str).isin(filtros["descricoes"])]

    FILES_FILTERED[file_id] = df

    return {"linhas_resultantes": len(df)}


# ===============================
# FORMATAR / DOWNLOAD
# ===============================
@app.post("/pendente/format")
async def pendente_format(payload: dict):
    file_id = payload.get("file_id")

    if file_id not in FILES_FILTERED:
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")

    df = FILES_FILTERED[file_id]

    if df.empty:
        raise HTTPException(
            status_code=400,
            detail="Nenhum registro encontrado com os filtros aplicados"
        )

    output_path = os.path.join(BASE_DIR, f"{file_id}.xlsx")
    df.to_excel(output_path, index=False)

    return FileResponse(
        output_path,
        filename="pendente.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    

# ---------------- Routes - Rastreador ----------------
@app.post("/rastreador/abrir-site")
def rastreador_abrir_site(authorization: Optional[str] = Header(None)):
    info = verify_token_header(authorization)

    # admin OU ti
    if info["role"] not in ["admin", "ti"]:
        raise HTTPException(status_code=403, detail="Acesso negado")

    navegador = None

    try:
        options = webdriver.ChromeOptions()
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--window-size=1920,1080")

        navegador = webdriver.Chrome(options=options)
        navegador.get("https://web.hapolo.com.br/")

        wait = WebDriverWait(navegador, 30)

        campo_user = wait.until(
            EC.visibility_of_element_located((By.ID, "id_user"))
        )

        actions = ActionChains(navegador)
        actions.move_to_element(campo_user).click().perform()
        time.sleep(0.3)

        for letra in "psbltda":
            campo_user.send_keys(letra)
            time.sleep(0.05)

        campo_pass = navegador.find_element(By.ID, "id_password")
        actions.move_to_element(campo_pass).click().perform()
        time.sleep(0.3)

        for letra in "010203":
            campo_pass.send_keys(letra)
            time.sleep(0.05)

        campo_pass.send_keys(Keys.RETURN)

        wait.until(lambda d: "hapolo" in d.current_url.lower())

        return {
            "status": "success",
            "mensagem": "Login realizado. Navegador mantido aberto no servidor."
        }

    except Exception as e:
        logger.exception("Erro rastreador")
        raise HTTPException(status_code=500, detail=str(e))



# ---------------- Routes - Camera ----------------
@app.post("/camera/abrir")
def camera_abrir(authorization: Optional[str] = Header(None)):
    info = verify_token_header(authorization)

    if info["role"] not in ["admin", "ti"]:
        raise HTTPException(status_code=403, detail="Acesso negado")

    navegador = None

    try:
        options = webdriver.ChromeOptions()
        # NÃO usar headless
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--window-size=1920,1080")

        navegador = webdriver.Chrome(options=options)
        navegador.get("http://roaletelemetria.ddns.net:8070/login")

        wait = WebDriverWait(navegador, 30)

        campo_user = wait.until(
            EC.visibility_of_element_located((By.XPATH, '//*[@id="login"]'))
        )

        actions = ActionChains(navegador)
        actions.move_to_element(campo_user).click().perform()
        time.sleep(0.3)

        for letra in "globalsm":
            campo_user.send_keys(letra)
            time.sleep(0.05)

        campo_pass = wait.until(
            EC.visibility_of_element_located((By.XPATH, '//*[@id="password"]'))
        )

        actions.move_to_element(campo_pass).click().perform()
        time.sleep(0.3)

        for letra in "glob@l1qaz":
            campo_pass.send_keys(letra)
            time.sleep(0.05)

        campo_pass.send_keys(Keys.RETURN)

        # Aguarda login efetivo
        time.sleep(5)

        return {
            "status": "success",
            "mensagem": "Login realizado com sucesso. Navegador mantido aberto."
        }

    except Exception as e:
        logger.exception("Erro câmera: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

    # ❌ NÃO FECHAR O NAVEGADOR


# =====================================================================
# ======================= CHAMADOS (MEMÓRIA) ===========================
# =====================================================================

# =====================================================================
# ======================= STORE EM MEMÓRIA =============================
# =====================================================================

chamados_store: Dict[str, dict] = {}

# =====================================================================
# ======================= MODELS ======================================
# =====================================================================

class MensagemBody(BaseModel):
    texto: str

# =====================================================================
# ======================= ABRIR CHAMADO ================================
# =====================================================================

@app.post("/chamados")
def abrir_chamado(
    titulo: str = Body(...),
    categoria: str = Body(...),
    descricao: str = Body(...),
    authorization: Optional[str] = Header(None),
):
    info = verify_token_header(authorization)

    chamado_id = str(uuid.uuid4())

    # Quem deve ser notificado inicialmente
    nao_lido_por: List[str] = ["admin", "ti"]

    # Remove quem abriu da lista
    if info["role"] in nao_lido_por:
        nao_lido_por.remove(info["role"])

    chamados_store[chamado_id] = {
        "id": chamado_id,
        "titulo": titulo,
        "categoria": categoria,
        "descricao": descricao,
        "status": "Aberto",
        "autor": info["user"],
        "autor_role": info["role"],
        "mensagens": [],
        "criado_em": time.strftime("%Y-%m-%d %H:%M:%S"),
        "nao_lido_por": nao_lido_por,
    }

    return chamados_store[chamado_id]

# =====================================================================
# ======================= MEUS CHAMADOS ================================
# =====================================================================

@app.get("/meus-chamados")
def meus_chamados(authorization: Optional[str] = Header(None)):
    info = verify_token_header(authorization)

    return [
        c for c in chamados_store.values()
        if c["autor"] == info["user"]
    ]

# =====================================================================
# ======================= LISTAR TODOS =================================
# =====================================================================

@app.get("/chamados")
def listar_chamados(authorization: Optional[str] = Header(None)):
    info = verify_token_header(authorization)

    if info["role"] not in ["admin", "ti"]:
        raise HTTPException(403, "Acesso negado")

    return list(chamados_store.values())

# =====================================================================
# ======================= DETALHE DO CHAMADO ===========================
# =====================================================================

@app.get("/chamados/{chamado_id}")
def detalhe_chamado(
    chamado_id: str,
    authorization: Optional[str] = Header(None)
):
    info = verify_token_header(authorization)

    chamado = chamados_store.get(chamado_id)
    if not chamado:
        raise HTTPException(404, "Chamado não encontrado")

    # Autor pode ver o próprio
    if chamado["autor"] == info["user"]:
        return chamado

    # Admin e TI podem ver todos
    if info["role"] not in ["admin", "ti"]:
        raise HTTPException(403, "Acesso negado")

    return chamado

# =====================================================================
# ======================= RESPONDER CHAMADO ============================
# =====================================================================

@app.post("/chamados/{chamado_id}/mensagens")
def responder_chamado(
    chamado_id: str,
    body: MensagemBody,
    authorization: Optional[str] = Header(None),
):
    info = verify_token_header(authorization)

    chamado = chamados_store.get(chamado_id)
    if not chamado:
        raise HTTPException(404, "Chamado não encontrado")

    # ❌ ADMIN NÃO RESPONDE
    if info["role"] == "admin":
        raise HTTPException(403, "Admin não pode responder chamados")

    # Usuário comum só responde o próprio
    if info["role"] == "comum" and chamado["autor"] != info["user"]:
        raise HTTPException(403, "Acesso negado")

    mensagem = {
        "autor": info["user"],
        "role": info["role"],
        "texto": body.texto,
        "data": time.strftime("%Y-%m-%d %H:%M:%S"),
    }

    chamado["mensagens"].append(mensagem)

    # ================= NOTIFICAÇÕES =================

    # Remove quem respondeu
    if info["role"] in chamado["nao_lido_por"]:
        chamado["nao_lido_por"].remove(info["role"])

    if info["user"] in chamado["nao_lido_por"]:
        chamado["nao_lido_por"].remove(info["user"])

    # Se TI respondeu → notifica autor
    if info["role"] == "ti":
        chamado["status"] = "Em andamento"
        if chamado["autor"] not in chamado["nao_lido_por"]:
            chamado["nao_lido_por"].append(chamado["autor"])

    # Se autor respondeu → notifica TI
    if info["role"] == "comum":
        chamado["status"] = "Respondido"
        if "ti" not in chamado["nao_lido_por"]:
            chamado["nao_lido_por"].append("ti")

    return mensagem

# =====================================================================
# ======================= MARCAR COMO LIDO =============================
# =====================================================================

@app.post("/chamados/{chamado_id}/read")
def marcar_como_lido(
    chamado_id: str,
    authorization: Optional[str] = Header(None),
):
    info = verify_token_header(authorization)

    chamado = chamados_store.get(chamado_id)
    if not chamado:
        raise HTTPException(404, "Chamado não encontrado")

    if info["role"] in chamado["nao_lido_por"]:
        chamado["nao_lido_por"].remove(info["role"])

    if info["user"] in chamado["nao_lido_por"]:
        chamado["nao_lido_por"].remove(info["user"])

    return {"success": True}

# =====================================================================
# ======================= CONTADOR DE NOTIFICAÇÕES =====================
# =====================================================================

@app.get("/notifications/count")
def notifications_count(authorization: Optional[str] = Header(None)):
    info = verify_token_header(authorization)

    count = 0

    for c in chamados_store.values():
        if info["role"] in ["admin", "ti"]:
            if info["role"] in c.get("nao_lido_por", []):
                count += 1
        else:
            if info["user"] in c.get("nao_lido_por", []):
                count += 1

    return {"count": count}


# ---------------- Run ----------------
if __name__ == "__main__":
    logger.info("Iniciando FastAPI em http://0.0.0.0:5055")
    uvicorn.run("main:app", host="0.0.0.0", port=5055, log_level="info")