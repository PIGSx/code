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
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, Query, Header, Body
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

# ---------------- Auth (reaproveita sua lista) ----------------
allowed_credentials = {
    "jaya": {"password": "697843", "role": "admin"},
    "hiury": {"password": "thebest", "role": "admin"},
    "renan": {"password": "renan2025", "role": "admin"},
    "ana": {"password": "deusa", "role": "admin"},
    "NovaSP": {"password": "cmnsp2025", "role": "comum"}
}
active_tokens: Dict[str, Dict[str, Any]] = {}
TOKEN_EXPIRATION = 3600  # segundos

def make_token(username: str, role: str) -> str:
    t = str(uuid.uuid4())
    active_tokens[t] = {"user": username, "role": role, "expira_em": time.time() + TOKEN_EXPIRATION}
    logger.info("Token criado para %s (role=%s)", username, role)
    return t

def verify_token_header(auth_header: Optional[str]) -> Dict[str, Any]:
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token ausente")
    token = auth_header.split(" ", 1)[1]
    info = active_tokens.get(token)
    if not info:
        raise HTTPException(status_code=403, detail="Token inválido ou expirado")
    if time.time() > info["expira_em"]:
        active_tokens.pop(token, None)
        raise HTTPException(status_code=403, detail="Token expirado")
    return info

def get_current_user_header(authorization: Optional[str] = Header(None)):
    return verify_token_header(authorization)

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
    if user and user["password"] == password:
        token = make_token(username, user["role"])
        return {"success": True, "token": token, "user": username, "role": user["role"]}
    raise HTTPException(status_code=401, detail="Usuário ou senha inválidos")

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
    return {"logged_in": True, "user": info["user"], "role": info["role"]}

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
    return {"file_id": path.name, "sheets": sheets, "original_filename": file.filename}

@app.get("/pendente/options")
def pendente_options(file_id: str = Query(...), sheet: str = Query(...), authorization: Optional[str] = Header(None)):
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

    resp: Dict[str, Any] = {}
    # Colunas que seu Tkinter usa
    wanted = ["Contrato", "ATC", "Descrição TSS", "Família", "Endereço", "Número", "Complemento"]
    for col in wanted:
        if col in df.columns:
            vals = df[col].astype(str).fillna("").unique().tolist()
            resp[col] = vals
        else:
            resp[col] = []

    # Agrupar descrições por família (útil para exibir agrupado)
    if "Família" in df.columns and "Descrição TSS" in df.columns:
        grupos: Dict[str, List[str]] = {}
        for fam in df["Família"].dropna().unique():
            descrs = df.loc[df["Família"] == fam, "Descrição TSS"].dropna().astype(str).unique().tolist()
            grupos[str(fam)] = descrs
        resp["Descricoes_por_Familia"] = grupos
    else:
        resp["Descricoes_por_Familia"] = {}

    return JSONResponse(resp)

