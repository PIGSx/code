# main.py
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import io
import uuid
import time
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# ------------------------
# --- AUTENTICAÇÃO -------
# ------------------------
allowed_credentials = {
    "jaya": {"password": "697843", "role": "comum"},
    "hiury": {"password": "thebest", "role": "admin"},
    "renan": {"password": "renan2025", "role": "comum"}
}

active_tokens = {}
TOKEN_EXPIRATION = 3600  # 1 hora

@app.route("/")
def home():
    return jsonify({"status": "API unificada rodando 🚀"})


@app.route("/login", methods=["POST"])
def login():
    data = request.json or {}
    username = data.get("username")
    password = data.get("password")
    user_info = allowed_credentials.get(username)

    if user_info and user_info["password"] == password:
        token = str(uuid.uuid4())
        active_tokens[token] = {
            "user": username,
            "role": user_info["role"],
            "expira_em": time.time() + TOKEN_EXPIRATION
        }
        return jsonify({"success": True, "token": token, "user": username, "role": user_info["role"]}), 200

    return jsonify({"success": False, "message": "Usuário ou senha inválidos"}), 401


@app.route("/logout", methods=["POST"])
def logout():
    data = request.json or {}
    token = data.get("token")
    if token in active_tokens:
        del active_tokens[token]
        return jsonify({"success": True, "message": "Logout realizado"}), 200
    return jsonify({"success": False, "message": "Token não encontrado"}), 404


@app.route("/current_user", methods=["POST"])
def current_user():
    data = request.json or {}
    token = data.get("token")
    info = active_tokens.get(token)
    if not info:
        return jsonify({"logged_in": False, "message": "Token inválido ou expirado"}), 401
    if time.time() > info["expira_em"]:
        del active_tokens[token]
        return jsonify({"logged_in": False, "message": "Token expirado"}), 401
    return jsonify({"logged_in": True, "user": info["user"], "role": info["role"]}), 200


def check_token():
    token_header = request.headers.get("Authorization")
    if not token_header or not token_header.startswith("Bearer "):
        return None, jsonify({"error": "Token ausente"}), 401
    token = token_header.split(" ")[1]
    info = active_tokens.get(token)
    if not info:
        return None, jsonify({"error": "Token inválido ou expirado"}), 403
    if time.time() > info["expira_em"]:
        del active_tokens[token]
        return None, jsonify({"error": "Token expirado"}), 403
    return info, None, None


# ------------------------
# --- MATERIAIS ----------
# ------------------------
EXCEL_PATH = os.path.join(os.path.dirname(__file__), "CODIGOS.xlsx")

@app.route("/materiais", methods=["GET"])
def listar_materiais():
    try:
        if not os.path.exists(EXCEL_PATH):
            return jsonify({"error": "Arquivo de materiais não encontrado"}), 404
        df = pd.read_excel(EXCEL_PATH)
        df.columns = [col.strip() for col in df.columns]
        materiais = df.to_dict(orient="records")
        return jsonify(materiais), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/upload_materiais", methods=["POST"])
