# backend/app.py
from flask import Flask, jsonify
from flask_cors import CORS

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time

app = Flask(__name__)
CORS(app)  # Permite conexão do React

@app.route('/abrir-site', methods=['POST'])
def abrir_site():
    try:
        # Configurações do Chrome (modo headless para Render)
        options = webdriver.ChromeOptions()
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--headless')  # sem interface
        options.add_argument('--disable-gpu')
        options.add_argument('--window-size=1920x1080')

        # Inicia navegador
        navegador = webdriver.Chrome(options=options)

        # Abre o site e faz login
        navegador.get("https://web.hapolo.com.br/")
        navegador.find_element(
            By.XPATH, '/html/body/div/div/div/div/section/form[1]/div/div[1]/input'
        ).send_keys("psbltda")
        navegador.find_element(
            By.XPATH, '/html/body/div/div/div/div/section/form[1]/div/div[2]/input'
        ).send_keys("010203" + Keys.RETURN)

        # Mantém a janela aberta por um tempo (só para teste)
        time.sleep(5)

        return jsonify({"status": "sucesso", "mensagem": "Navegador aberto com login realizado."})

    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
