# main.py — FastAPI unificada (login, materiais, rastreador interativo, pendente)
import os
import uuid
import time
import json
import tempfile
import logging
from pathlib import Path
from base64 import b64encode
from typing import List, Optional, Dict, Any

import pandas as pd
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, Header, Body, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse, StreamingResponse, Response
from fastapi.middleware.cors import CORSMiddleware


# Selenium imports (usados pelo rastreador)
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import TimeoutException, WebDriverException

# ---------------- WebSocket Globals ----------------
active_connections: Dict[str, List[WebSocket]] = {}



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

# ---------------- PENDENTE - UPLOAD / OPTIONS / PROCESS ----------------

@app.post("/pendente/upload")
def pendente_upload(file: UploadFile = File(...), authorization: Optional[str] = Header(None)):
    """Faz upload da planilha principal e retorna file_id + sheets"""
    _ = verify_token_header(authorization)

    if not file.filename.lower().endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Envie apenas arquivos .xlsx/.xls")

    path = save_uploaded_file(file)

    try:
        sheets = read_workbook_sheets(path)
    except Exception as e:
        logger.exception("Erro leitura sheets: %s", e)
        raise HTTPException(status_code=400, detail=f"Erro ao ler workbook: {e}")

    return {
        "file_id": path.name,
        "sheets": sheets,
        "original_filename": file.filename
    }


@app.get("/pendente/options")
def pendente_options(
    file_id: str = Query(...),
    sheet: str = Query(...),
    authorization: Optional[str] = Header(None)
):
    """Retorna valores únicos para montar filtros no front"""
    _ = verify_token_header(authorization)

    path = TMP_DIR / file_id
    if not path.exists():
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")

    try:
        df = pd.read_excel(path, sheet_name=sheet)
        df.columns = [c.strip() for c in df.columns]
    except Exception as e:
        logger.exception("Erro abrir aba: %s", e)
        raise HTTPException(status_code=400, detail=f"Erro ao abrir aba: {e}")

    wanted = ["Contrato", "ATC", "Descrição TSS", "Família", "Endereço", "Número", "Complemento"]
    resp = {}

    for col in wanted:
        if col in df.columns:
            vals = df[col].astype(str).fillna("").unique().tolist()
            resp[col] = vals
        else:
            resp[col] = []

    # Descrições agrupadas por família
    grupos = {}
    if "Família" in df.columns and "Descrição TSS" in df.columns:
        for fam in df["Família"].dropna().unique():
            descrs = (
                df.loc[df["Família"] == fam, "Descrição TSS"]
                .dropna()
                .astype(str)
                .unique()
                .tolist()
            )
            grupos[str(fam)] = descrs

    resp["Descricoes_por_Familia"] = grupos
    return JSONResponse(resp)


