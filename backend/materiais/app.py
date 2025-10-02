from flask import Flask, request, jsonify
import pandas as pd
from flask_cors import CORS  # Importando CORS

app = Flask(__name__)
CORS(app)  # Habilitando CORS para toda a aplicação

@app.route('/api/processar', methods=['POST'])
def processar():
    try:
        # Obtendo os arquivos do request
        kits_file = request.files['kits']
        baixas_file = request.files['baixas']

        # Ler planilhas
        kits = pd.read_excel(kits_file, engine='openpyxl')
        baixas = pd.read_excel(baixas_file, engine='openpyxl')

        # Normalizar as colunas
        kits.columns = kits.columns.str.strip()  # Remove espaços em branco nos nomes das colunas
        baixas.columns = baixas.columns.str.strip()

        # Filtrar colunas de interesse
        kits = kits[['Material', 'TSE', 'Quantidade']]
        baixas = baixas[['Número OS', 'Material', 'Quantidade - Unidade de Medida', 'TSE']]

        # Normalizar as colunas de baixas
        baixas['Codigo'] = baixas['Material'].astype(str)
        baixas['Quantidade'] = baixas['Quantidade - Unidade de Medida'].astype(str).str.split().str[0].str.extract(r'(\\d+\\.?\\d*)')[0].astype(float)

        # Criar dicionário de kits esperados por TSE
        kits_dict = kits.groupby("TSE").apply(lambda x: dict(zip(x["Material"], x["Quantidade"]))).to_dict()

        # Função para comparar
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

        # Conferir por OS
        relatorio = baixas.groupby("Número OS").apply(conferir_os).reset_index().to_dict(orient='records')

        return jsonify(relatorio)

    except Exception as e:
        return jsonify({'error': str(e)}), 400  # Retorna erro 400 com mensagem de erro

if __name__ == '__main__':
    app.run(port=5000, debug=True)  # Rodando na porta 5000
