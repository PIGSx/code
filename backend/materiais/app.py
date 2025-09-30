import tkinter as tk
from tkinter import filedialog
import pandas as pd
import re  # Importar a biblioteca para regex

# Função para fazer upload do arquivo
def upload_file(file_type):
    file_path = filedialog.askopenfilename(title=f"Selecione o arquivo {file_type}", 
                                            filetypes=[("Excel files", "*.xlsx;*.xls;*.xlsm")])
    if file_path:
        print(f"Arquivo {file_type} selecionado: {file_path}")
        return file_path
    return None

# Função para processar os arquivos
def process_files(kits_file, baixas_file):
    # Ler planilhas
    kits = pd.read_excel(kits_file)        
    baixas = pd.read_excel(baixas_file)    
    
    # Debug: imprimir colunas e primeiras linhas do DataFrame kits
    print("Colunas em 'kits':", kits.columns.tolist())
    print("Primeiras linhas em 'kits':", kits.head())
    
    # Normalizar as colunas
    kits.columns = kits.columns.str.strip()  # Remove espaços em branco nos nomes das colunas

    # Ajustar os nomes das colunas para corresponder aos nomes no arquivo
    if "Material" in kits.columns and "TSE" in kits.columns and "Quantidade" in kits.columns:
        kits["Codigo"] = kits["Material"].astype(str)
        kits["TSE"] = kits["TSE"].astype(str)
        kits["Qtd"] = kits["Quantidade"].astype(str).apply(lambda x: float(re.search(r'(\d+\.?\d*)', x).group(0)) if re.search(r'(\d+\.?\d*)', x) else 0)  # Extrai a quantidade numérica
    else:
        print("Erro: o arquivo de Kits não contém as colunas necessárias.")
        return

    # Normalizar as colunas de baixas
    baixas["Codigo"] = baixas["Material"].astype(str)
    
    # Tratar a conversão da coluna 'Quantidade - Unidade de Medida'
    baixas["Quantidade"] = baixas["Quantidade - Unidade de Medida"].astype(str).str.split().str[0]
    
    # Usar regex para extrair apenas a parte numérica
    baixas["Quantidade"] = baixas["Quantidade"].str.extract(r'(\d+\.?\d*)')[0].astype(float)  # Captura número inteiro ou decimal

    # Criar dicionário de kits esperados (por TSE)
    kits_dict = kits.groupby("TSE").apply(
        lambda x: dict(zip(x["Codigo"], x["Qtd"]))
    ).to_dict()

    # Função para comparar
    def conferir_os(df_os):
        tse = df_os["TSE"].iloc[0]
        materiais_esperados = kits_dict.get(tse, {})

        if not materiais_esperados:  # Se a TSE não for encontrada nos kits
            return pd.Series({
                "TSE": tse,
                "Esperado": "não localizado",
                "Lançado": "-",
                "Faltando": "-",
                "Extras": "-",
                "Status": "não localizado"
            })

        materiais_lancados = df_os.groupby("Codigo")["Quantidade"].sum().to_dict()

        # Materiais faltando
        faltando = {
            k: v - materiais_lancados.get(k, 0)
            for k, v in materiais_esperados.items()
            if materiais_lancados.get(k, 0) < v
        }

        # Materiais extras
        extras = {
            k: v
            for k, v in materiais_lancados.items()
            if k not in materiais_esperados
        }

        # Determina o status
        status = "OK" if not faltando and not extras else "Pendente"
        
        # Se faltantes, retorna como Pendente
        if faltando:
            status = "Pendente"

        return pd.Series({
            "TSE": tse,
            "Esperado": str(materiais_esperados),
            "Lançado": str(materiais_lancados),
            "Faltando": str(faltando) if faltando else "-",
            "Extras": str(extras) if extras else "-",
            "Status": status
        })
    
    # Conferir por OS
    relatorio = baixas.groupby("Número OS").apply(conferir_os).reset_index()
    
    # Permitir que o usuário selecione o local e nome do arquivo para salvar
    output_file = filedialog.asksaveasfilename(defaultextension=".xlsx", filetypes=[("Excel files", "*.xlsx;*.xls;*.xlsm")],
                                                  title="Salvar Relatório como")
    if output_file:  # Verifica se o usuário selecionou um arquivo
        relatorio.to_excel(output_file, index=False)
        print(f"✅ Relatório gerado: {output_file}")
    else:
        print("Salvamento do relatório cancelado.")

# Função principal para interface gráfica
def main():
    root = tk.Tk()
    root.title("Upload de Planilhas")

    def on_upload_kits():
        nonlocal kits_file
        kits_file = upload_file("de Kits")

    def on_upload_baixas():
        nonlocal baixas_file
        baixas_file = upload_file("de Baixas")

    def on_process():
        if kits_file and baixas_file:
            process_files(kits_file, baixas_file)
        else:
            print("Por favor, carregue ambos os arquivos!")

    kits_file = None
    baixas_file = None

    tk.Button(root, text="Upload Kits", command=on_upload_kits).pack(pady=10)
    tk.Button(root, text="Upload Baixas", command=on_upload_baixas).pack(pady=10)
    tk.Button(root, text="Processar", command=on_process).pack(pady=20)

    root.mainloop()

if __name__ == "__main__":
    main()