def upload_excel():
    info, err_resp, status = check_token()
    if err_resp:
        return err_resp, status

    if info["role"] != "admin":
        return jsonify({"error": "Acesso negado"}), 403

    if "file" not in request.files:
        return jsonify({"error": "Nenhum arquivo enviado"}), 400
    file = request.files["file"]
    if not file.filename.endswith((".xlsx", ".xls")):
        return jsonify({"error": "Arquivo inválido"}), 400

    try:
        filename = secure_filename(file.filename)
        file.save(EXCEL_PATH)
        return jsonify({"message": "Planilha atualizada com sucesso ✅"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/processar_materiais", methods=["POST"])
def processar_materiais():
    try:
        kits_file = request.files.get('kits')
        baixas_file = request.files.get('baixas')
        if not kits_file or not baixas_file:
            return jsonify({"error": "Envie os dois arquivos!"}), 400

        kits = pd.read_excel(kits_file, engine='openpyxl')
        baixas = pd.read_excel(baixas_file, engine='openpyxl')

        kits.columns = kits.columns.str.strip()
        baixas.columns = baixas.columns.str.strip()

        kits = kits[['Material', 'TSE', 'Quantidade']]
        baixas = baixas[['Número OS', 'Material', 'Quantidade - Unidade de Medida', 'TSE']]

        baixas['Codigo'] = baixas['Material'].astype(str)
        baixas['Quantidade'] = (baixas['Quantidade - Unidade de Medida'].astype(str)
                                .str.split().str[0]
                                .str.extract(r'(\d+\.?\d*)')[0]
                                .astype(float, errors='ignore'))

        kits_dict = kits.groupby("TSE").apply(lambda x: dict(zip(x["Material"], x["Quantidade"]))).to_dict()

        def conferir_os(df_os):
            tse = df_os["TSE"].iloc[0]
            materiais_esperados = kits_dict.get(tse, {})
            if not materiais_esperados:
                return {"TSE": tse, "Status": "não localizado"}
            materiais_lancados = df_os.groupby("Codigo")["Quantidade"].sum().to_dict()
            faltando = {k: v - materiais_lancados.get(k, 0) for k, v in materiais_esperados.items() if materiais_lancados.get(k, 0) < v}
            extras = {k: v for k, v in materiais_lancados.items() if k not in materiais_esperados}
            status = "OK" if not faltando and not extras else "Pendente"
            return {
                "TSE": tse,
                "Esperado": str(materiais_esperados),
                "Lançado": str(materiais_lancados),
                "Faltando": str(faltando) if faltando else "-",
                "Extras": str(extras) if extras else "-",
                "Status": status
            }

        relatorio = baixas.groupby("Número OS").apply(conferir_os).reset_index().to_dict(orient='records')
        return jsonify(relatorio)
    except Exception as e:
        return jsonify({'error': str(e)}), 400


# ------------------------
# --- PENDENTE -----------
# ------------------------
def process_data_pendente(planilha_file, planilha_prazos_file=None, logradouro_file=None):
    try:
        df = pd.read_excel(planilha_file)
        columns_to_drop = [
            "Nome da Origem","Unidade Executante","Código TSS","Prioridade","Equipe","PDE","Município",
            "Cod. Município","Setor","Rota","Quadra","Local","Vila","SubLocal","ATO","Área de Serviço",
            "Grupo de Faturamento","Data Inserção","Data Agendada","Prazo de Execução","Notas de Acatamento","Arsesp"
        ]
        df = df.drop(columns=columns_to_drop, errors='ignore')
        df = df[~df['Família'].isin(['FISCALIZAÇÃO','VISTORIA'])]
        df = df[~df['Contrato'].isin([
            '4600042975 - CONSORCIO MANUTENÇÃO SUZANO ZC',
            '4600054507 - ENOPS ENGENHARIA S/A.',
            '4600054538 - CONSÓRCIO LEITURA ITAQUERA',
            '4600057156 - CONSORCIO DARWIN TB LESTE',
            '4600060030 - CONSÓRCIO AMPLIA REDE LESTE',
            '4600060107 - CONSÓRCIO AMPLIA REDE ALTO TIETÊ',
            '4600060108 - CONSÓRCIO AMPLIA REDE ALTO TIETÊ',
            '9999999999 - SABESP'
        ])]
        df['ATC'] = df['ATC'].astype(str).str.extract(r'(\d+)')[0].fillna('')
        df = df[df['Descrição TSS'] != 'TROCAR HIDRÔMETRO PREVENTIVA AGENDADA']

        if 'Data de Competência' in df.columns:
            df['Data de Competência'] = pd.to_datetime(df['Data de Competência'], errors='coerce')

        if planilha_prazos_file:
            df_nomes_prazos = pd.read_excel(planilha_prazos_file)
            df = pd.merge(df, df_nomes_prazos[['Descrição TSS','PRAZO (HORAS)']],
                          on='Descrição TSS', how='left')

        if logradouro_file:
            df_logradouro = pd.read_excel(logradouro_file)
            if 'Logradouro' in df_logradouro.columns:
                df = pd.merge(df, df_logradouro[['Logradouro','Página Guia']],
                              left_on='Endereço', right_on='Logradouro', how='left')
            df = df.drop(columns=['Logradouro'], errors='ignore')

        if 'Número' in df.columns and 'Complemento' in df.columns:
            df['Endereço'] = (df['Endereço'].fillna('').str.strip() + ' ' +
                              df['Número'].fillna('').astype(str) + ' ' +
                              df['Complemento'].fillna('').astype(str)).str.strip()
            df = df.drop(columns=['Número','Complemento'], errors='ignore')

        if 'PRAZO (HORAS)' in df.columns and 'Data de Competência' in df.columns:
            df['Data Final'] = df['Data de Competência'] + pd.to_timedelta(df['PRAZO (HORAS)'], unit='h')

        columns_order = ['Status','Número OS','ATC','Endereço','Bairro','Página Guia','Data de Competência','Data Final',
                         'Descrição TSS','PRAZO (HORAS)','Contrato','Causa','Resultado']
        available_columns = [col for col in columns_order if col in df.columns]
        df = df[available_columns]

        output_stream = io.BytesIO()
        df.to_excel(output_stream, index=False, engine='openpyxl')
        output_stream.seek(0)
        return output_stream
    except Exception as e:
        return str(e)


@app.route("/pendente/processar", methods=["POST"])
def process_pendente():
    info, err_resp, status = check_token()
    if err_resp:
        return err_resp, status

    planilha_file = request.files.get("relatorio_fechados")
    planilha_prazos_file = request.files.get("planilha_prazos")
    logradouro_file = request.files.get("pagina_guia")
    nome_do_relatorio = request.form.get("nome_do_relatorio") or "saida.xlsx"

    if not planilha_file:
        return jsonify({"error": "Nenhum arquivo principal enviado"}), 400

    processed_stream = process_data_pendente(planilha_file, planilha_prazos_file, logradouro_file)
    if isinstance(processed_stream, str):
        return jsonify({"error": processed_stream}), 500

    return send_file(
        processed_stream,
        as_attachment=True,
        download_name=nome_do_relatorio,
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )


# ------------------------
# --- RASTREADOR (Chrome-only) ----------
# ------------------------
from selenium.webdriver.chrome.options import Options

@app.route('/rastreador/abrir-site', methods=['POST'])
def rastreador_abrir_site():
    info, err_resp, status = check_token()
    if err_resp:
        return err_resp, status

    if info["role"] != "admin":
        return jsonify({"status": "error", "mensagem": "Acesso negado: somente administradores"}), 403

    try:
        # configurações do Chrome
        opts = Options()
        opts.add_argument('--no-sandbox')
        opts.add_argument('--disable-dev-shm-usage')
        opts.add_argument('--headless')  # headless no servidor
        opts.add_argument('--disable-gpu')
        opts.add_argument('--window-size=1920,1080')
        opts.add_argument('--disable-blink-features=AutomationControlled')
        opts.add_experimental_option("excludeSwitches", ["enable-automation"])
        opts.add_experimental_option("useAutomationExtension", False)

        navegador = webdriver.Chrome(options=opts)
        try:
            navegador.get("https://web.hapolo.com.br/")
            navegador.find_element(By.XPATH, '/html/body/div/div/div/div/section/form[1]/div/div[1]/input').send_keys("psbltda")
            navegador.find_element(By.XPATH, '/html/body/div/div/div/div/section/form[1]/div/div[2]/input').send_keys("010203" + Keys.RETURN)
            time.sleep(3)

            cookies = navegador.get_cookies()
            titulo = navegador.title
        finally:
            navegador.quit()

        return jsonify({
            "status": "success",
            "mensagem": f"✅ Login feito no servidor! Página acessada: {titulo}",
            "cookies": cookies
        })
    except Exception as e:
        return jsonify({"status": "error", "mensagem": f"❌ Erro na execução do Selenium/Chrome: {str(e)}"}), 500



# ------------------------
# --- RUN -----------------
# ------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