@app.post("/pendente/process")
def pendente_process(
    file_id: str = Form(...),
    sheet: str = Form(...),
    contratos: Optional[str] = Form(None),
    atcs: Optional[str] = Form(None),
    descricoes: Optional[str] = Form(None),
    nome_do_relatorio: Optional[str] = Form("saida.xlsx"),
    planilha_prazos: Optional[UploadFile] = File(None),
    pagina_guia: Optional[UploadFile] = File(None),
    authorization: Optional[str] = Header(None),
):
    """Aplica filtros e processa a planilha; retorna .xlsx"""
    _ = verify_token_header(authorization)

    # -------------------- Carregar planilha principal --------------------
    path = TMP_DIR / file_id
    if not path.exists():
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")

    try:
        df = pd.read_excel(path, sheet_name=sheet)
        df.columns = [c.strip() for c in df.columns]
    except Exception as e:
        logger.exception("Erro ler planilha: %s", e)
        raise HTTPException(status_code=400, detail=f"Erro ao ler planilha: {e}")

    # -------------------- Ajustes iniciais --------------------
    if "Data de Competência" in df.columns:
        df["Data de Competência"] = pd.to_datetime(df["Data de Competência"], errors="coerce")

    if "Data Inserção" in df.columns:
        df["Data Inserção"] = pd.to_datetime(df["Data Inserção"], errors="coerce")

    # Excluir famílias
    if "Família" in df.columns:
        df = df[~df["Família"].isin(["FISCALIZAÇÃO", "VISTORIA"])]

    # Excluir contratos indesejados
    contratos_banidos = [
        "4600042975 - CONSORCIO MANUTENÇÃO SUZANO ZC",
        "4600054507 - ENOPS ENGENHARIA S/A.",
        "4600054538 - CONSÓRCIO LEITURA ITAQUERA",
        "4600057156 - CONSÓRCIO DARWIN TB LESTE",
        "4600060030 - CONSÓRCIO AMPLIA REDE LESTE",
        "4600060107 - CONSÓRCIO AMPLIA REDE ALTO TIETÊ",
        "4600060108 - CONSÓRCIO AMPLIA REDE ALTO TIETÊ",
        "9999999999 - SABESP"
    ]
    if "Contrato" in df.columns:
        df = df[~df["Contrato"].isin(contratos_banidos)]

    # ATC tratado
    if "ATC" in df.columns:
        df["ATC"] = (
            df["ATC"]
            .astype(str)
            .str.split("-")
            .str[0]
            .str.strip()
        )

    # Excluir descrição específica
    if "Descrição TSS" in df.columns:
        df = df[df["Descrição TSS"] != "TROCAR HIDRÔMETRO PREVENTIVA AGENDADA"]

    # -------------------- Carregar planilha de prazos --------------------
    df_prazos = None
    if planilha_prazos:
        try:
            df_prazos = pd.read_excel(planilha_prazos.file)
            df_prazos.columns = [c.strip() for c in df_prazos.columns]
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Erro prazos: {e}")

    # -------------------- Carregar Página Guia --------------------
    df_guia = None
    if pagina_guia:
        try:
            df_guia = pd.read_excel(pagina_guia.file)
            df_guia.columns = [c.strip() for c in df_guia.columns]
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Erro guia: {e}")

    # -------------------- Filtros --------------------
    try:
        if contratos:
            lst = json.loads(contratos)
            df = df[df["Contrato"].isin(lst)]

        if atcs:
            lst = json.loads(atcs)
            df = df[df["ATC"].astype(str).isin([str(x) for x in lst])]

        if descricoes:
            lst = json.loads(descricoes)
            df = df[df["Descrição TSS"].astype(str).isin(lst)]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro filtros: {e}")

    # -------------------- Merge prazos --------------------
    if df_prazos is not None and "PRAZO (HORAS)" in df_prazos.columns:
        df = df.merge(
            df_prazos[["Descrição TSS", "PRAZO (HORAS)"]],
            on="Descrição TSS",
            how="left"
        )

    # -------------------- Merge Página Guia --------------------
    if df_guia is not None and "Página Guia" in df_guia.columns:
        df = df.reset_index(drop=True)
        df_guia = df_guia.reset_index(drop=True)

        if len(df_guia) >= len(df):
            df["Página Guia"] = df_guia["Página Guia"]
        else:
            df.loc[df_guia.index, "Página Guia"] = df_guia["Página Guia"]

    # -------------------- Montar Endereço final --------------------
    if all(c in df.columns for c in ["Endereço", "Número", "Complemento"]):
        df["Endereço"] = (
            df["Endereço"].astype(str).fillna("") + " " +
            df["Número"].astype(str).fillna("") + " " +
            df["Complemento"].astype(str).fillna("")
        ).str.strip()

        df.drop(columns=["Número", "Complemento"], inplace=True, errors="ignore")

    # -------------------- Calcular Data Final --------------------
    if "PRAZO (HORAS)" in df.columns and "Data de Competência" in df.columns:
        try:
            df["Data Final"] = df["Data de Competência"] + pd.to_timedelta(df["PRAZO (HORAS)"], unit="h")
        except Exception:
            pass

    # -------------------- Seleção de colunas finais --------------------
    cols = [
        "Status", "Número OS", "ATC", "Endereço", "Bairro", "Página Guia",
        "Data de Competência", "Data Final", "Descrição TSS",
        "PRAZO (HORAS)", "Contrato", "Causa", "Resultado"
    ]
    cols = [c for c in cols if c in df.columns]

    df_out = df[cols].copy()

    # -------------------- Exportação --------------------
    filename = nome_do_relatorio
    if not filename.lower().endswith(".xlsx"):
        filename += ".xlsx"

    return make_response_file(df_out, filename=filename)


