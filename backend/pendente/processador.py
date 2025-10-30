# processador.py
import pandas as pd
import os

def process_data(planilha_jjj_name, nomes_prazos_name, logradouro_name, output_file):
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

        # Extraindo e formatando a coluna 'Data de Competência'
        if 'Data de Competência' in df_cleaned.columns:
            df_cleaned['Data de Competência'] = pd.to_datetime(df_cleaned['Data de Competência'], errors='coerce')

        # Verificar se a planilha de prazos existe
        if os.path.isfile(nomes_prazos_name):
            df_nomes_prazos = pd.read_excel(nomes_prazos_name)

            # Mesclar as duas planilhas com base na coluna "Descrição TSS"
            merged_df = pd.merge(df_cleaned,
                                 df_nomes_prazos[['Descrição TSS', 'PRAZO (HORAS)']],
                                 on='Descrição TSS', how='left')

            # Carregar a planilha de logradouro
            if os.path.isfile(logradouro_name):
                df_logradouro = pd.read_excel(logradouro_name)

                # Mesclar logradouro com a planilha principal usando colunas disponíveis
                common_cols = [c for c in ['Logradouro', 'Página Guia'] if c in df_logradouro.columns]
                if common_cols:
                    merged_df = pd.merge(
                        merged_df,
                        df_logradouro[common_cols],
                        left_index=True,
                        right_index=True,
                        how='left'
                    )

            # Remover a coluna "Logradouro" se existir
            merged_df = merged_df.drop(columns=['Logradouro'], errors='ignore')

            # Concatenar "Endereço", "Número" e "Complemento" em uma nova coluna "Endereço"
            if 'Número' in merged_df.columns and 'Complemento' in merged_df.columns:
                merged_df['Endereço'] = (
                    merged_df['Endereço'].fillna('').str.strip() + ' ' +
                    merged_df['Número'].fillna('').astype(str) + ' ' +
                    merged_df['Complemento'].fillna('').astype(str)
                ).str.strip()

                merged_df = merged_df.drop(columns=['Número', 'Complemento'], errors='ignore')

            # Somar 'Data de Competência' e 'PRAZO (HORAS)'
            if 'PRAZO (HORAS)' in merged_df.columns and 'Data de Competência' in merged_df.columns:
                merged_df['Data Final'] = merged_df['Data de Competência'] + pd.to_timedelta(
                    merged_df['PRAZO (HORAS)'], unit='h'
                )

            # Reorganizar as colunas conforme a ordem especificada
            columns_order = ['Status', 'Número OS', 'ATC', 'Endereço', 'Bairro', 'Página Guia',
                             'Data de Competência', 'Data Final', 'Descrição TSS',
                             'PRAZO (HORAS)', 'Contrato', 'Causa', 'Resultado']

            available_columns = [col for col in columns_order if col in merged_df.columns]

            merged_df = merged_df[available_columns]

            merged_df.to_excel(output_file, index=False)

            return output_file
