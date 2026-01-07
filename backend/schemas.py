# backend/schemas.py
from pydantic import BaseModel
from typing import List, Optional

# --- Gelen Veri Modelleri (Frontend -> Backend) ---

class ReservationCreate(BaseModel):
    userId: int
    spotId: int
    start: str
    end: str
    seatNumber: int

# İŞTE DÜZELTME BURADA: Tek ve net bir SpotCreate tanımı.
# features kesinlikle List[str] (Liste) olmalı.
class SpotCreate(BaseModel):
    name: str
    capacity: int
    features: List[str]  # <--- Liste olarak geliyor ["Wifi", "Priz"]
    type: str = "Library"
    is_available: bool = True
    image_url: Optional[str] = None

class ReviewCreate(BaseModel):
    userId: int
    spotId: int
    reservationId: int
    rating: int
    comment: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    username: str
    email: str
    password: str

# Kullanıcı güncelleme (Tek seferde tanımladık)
class UserUpdate(BaseModel):
    userId: int
    username: str
    password: Optional[str] = None

# --- Giden Veri Modelleri (Backend -> Frontend) ---

# Veritabanından okurken kullanılan temel model
class SpotBase(BaseModel):
    name: str
    capacity: int
    # DB'den okurken features string gelir, ama biz API'de manuel çeviriyoruz.
    # Pydantic hata vermesin diye Optional[str] bırakabiliriz veya Any yapabiliriz.
    features: Optional[str] = None 
    is_available: bool = True
    image_url: Optional[str] = None

# Spot detaylarını döndürürken kullanılan model
class Spot(SpotBase):
    spot_id: int
    average_rating: Optional[float] = 0.0
    total_reviews: Optional[int] = 0

    class Config:
        from_attributes = True