@app.post("/pendente/process")
def pendente_process(
    file_id: str = Form(...),
    sheet: str = Form(...),
    contratos: Optional[str] = Form(None),    # expected JSON string: '["A","B"]'
    atcs: Optional[str] = Form(None),
    descricoes: Optional[str] = Form(None),
    nome_do_relatorio: Optional[str] = Form("saida.xlsx"),
    planilha_prazos: Optional[UploadFile] = File(None),
    pagina_guia: Optional[UploadFile] = File(None),
    authorization: Optional[str] = Header(None),
):
    """Aplica filtros e processa a planilha; retorna .xlsx para download"""
    _ = verify_token_header(authorization)
    path = TMP_DIR / file_id
    if not path.exists():
        raise HTTPException(status_code=404, detail="Arquivo não encontrado (faça upload primeiro).")

    try:
        df_main = pd.read_excel(path, sheet_name=sheet)
        df_main.columns = [c.strip() for c in df_main.columns]
    except Exception as e:
        logger.exception("Erro ler planilha principal: %s", e)
        raise HTTPException(status_code=400, detail=f"Erro ao ler planilha principal: {e}")

    # optional merges
    df_prazos = None
    df_log = None
    try:
        if planilha_prazos:
            df_prazos = pd.read_excel(planilha_prazos.file)
            df_prazos.columns = [c.strip() for c in df_prazos.columns]
        if pagina_guia:
            df_log = pd.read_excel(pagina_guia.file)
            df_log.columns = [c.strip() for c in df_log.columns]
    except Exception as e:
        logger.exception("Erro ler arquivos opcionais: %s", e)
        raise HTTPException(status_code=400, detail=f"Erro ao ler arquivos opcionais: {e}")

    # date conversions (safe)
    if 'Data de Competência' in df_main.columns:
        df_main['Data de Competência'] = pd.to_datetime(df_main['Data de Competência'], errors='coerce')
    if 'Data Inserção' in df_main.columns:
        df_main['Data Inserção'] = pd.to_datetime(df_main['Data Inserção'], errors='coerce')

    # apply exclusions identical to your previous logic
    try:
        if 'Família' in df_main.columns:
            df_main = df_main[~df_main['Família'].isin(['FISCALIZAÇÃO', 'VISTORIA'])]
        if 'Contrato' in df_main.columns:
            df_main = df_main[~df_main['Contrato'].isin([
                '4600042975 - CONSORCIO MANUTENÇÃO SUZANO ZC',
                '4600054507 - ENOPS ENGENHARIA S/A.',
                '4600054538 - CONSÓRCIO LEITURA ITAQUERA',
                '4600057156 - CONSÓRCIO DARWIN TB LESTE',
                '4600060030 - CONSÓRCIO AMPLIA REDE LESTE',
                '4600060107 - CONSÓRCIO AMPLIA REDE ALTO TIETÊ',
                '4600060108 - CONSÓRCIO AMPLIA REDE ALTO TIETÊ',
                '9999999999 - SABESP'
            ])]
        # MOD: preserve leading zeros / preserve the left part before '-' if present
        if 'ATC' in df_main.columns:
            df_main['ATC'] = df_main['ATC'].astype(str).fillna('').str.split('-').str[0].str.strip()
        if 'Descrição TSS' in df_main.columns:
            df_main = df_main[df_main['Descrição TSS'] != 'TROCAR HIDRÔMETRO PREVENTIVA AGENDADA']
    except Exception:
        logger.exception("Erro aplicar exclusoes iniciais")

    # merge prazos and log if provided (preservando index behavior)
    df_merge = df_main.copy()
    try:
        if df_prazos is not None and 'Descrição TSS' in df_prazos.columns:
            # keep column formatting consistent
            df_merge = pd.merge(df_merge, df_prazos[['Descrição TSS', 'PRAZO (HORAS)']], on='Descrição TSS', how='left')
        if df_log is not None and 'Logradouro' in df_log.columns and 'Página Guia' in df_log.columns:
            # MOD: merge safely and avoid duplicate Página Guia columns
            df_log_subset = df_log[['Logradouro', 'Página Guia']].copy()
            # ensure no duplicated column names appear after merge by using suffixes
            df_merge = pd.merge(df_merge, df_log_subset, left_index=True, right_index=True, how='left', suffixes=('', '_log'))
            # if Página Guia exists twice, prefer the original then the log version
            if 'Página Guia_log' in df_merge.columns and 'Página Guia' in df_merge.columns:
                df_merge['Página Guia'] = df_merge['Página Guia'].fillna(df_merge['Página Guia_log'])
                df_merge.drop(columns=['Página Guia_log'], errors='ignore', inplace=True)
            # drop temporary Logradouro if present
            if 'Logradouro' in df_merge.columns:
                df_merge.drop(columns=['Logradouro'], errors='ignore', inplace=True)
    except Exception:
        logger.exception("Erro ao dar merge com prazos/log")

    # Apply filters sent by frontend
    try:
        if contratos:
            contratos_lst = json.loads(contratos)
            if contratos_lst:
                df_merge = df_merge[df_merge['Contrato'].isin(contratos_lst)]
        if atcs:
            atcs_lst = json.loads(atcs)
            if atcs_lst:
                # MOD: compare as strings (frontend should send strings)
                df_merge = df_merge[df_merge['ATC'].astype(str).isin([str(x) for x in atcs_lst])]
        if descricoes:
            descricoes_lst = json.loads(descricoes)
            if descricoes_lst:
                df_merge = df_merge[df_merge['Descrição TSS'].astype(str).isin([str(x) for x in descricoes_lst])]
    except Exception as e:
        logger.exception("Erro ao aplicar filtros recebidos: %s", e)
        raise HTTPException(status_code=400, detail=f"Erro ao aplicar filtros: {e}")

    # Compose Endereço (Número + Complemento) similar ao seu formatar_planilha
    try:
        if all(col in df_merge.columns for col in ["Endereço", "Número", "Complemento"]):
            df_merge['Endereço'] = (
                df_merge['Endereço'].fillna('').astype(str).str.strip() + ' ' +
                df_merge['Número'].fillna('').astype(str) + ' ' +
                df_merge['Complemento'].fillna('').astype(str)
            ).str.strip()
            df_merge.drop(columns=['Número', 'Complemento'], errors='ignore', inplace=True)
    except Exception:
        logger.exception("Erro montar Endereço completo")

    try:
        if 'PRAZO (HORAS)' in df_merge.columns and 'Data de Competência' in df_merge.columns:
            df_merge['Data Final'] = df_merge['Data de Competência'] + pd.to_timedelta(df_merge['PRAZO (HORAS)'], unit='h')
    except Exception:
        logger.exception("Erro calcular Data Final")

    # Select / reorder columns like seu script
    cols = ['Status', 'Número OS', 'ATC', 'Endereço', 'Bairro', 'Página Guia',
            'Data de Competência', 'Data Final', 'Descrição TSS',
            'PRAZO (HORAS)', 'Contrato', 'Causa', 'Resultado']
    cols = [c for c in cols if c in df_merge.columns]
    df_out = df_merge[cols].copy()

    # Generate and return file
    filename = nome_do_relatorio or "saida.xlsx"
    if not filename.lower().endswith(".xlsx"):
        filename += ".xlsx"
    return make_response_file(df_out, filename=filename)

@app.post("/pendente/filters/save")
def pendente_save_filter(payload: Dict[str, Any] = Body(...), authorization: Optional[str] = Header(None)):
    _ = verify_token_header(authorization)
    try:
        if FILTERS_FILE.exists():
            try:
                filters = json.loads(FILTERS_FILE.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                filters = []
        else:
            filters = []
        filters.append(payload)
        FILTERS_FILE.write_text(json.dumps(filters, ensure_ascii=False, indent=2), encoding="utf-8")
    except Exception as e:
        logger.exception("Erro salvar filtro: %s", e)
        raise HTTPException(status_code=500, detail=str(e))
    return {"success": True, "message": f"Filtro '{payload.get('name')}' salvo."}

@app.get("/pendente/filters/list")
def pendente_list_filters(authorization: Optional[str] = Header(None)):
    _ = verify_token_header(authorization)
    if not FILTERS_FILE.exists():
        return {"filters": []}
    try:
        data = json.loads(FILTERS_FILE.read_text(encoding="utf-8"))
    except Exception:
        data = []
    return {"filters": data}


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
