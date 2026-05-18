from fastapi import FastAPI
from database import engine
from models import Base

app = FastAPI()

# cria tabelas
Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"message": "Technoblade API Online"}