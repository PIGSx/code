# main.py
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import tempfile
import os
from processador import process_data

app = FastAPI()

# liberar CORS para React em localhost:5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ou ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/processar")
async def processar(planilha_jjj: UploadFile = File(...),
                    nomes_prazos: UploadFile = File(...),
                    logradouro: UploadFile = File(...)):
    try:
        # salvar uploads em arquivos temporários
        def save_temp(upload):
            tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx")
            content = upload.file.read()
            tmp.write(content)
            tmp.flush()
            return tmp.name

        path_jjj = save_temp(planilha_jjj)
        path_prazos = save_temp(nomes_prazos)
        path_logradouro = save_temp(logradouro)

        # saída temporária
        output_path = tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx").name

        # chamar a função original
        result_file = process_data(path_jjj, path_prazos, path_logradouro, output_path)

        return FileResponse(result_file, filename="resultado.xlsx")

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
