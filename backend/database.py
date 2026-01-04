# database.py
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Kendi bilgilerini gir: postgresql://kullanici:sifre@localhost/veritabani_adi
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:admin123@localhost/studyflow_db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency (Her istekte DB açıp kapatan yardımcı fonksiyon)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()