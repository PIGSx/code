from pydantic import BaseModel


class EmpresaCreate(BaseModel):
    nome: str
    slug: str


class EmpresaResponse(BaseModel):
    id: int
    nome: str
    slug: str

    class Config:
        from_attributes = True