# ---------------- Routes - Rastreador ----------------
@app.post("/rastreador/abrir-site")
def rastreador_abrir_site(authorization: Optional[str] = Header(None)):
    info = verify_token_header(authorization)
    if info["role"] != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado: somente administradores")

    navegador = None
    try:
        options = webdriver.ChromeOptions()
        # options.add_argument("--headless=new")  # pode remover para testar
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--window-size=1920,1080")

        navegador = webdriver.Chrome(options=options)
        navegador.get("https://web.hapolo.com.br/")

        wait = WebDriverWait(navegador, 30)

        # Aguarda real carregamento
        campo_user = wait.until(
            EC.visibility_of_element_located((By.ID, "id_user"))
        )

        # Clicar no input com movimento real
        actions = ActionChains(navegador)
        actions.move_to_element(campo_user).click().perform()
        time.sleep(0.4)

        # Clica de novo só pra garantir foco
        actions.move_to_element(campo_user).click().perform()
        time.sleep(0.4)

        # Digitação “humana”
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

        # Aguarda login completar
        wait.until(lambda d: "hapolo" in d.current_url.lower())

        cookies = navegador.get_cookies()
        titulo = navegador.title

        return {"status": "success", "mensagem": "Login concluído!", "title": titulo, "cookies": cookies}

    except Exception as e:
        logger.exception("Erro rastreador: %s", e)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            if navegador:
                navegador.quit()
        except Exception:
            pass


# ---------------- Helpers ----------------
active_connections: Dict[str, List[WebSocket]] = {}  # WebSocket por chamado

def make_response_file(df, filename="saida.xlsx"):
    import tempfile, os
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx")
    df.to_excel(tmp.name, index=False)
    tmp.close()
    def iterfile():
        with open(tmp.name, "rb") as f: yield from f
        try: os.remove(tmp.name)
        except: pass
    headers = {"Content-Disposition": f'attachment; filename="{filename}"'}
    return StreamingResponse(iterfile(), media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers=headers)

# ---------------- WebSocket Route ----------------
@app.websocket("/ws/{chamado_id}")
async def websocket_endpoint(websocket: WebSocket, chamado_id: str):
    await websocket.accept()
    if chamado_id not in active_connections: active_connections[chamado_id] = []
    active_connections[chamado_id].append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            msg = data if isinstance(data,str) else str(data)
            for conn in active_connections[chamado_id]:
                await conn.send_text(msg)
    except WebSocketDisconnect:
        active_connections[chamado_id].remove(websocket)


# ---------------- Admin / util ----------------
@app.post("/admin/cleanup")
def admin_cleanup(authorization: Optional[str] = Header(None), older_than_hours: int = 24):
    info = verify_token_header(authorization)
    if info["role"] != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado")
    removed = cleanup_temp_files(older_than_seconds=older_than_hours * 3600)
    return {"removed_files": removed}

# ---------------- Run ----------------
if __name__ == "__main__":
    import uvicorn
    logger.info("Iniciando FastAPI em http://0.0.0.0:5055")
    uvicorn.run("main:app", host="0.0.0.0", port=5055, log_level="info")
