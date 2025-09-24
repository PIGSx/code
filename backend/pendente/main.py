from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse, JSONResponse
import pandas as pd
import os
import subprocess
from tempfile import NamedTemporaryFile

app = FastAPI()

# ========== CREDENCIAIS ==========
allowed_credentials = {
    "jaya": "697843",
    "hiury": "thebest",
    "renan": "renan2025"
}

# ========== LOGIN ==========
@app.post("/login")
def login(username: str = Form(...), password: str = Form(...)):
    if allowed_credentials.get(username) == password:
        return {"status": "ok", "message": "Login bem sucedido"}
    else:
        raise HTTPException(status_code=401, detail="Usuário ou senha inválidos")

# ========== PROCESSAR PLANILHAS ==========
@app.post("/processar")
async def processar_planilhas(
    planilha_principal: UploadFile = File(...),
    planilha_prazos: UploadFile = File(...),
    planilha_logradouro: UploadFile = File(...),
):
    # salvar arquivos temporários
    with NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp1:
        tmp1.write(await planilha_principal.read())
        planilha_jjj_name = tmp1.name

    with NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp2:
        tmp2.write(await planilha_prazos.read())
        nomes_prazos_name = tmp2.name

    with NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp3:
        tmp3.write(await planilha_logradouro.read())
        logradouro_name = tmp3.name

    # saída temporária
    output_file = NamedTemporaryFile(delete=False, suffix=".xlsx").name

    # processar
    process_data(planilha_jjj_name, nomes_prazos_name, logradouro_name, output_file)

    return FileResponse(output_file, filename="resultado.xlsx")

# ========== BOTÕES ==========
@app.get("/executar-botao1")
def executar_botao1():
    """Executa o botao1.py"""
    if not os.path.isfile("botao1.py"):
        return JSONResponse(status_code=404, content={"error": "botao1.py não encontrado"})
    subprocess.Popen(["python", "botao1.py"])
    return {"status": "ok", "message": "botao1.py executado"}

@app.get("/executar-botao2")
def executar_botao2():
    """Executa o botao2.py"""
    if not os.path.isfile("botao2.py"):
        return JSONResponse(status_code=404, content={"error": "botao2.py não encontrado"})
    subprocess.Popen(["python", "botao2.py"])
    return {"status": "ok", "message": "botao2.py executado"}

# ========== FUNÇÃO PRINCIPAL ==========
def process_data(planilha_jjj_name, nomes_prazos_name, logradouro_name, output_file):
    df = pd.read_excel(planilha_jjj_name)

    # remover colunas
    columns_to_drop = [
        "Nome da Origem", "Unidade Executante", "Código TSS", "Prioridade", "Equipe",
        "PDE", "Município", "Cod. Município", "Setor", "Rota", "Quadra", "Local",
        "Vila", "SubLocal", "ATO", "Área de Serviço", "Grupo de Faturamento",
        "Data Inserção", "Data Agendada", "Prazo de Execução", "Notas de Acatamento",
        "Arsesp"
    ]
    df_cleaned = df.drop(columns=columns_to_drop, errors='ignore')

    # filtros
    df_cleaned = df_cleaned[~df_cleaned['Família'].isin(['FISCALIZAÇÃO', 'VISTORIA'])]
    df_cleaned = df_cleaned[~df_cleaned['Contrato'].isin([
        '4600042975 - CONSORCIO MANUTENÇÃO SUZANO ZC',
        '4600054507 - ENOPS ENGENHARIA S/A.',
        '4600054538 - CONSÓRCIO LEITURA ITAQUERA',
        '4600057156 - CONSORCIO DARWIN TB LESTE',
        '4600060030 - CONSÓRCIO AMPLIA REDE LESTE',
        '4600060107 - CONSÓRCIO AMPLIA REDE ALTO TIETÊ',
        '4600060108 - CONSÓRCIO AMPLIA REDE ALTO TIETÊ',
        '9999999999 - SABESP'
    ])]

    df_cleaned['ATC'] = df_cleaned['ATC'].astype(str).str.extract(r'(\d+)')[0]
    df_cleaned = df_cleaned[df_cleaned['Descrição TSS'] != 'TROCAR HIDRÔMETRO PREVENTIVA AGENDADA']

    if 'Data de Competência' in df_cleaned.columns:
        df_cleaned['Data de Competência'] = pd.to_datetime(df_cleaned['Data de Competência'], errors='coerce')

    # mesclar planilha de prazos
    df_nomes_prazos = pd.read_excel(nomes_prazos_name)
    merged_df = pd.merge(df_cleaned, df_nomes_prazos[['Descrição TSS', 'PRAZO (HORAS)']],
                         on='Descrição TSS', how='left')

    # mesclar logradouro
    df_logradouro = pd.read_excel(logradouro_name)
    merged_df = pd.merge(merged_df, df_logradouro[['Logradouro', 'Página Guia']],
                         left_index=True, right_index=True, how='left')

    merged_df = merged_df.drop(columns=['Logradouro'], errors='ignore')

    if 'Número' in merged_df.columns and 'Complemento' in merged_df.columns:
        merged_df['Endereço'] = (
            merged_df['Endereço'].fillna('').str.strip() + ' ' +
            merged_df['Número'].fillna('').astype(str) + ' ' +
            merged_df['Complemento'].fillna('').astype(str)
        ).str.strip()
        merged_df = merged_df.drop(columns=['Número', 'Complemento'], errors='ignore')

    if 'PRAZO (HORAS)' in merged_df.columns:
        merged_df['Data Final'] = merged_df['Data de Competência'] + pd.to_timedelta(
            merged_df['PRAZO (HORAS)'], unit='h')

    columns_order = ['Status', 'Número OS', 'ATC', 'Endereço', 'Bairro', 'Página Guia',
                     'Data de Competência', 'Data Final', 'Descrição TSS',
                     'PRAZO (HORAS)', 'Contrato', 'Causa', 'Resultado']
    available_columns = [col for col in columns_order if col in merged_df.columns]
    merged_df = merged_df[available_columns]

    merged_df.to_excel(output_file, index=False)
