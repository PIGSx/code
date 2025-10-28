from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid
import time
import os

app = Flask(__name__)
CORS(app)

# Usuários fixos autorizados
allowed_credentials = {
    "jaya": "697843",
    "hiury": "thebest",
    "renan": "renan2025"
}

# Tokens ativos em memória
active_tokens = {}

# Expiração em segundos (1 hora)
TOKEN_EXPIRATION = 3600

@app.route("/")
def home():
    return jsonify({"status": "API de login rodando 🚀"})

@app.route("/login", methods=["POST"])
def login():
    data = request.json or {}
    username = data.get("username")
    password = data.get("password")

    if allowed_credentials.get(username) == password:
        token = str(uuid.uuid4())
        active_tokens[token] = {
            "user": username,
            "expira_em": time.time() + TOKEN_EXPIRATION
        }
        return jsonify({"success": True, "token": token, "user": username}), 200

    return jsonify({"success": False, "message": "Usuário ou senha inválidos"}), 401


@app.route("/validate", methods=["POST"])
def validate():
    """Valida se o token ainda é válido"""
    data = request.json or {}
    token = data.get("token")

    info = active_tokens.get(token)
    if not info:
        return jsonify({"valid": False, "message": "Token inválido"}), 401

    if time.time() > info["expira_em"]:
        del active_tokens[token]
        return jsonify({"valid": False, "message": "Token expirado"}), 401

    return jsonify({"valid": True, "user": info["user"]}), 200


@app.route("/logout", methods=["POST"])
def logout():
    """Remove o token ativo"""
    data = request.json or {}
    token = data.get("token")

    if token in active_tokens:
        del active_tokens[token]
        return jsonify({"success": True, "message": "Logout realizado"}), 200

    return jsonify({"success": False, "message": "Token não encontrado"}), 404


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5004))
    app.run(host="0.0.0.0", port=port, debug=True)
