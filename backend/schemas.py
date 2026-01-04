# schemas.py
from pydantic import BaseModel
from typing import List, Optional

# --- Gelen Veri Modelleri (Frontend -> Backend) ---

class ReservationCreate(BaseModel):
    userId: int
    spotId: int
    start: str  # Frontend "2023-12-01T14:00" formatında atıyor
    end: str

class SpotCreate(BaseModel):
    name: str
    capacity: int
    features: List[str]
    type: str

class ReviewCreate(BaseModel):
    userId: int
    spotId: int
    reservationId: int  # <--- YENİ EKLENDİ (Hangi rezervasyon için?)
    rating: int
    comment: Optional[str] = None

class UserUpdate(BaseModel):
    name: str
    password: Optional[str] = None
# Login için model
class UserLogin(BaseModel):
    email: str
    password: str
# --- Giden Veri Modelleri (Backend -> Frontend) ---
# Frontend'de "features" array bekliyoruz ama DB'de string tutmuştuk.
# Bunu API'de çevireceğiz.

class UserRegister(BaseModel):
    username: str
    email: str
    password: str

class UserUpdate(BaseModel):
    userId: int
    username: str
    password: Optional[str] = None # Şifre boş gelebilir
    # SpotBase sınıfını bul ve bu satırı ekle:
class SpotBase(BaseModel):
    name: str
    capacity: int
    features: Optional[str] = None
    is_available: bool = True
    image_url: Optional[str] = None  # <--- EKLENECEK KRİTİK SATIR BU!

class SpotCreate(SpotBase):
    pass

class Spot(SpotBase):
    spot_id: int
    # --- YENİ EKLENEN ALANLAR ---
    average_rating: Optional[float] = 0.0
    total_reviews: Optional[int] = 0

    class Config:
        from_attributes = True