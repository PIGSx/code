from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import tempfile
import os

app = FastAPI()

# Permitir requisições do React (ajuste o domínio se necessário)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ou ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/processar")
async def processar(
    planilha_jjj: UploadFile = File(...),
    nomes_prazos: UploadFile = File(...),
    logradouro: UploadFile = File(...),
):
    try:
        # salvar os uploads temporariamente
        with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp1:
            planilha_jjj_path = tmp1.name
            tmp1.write(await planilha_jjj.read())

        with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp2:
            nomes_prazos_path = tmp2.name
            tmp2.write(await nomes_prazos.read())

        with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp3:
            logradouro_path = tmp3.name
            tmp3.write(await logradouro.read())

        with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp_out:
            output_file = tmp_out.name

        # Chamar função de processamento
        process_data(planilha_jjj_path, nomes_prazos_path, logradouro_path, output_file)

        return FileResponse(output_file, filename="resultado.xlsx")

    except Exception as e:
        return JSONResponse(status_code=500, content={"erro": str(e)})

    finally:
        # não removemos os arquivos temporários agora porque o FileResponse precisa deles;
        # poderia usar BackgroundTask para limpar depois.
        pass


def process_data(planilha_jjj_name, nomes_prazos_name, logradouro_name, output_file):
    # Verificar se a planilha principal existe
    if os.path.isfile(planilha_jjj_name):
        df = pd.read_excel(planilha_jjj_name)

        # Colunas a serem removidas
        columns_to_drop = [
            "Nome da Origem", "Unidade Executante", "Código TSS", "Prioridade", "Equipe",
            "PDE", "Município", "Cod. Município", "Setor", "Rota", "Quadra", "Local",
            "Vila", "SubLocal", "ATO", "Área de Serviço", "Grupo de Faturamento",
            "Data Inserção", "Data Agendada", "Prazo de Execução", "Notas de Acatamento",
            "Arsesp"
        ]

        # Remover as colunas especificadas
        df_cleaned = df.drop(columns=columns_to_drop, errors='ignore')

        # Filtrar a coluna "Família"
        if 'Família' in df_cleaned.columns:
            df_cleaned = df_cleaned[~df_cleaned['Família'].isin(['FISCALIZAÇÃO', 'VISTORIA'])]

        # Filtrar os contratos
        if 'Contrato' in df_cleaned.columns:
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

        # Filtrar a coluna "ATC"
        if 'ATC' in df_cleaned.columns:
            df_cleaned['ATC'] = df_cleaned['ATC'].astype(str)
            df_cleaned['ATC'] = df_cleaned['ATC'].str.extract(r'(\d+)')[0]

        # Filtrar a coluna "Descrição TSS"
        if 'Descrição TSS' in df_cleaned.columns:
            df_cleaned = df_cleaned[df_cleaned['Descrição TSS'] != 'TROCAR HIDRÔMETRO PREVENTIVA AGENDADA']

        # Converter Data de Competência
        if 'Data de Competência' in df_cleaned.columns:
            df_cleaned['Data de Competência'] = pd.to_datetime(df_cleaned['Data de Competência'], errors='coerce')

        # Mesclar com prazos
        if os.path.isfile(nomes_prazos_name):
            df_nomes_prazos = pd.read_excel(nomes_prazos_name)
            if 'Descrição TSS' in df_nomes_prazos.columns and 'PRAZO (HORAS)' in df_nomes_prazos.columns:
                merged_df = pd.merge(df_cleaned, df_nomes_prazos[['Descrição TSS', 'PRAZO (HORAS)']],
                                     on='Descrição TSS', how='left')
            else:
                merged_df = df_cleaned.copy()
        else:
            merged_df = df_cleaned.copy()

        # Carregar logradouro
        if os.path.isfile(logradouro_name):
            df_logradouro = pd.read_excel(logradouro_name)
            if 'Logradouro' in df_logradouro.columns and 'Página Guia' in df_logradouro.columns:
                # usar left_index/right_index como no seu script original
                merged_df = pd.merge(merged_df, df_logradouro[['Logradouro', 'Página Guia']],
                                     left_index=True, right_index=True, how='left')

        # Remover a coluna "Logradouro"
        merged_df = merged_df.drop(columns=['Logradouro'], errors='ignore')

        # Concatenar "Endereço", "Número" e "Complemento"
        if 'Número' in merged_df.columns and 'Complemento' in merged_df.columns and 'Endereço' in merged_df.columns:
            merged_df['Endereço'] = (
                merged_df['Endereço'].fillna('').str.strip() + ' ' +
                merged_df['Número'].fillna('').astype(str) + ' ' +
                merged_df['Complemento'].fillna('').astype(str)
            ).str.strip()
            merged_df = merged_df.drop(columns=['Número', 'Complemento'], errors='ignore')

        # Somar Data de Competência + Prazo
        if 'PRAZO (HORAS)' in merged_df.columns and 'Data de Competência' in merged_df.columns:
            merged_df['Data Final'] = merged_df['Data de Competência'] + pd.to_timedelta(merged_df['PRAZO (HORAS)'], unit='h')

        # Ordem das colunas
        columns_order = ['Status', 'Número OS', 'ATC', 'Endereço', 'Bairro', 'Página Guia',
                         'Data de Competência', 'Data Final', 'Descrição TSS',
                         'PRAZO (HORAS)', 'Contrato', 'Causa', 'Resultado']
        available_columns = [col for col in columns_order if col in merged_df.columns]
        merged_df = merged_df[available_columns]

        # Salvar a planilha final
        merged_df.to_excel(output_file, index=False)
