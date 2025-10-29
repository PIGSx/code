from flask import Flask, jsonify
from flask_cors import CORS
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time
import os

app = Flask(__name__)
CORS(app)  # Permite conexão do React

@app.route('/')
def home():
    return "API do rastreador rodando com sucesso 🚀"

@app.route('/abrir-site', methods=['POST'])
def abrir_site():
    try:
        # Configurações do Chrome
        options = webdriver.ChromeOptions()
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--headless')  # Roda sem abrir janela
        options.add_argument('--disable-gpu')
        options.add_argument('--window-size=1920,1080')

        # Inicializa o navegador
        navegador = webdriver.Chrome(options=options)

        # Acessa o site e faz login
        navegador.get("https://web.hapolo.com.br/")
        navegador.find_element(By.XPATH, '/html/body/div/div/div/div/section/form[1]/div/div[1]/input').send_keys("psbltda")
        navegador.find_element(By.XPATH, '/html/body/div/div/div/div/section/form[1]/div/div[2]/input').send_keys("010203" + Keys.RETURN)

        # Espera o carregamento da página de login
        time.sleep(3)

        # Captura o título ou outro indicador de sucesso
        titulo = navegador.title
        navegador.quit()

        return jsonify({
            "status": "success",
            "mensagem": f"Login realizado com sucesso! Título da página: {titulo}"
        })

    except Exception as e:
        return jsonify({"status": "error", "mensagem": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))  # Mantém a porta definida
    app.run(host="0.0.0.0", port=port)
