from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from database import Base


class Empresa(Base):
    __tablename__ = "empresas"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(120), nullable=False)
    slug = Column(String(80), unique=True, nullable=False)
    ativa = Column(Boolean, default=True)
    criado_em = Column(DateTime, default=datetime.utcnow)

    usuarios = relationship("Usuario", back_populates="empresa")
    chamados = relationship("Chamado", back_populates="empresa")


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(80), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(30), default="comum")
    ativo = Column(Boolean, default=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    criado_em = Column(DateTime, default=datetime.utcnow)

    empresa = relationship("Empresa", back_populates="usuarios")
    chamados = relationship("Chamado", back_populates="autor")
    mensagens = relationship("MensagemChamado", back_populates="autor")


class Chamado(Base):
    __tablename__ = "chamados"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    categoria = Column(String(80), nullable=False)
    descricao = Column(Text, nullable=False)
    status = Column(String(40), default="Aberto")
    nao_lido_por = Column(Text, default="")
    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow)

    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    autor_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)

    empresa = relationship("Empresa", back_populates="chamados")
    autor = relationship("Usuario", back_populates="chamados")
    mensagens = relationship(
        "MensagemChamado",
        back_populates="chamado",
        cascade="all, delete-orphan"
    )


class MensagemChamado(Base):
    __tablename__ = "mensagens_chamado"

    id = Column(Integer, primary_key=True, index=True)
    texto = Column(Text, nullable=False)
    criado_em = Column(DateTime, default=datetime.utcnow)

    chamado_id = Column(Integer, ForeignKey("chamados.id"), nullable=False)
    autor_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)

    chamado = relationship("Chamado", back_populates="mensagens")
    autor = relationship("Usuario", back_populates="mensagens")