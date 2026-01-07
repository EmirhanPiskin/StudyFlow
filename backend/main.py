# main.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from schemas import ReservationCreate, SpotCreate, ReviewCreate, UserUpdate, UserLogin, UserRegister

app = FastAPI()

# CORS Ayarları (Frontend 5173 portunda, Backend 8000'de olduğu için izin veriyoruz)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Süresi dolmuş rezervasyonları otomatik güncelleyen fonksiyon
def check_and_update_statuses(db: Session):
    # Bitiş saati geçmiş olan AKTİF rezervasyonları TAMAMLANDI yap
    query = text("UPDATE reservations SET status = 'TAMAMLANDI' WHERE end_time < NOW() AND status = 'AKTİF'")
    db.execute(query)
    db.commit()

# --- 1. LOGIN İŞLEMİ (DB'den Kontrol) ---
@app.post("/api/login")
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    query = text("SELECT * FROM users WHERE email = :email")
    result = db.execute(query, {"email": user_credentials.email}).fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    if result.password != user_credentials.password:
        raise HTTPException(status_code=401, detail="Hatalı şifre")

    return {
        "id": result.user_id,
        "name": result.username,
        "email": result.email,
        "role": result.role
        # score satırı silindi
    }

# --- 2. MEKANLARI GETİR (PERFORMANS OPTİMİZASYONLU) ---
@app.get("/api/spots")
def get_spots(q: str = None, db: Session = Depends(get_db)):
    # SQL Sorgusu: Hem mekan bilgilerini al, hem de reviews tablosundan ortalamayı hesapla (COALESCE ile null ise 0 yap)
    # ROUND(AVG(...), 1) -> Puanı virgülden sonra 1 basamak yuvarla (Örn: 4.3)
    base_query = """
        SELECT 
            s.spot_id, s.name, s.capacity, s.features, s.is_available, s.image_url,
            COALESCE(ROUND(AVG(r.rating), 1), 0) as avg_rating,
            COUNT(r.review_id) as review_count
        FROM study_spots s
        LEFT JOIN reviews r ON s.spot_id = r.spot_id
    """
    
    if q:
        base_query += " WHERE s.name ILIKE :search"
        base_query += " GROUP BY s.spot_id ORDER BY s.spot_id"
        result = db.execute(text(base_query), {"search": f"%{q}%"}).fetchall()
    else:
        base_query += " GROUP BY s.spot_id ORDER BY s.spot_id"
        result = db.execute(text(base_query)).fetchall()
    
    spots_list = []
    for row in result:
        # Görsel Optimizasyonu (Performans İçin)
        raw_img = row.image_url or "https://via.placeholder.com/300"
        optimized_img = raw_img
        if "images.unsplash.com" in raw_img and "?" not in raw_img:
            optimized_img = f"{raw_img}?w=600&q=80&auto=format&fit=crop"

        spots_list.append({
            "id": row.spot_id,
            "name": row.name,
            "capacity": row.capacity,
            "features": row.features.split(", ") if row.features else [],
            "isAvailable": row.is_available,
            "image_url": optimized_img,
            "average_rating": float(row.avg_rating), # Decimal'i float yap
            "total_reviews": row.review_count
        })
    return spots_list

# --- 3. REZERVASYON YAP ---
@app.post("/api/reservations/create")
def create_reservation(res: ReservationCreate, db: Session = Depends(get_db)):
    try:
        # 1. ÇAKIŞMA KONTROLÜ (Sadece Seçilen Koltuk İçin)
        # Mantık: Aynı mekanda, AYNI KOLTUKTA, tarih aralığı çakışan ve İPTAL edilmemiş rezervasyon var mı?
        conflict_query = text("""
            SELECT * FROM reservations 
            WHERE spot_id = :sid 
            AND seat_number = :seat
            AND status != 'İPTAL'
            AND (
                (start_time < :end AND end_time > :start)
            )
        """)
        
        conflict = db.execute(conflict_query, {
            "sid": res.spotId, 
            "seat": res.seatNumber, 
            "start": res.start, 
            "end": res.end
        }).fetchone()

        if conflict:
            raise HTTPException(status_code=409, detail=f"{res.seatNumber} numaralı koltuk bu saatlerde dolu!")

        # 2. REZERVASYONU KAYDET
        insert_query = text("""
            INSERT INTO reservations (user_id, spot_id, start_time, end_time, seat_number, status) 
            VALUES (:uid, :sid, :start, :end, :seat, 'AKTİF')
        """)
        db.execute(insert_query, {
            "uid": res.userId, 
            "sid": res.spotId, 
            "start": res.start, 
            "end": res.end,
            "seat": res.seatNumber
        })
        
        db.commit()
        return {"message": "Rezervasyon başarılı!"}

    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# --- 4. ADMIN DASHBOARD STATS ---
@app.get("/api/admin/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    # View boş dönerse hata vermesin diye try-except veya kontrol
    try:
        query = text("SELECT * FROM admin_dashboard_stats")
        row = db.execute(query).fetchone()
        if row:
            return {
                "active_reservations": row.active_reservations,
                "available_spots": row.available_spots,
                "average_site_rating": float(row.average_site_rating), # Decimal hatası olmasın diye float yap
                "total_students": row.total_students
            }
        return {"active_reservations": 0, "available_spots": 0, "average_site_rating": 0, "total_students": 0}
    except Exception as e:
        print(e)
        return {"active_reservations": 0, "available_spots": 0, "average_site_rating": 0, "total_students": 0}

# --- 5. ADMIN MEKAN EKLEME ---
@app.post("/api/admin/add-spot")
def add_spot(spot: SpotCreate, db: Session = Depends(get_db)):
    features_str = ", ".join(spot.features)
    
    # KONTROL: Eğer kullanıcı resim (Base64) gönderdiyse onu al, yoksa varsayılanı koy.
    final_image = spot.image_url 
    if not final_image or len(final_image) < 10: # Boş veya çok kısaysa
        final_image = "https://images.unsplash.com/photo-1497366216548-37526070297c"
    
    query = text("""
        INSERT INTO study_spots (name, capacity, features, is_available, image_url)
        VALUES (:name, :cap, :feat, true, :img)
    """)
    db.execute(query, {
        "name": spot.name, 
        "cap": spot.capacity, 
        "feat": features_str, 
        "img": final_image
    })
    db.commit()
    return {"message": "Mekan eklendi"}

# --- 6. ADMIN MEKAN SİLME ---
@app.delete("/api/admin/delete-spot/{spot_id}")
def delete_spot(spot_id: int, db: Session = Depends(get_db)):
    delete_query = text("DELETE FROM study_spots WHERE spot_id = :id")
    db.execute(delete_query, {"id": spot_id})
    db.commit()
    return {"message": "Silindi"}

@app.get("/api/my-history")
def get_history(user_id: int, db: Session = Depends(get_db)):
    check_and_update_statuses(db)
    # has_reviewed sütununu da çekiyoruz
    query = text("""
        SELECT r.reservation_id, s.name, r.start_time, r.end_time, r.status, s.image_url, s.spot_id, r.has_reviewed
        FROM reservations r
        JOIN study_spots s ON r.spot_id = s.spot_id
        WHERE r.user_id = :uid
        ORDER BY r.start_time DESC
    """)
    result = db.execute(query, {"uid": user_id}).fetchall()
    
    history = []
    for row in result:
        date_str = row.start_time.strftime("%Y-%m-%d")
        time_str = f"{row.start_time.strftime('%H:%M')} - {row.end_time.strftime('%H:%M')}"
        
        history.append({
            "id": row.reservation_id,
            "spotId": row.spot_id,
            "spotName": row.name,
            "date": date_str,
            "time": time_str,
            "status": row.status,
            "image": row.image_url or "https://via.placeholder.com/150",
            "hasReviewed": row.has_reviewed  # <--- YENİ: Frontend bunu kontrol edecek
        })
    return history

@app.post("/api/reviews")
def create_review(review: ReviewCreate, db: Session = Depends(get_db)):
    try:
        # 1. ADIM: Önce bu rezervasyon daha önce puanlanmış mı kontrol et
        # (Kullanıcı arayüzü geçse bile veritabanı dur desin)
        check_query = text("SELECT has_reviewed FROM reservations WHERE reservation_id = :rid")
        is_reviewed = db.execute(check_query, {"rid": review.reservationId}).scalar()

        if is_reviewed:
             raise HTTPException(status_code=400, detail="Bu rezervasyon zaten puanlanmış!")

        # 2. ADIM: Review tablosuna ekle (Trigger çalışır, puan artar)
        query = text("""
            INSERT INTO reviews (user_id, spot_id, rating, comment)
            VALUES (:uid, :sid, :rating, :comment)
        """)
        db.execute(query, {
            "uid": review.userId, 
            "sid": review.spotId, 
            "rating": review.rating, 
            "comment": review.comment
        })

        # 3. ADIM: KRİTİK NOKTA BURASI! 👇
        # Reservations tablosunu güncelle: "Artık puanlandı" (TRUE) yap.
        update_query = text("UPDATE reservations SET has_reviewed = TRUE WHERE reservation_id = :rid")
        db.execute(update_query, {"rid": review.reservationId})

        # Hepsini onayla
        db.commit()
        return {"message": "Puan kaydedildi."}

    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        # Hata detayını görmek için print ekleyebilirsin
        print(f"Hata detayı: {e}")
        raise HTTPException(status_code=500, detail=f"Hata: {str(e)}")

# --- 8. KAYIT OL (REGISTER) ---
@app.post("/api/register")
def register(user: UserRegister, db: Session = Depends(get_db)):
    # Email kontrolü
    existing_user = db.execute(text("SELECT * FROM users WHERE email = :email"), {"email": user.email}).fetchone()
    if existing_user:
        raise HTTPException(status_code=400, detail="Bu e-posta adresi zaten kayıtlı.")
    
    # Yeni kullanıcı ekle (Varsayılan rol: STUDENT)
    query = text("""
        INSERT INTO users (username, email, password, role) 
        VALUES (:name, :email, :pass, 'STUDENT')
    """)
    db.execute(query, {"name": user.username, "email": user.email, "pass": user.password})
    db.commit()
    return {"message": "Kayıt başarılı! Giriş yapabilirsiniz."}

# --- 9. ADMIN ANALİZLERİ (SET OPERATIONS) ---
# Bu endpointler Admin panelindeki butonlara bağlanacak.

@app.get("/api/admin/analysis/loyal-users")
def get_loyal_users(db: Session = Depends(get_db)):
    # SENARYO 1: "Gezgin Gurmeler"
    # Birden fazla ( > 1 ) farklı mekana yorum yapmış kullanıcılar.
    # Logic: Reviews tablosunda user_id'ye göre grupla, farklı spot_id sayısına bak.
    query = text("""
        SELECT u.username 
        FROM reviews r 
        JOIN users u ON r.user_id = u.user_id 
        GROUP BY u.username 
        HAVING COUNT(DISTINCT r.spot_id) > 1
    """)
    result = db.execute(query).fetchall()
    
    # Frontend'in beklediği format: [{"name": "Ahmet"}]
    return [{"name": row.username} for row in result]

@app.get("/api/admin/analysis/inactive-users")
def get_inactive_users(db: Session = Depends(get_db)):
    # SENARYO 2: "Hayalet Kullanıcılar"
    # Sisteme kayıtlı (USERS) ama hiç rezervasyonu (RESERVATIONS) olmayanlar.
    # Logic: (Tüm Kullanıcılar) FARK (Rezervasyon Yapanlar) -> EXCEPT Kullanımı
    query = text("""
        SELECT username FROM users WHERE role = 'STUDENT'
        EXCEPT 
        SELECT u.username FROM reservations r JOIN users u ON r.user_id = u.user_id
    """)
    result = db.execute(query).fetchall()
    
    return [{"name": row.username} for row in result]
# --- 10. PROFİL GÜNCELLEME ---
@app.put("/api/profile/update")
def update_profile(data: UserUpdate, db: Session = Depends(get_db)):
    try:
        check_query = text("SELECT * FROM users WHERE user_id = :uid")
        user = db.execute(check_query, {"uid": data.userId}).fetchone()
        
        if not user:
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")

        if data.password and len(data.password) > 0:
            update_query = text("UPDATE users SET username = :name, password = :pass WHERE user_id = :uid")
            db.execute(update_query, {"name": data.username, "pass": data.password, "uid": data.userId})
        else:
            update_query = text("UPDATE users SET username = :name WHERE user_id = :uid")
            db.execute(update_query, {"name": data.username, "uid": data.userId})
            
        db.commit()
        
        return {
            "message": "Profil güncellendi.",
            "user": {
                "id": data.userId,
                "name": data.username,
                "email": user.email,
                "role": user.role
                # score satırı silindi
            }
        }

    except Exception as e:
        db.rollback()
        print(f"Update hatası: {e}")
        raise HTTPException(status_code=500, detail="Güncelleme sırasında hata oluştu.")

@app.get("/api/spots/{spot_id}/reviews")
def get_spot_reviews(spot_id: int, db: Session = Depends(get_db)):
    # review_id eklendi 👇
    query = text("""
        SELECT r.review_id, r.rating, r.comment, r.created_at, u.username 
        FROM reviews r
        JOIN users u ON r.user_id = u.user_id
        WHERE r.spot_id = :sid
        ORDER BY r.created_at DESC
    """)
    result = db.execute(query, {"sid": spot_id}).fetchall()
    
    reviews = []
    for row in result:
        reviews.append({
            "id": row.review_id, # <--- BU ARTIK VAR (Silmek için lazım)
            "username": row.username,
            "rating": row.rating,
            "comment": row.comment,
            "date": row.created_at.strftime("%d.%m.%Y")
        })
    return reviews
    
# --- 12. REZERVASYON İPTAL ET (Status Güncelleme) ---
@app.put("/api/reservations/{reservation_id}/cancel")
def cancel_reservation(reservation_id: int, db: Session = Depends(get_db)):
    # 1. Rezervasyonu bul
    query = text("SELECT * FROM reservations WHERE reservation_id = :rid")
    reservation = db.execute(query, {"rid": reservation_id}).fetchone()

    if not reservation:
        raise HTTPException(status_code=404, detail="Rezervasyon bulunamadı.")
    
    # 2. Durumu 'İPTAL' olarak güncelle
    update_query = text("UPDATE reservations SET status = 'İPTAL' WHERE reservation_id = :rid")
    db.execute(update_query, {"rid": reservation_id})
    db.commit()
    
    return {"message": "Rezervasyon iptal edildi."}
# --- 13. ADMIN: TÜM KULLANICILARI GETİR ---
@app.get("/api/admin/users")
def get_all_users(db: Session = Depends(get_db)):
    query = text("SELECT user_id, username, email, role, created_at FROM users ORDER BY user_id DESC")
    result = db.execute(query).fetchall()
    return [{"id": r.user_id, "name": r.username, "email": r.email, "role": r.role, "joined_at": r.created_at.strftime("%d.%m.%Y")} for r in result]

# --- 14. ADMIN: TÜM REZERVASYONLARI GETİR ---
@app.get("/api/admin/reservations")
def get_all_reservations(db: Session = Depends(get_db)):
    check_and_update_statuses(db)
    query = text("""
        SELECT r.reservation_id, u.username, s.name as spot_name, r.start_time, r.end_time, r.status
        FROM reservations r
        JOIN users u ON r.user_id = u.user_id
        JOIN study_spots s ON r.spot_id = s.spot_id
        ORDER BY r.start_time DESC
    """)
    result = db.execute(query).fetchall()
    return [{
        "id": r.reservation_id,
        "user": r.username,
        "spot": r.spot_name,
        "date": r.start_time.strftime("%d.%m.%Y"),
        "time": f"{r.start_time.strftime('%H:%M')} - {r.end_time.strftime('%H:%M')}",
        "status": r.status
    } for r in result]

# --- 15. ADMIN: TÜM YORUMLARI GETİR ---
@app.get("/api/admin/reviews")
def get_all_reviews(db: Session = Depends(get_db)):
    query = text("""
        SELECT r.review_id, u.username, s.name as spot_name, r.rating, r.comment, r.created_at
        FROM reviews r
        JOIN users u ON r.user_id = u.user_id
        JOIN study_spots s ON r.spot_id = s.spot_id
        ORDER BY r.created_at DESC
    """)
    result = db.execute(query).fetchall()
    return [{
        "id": r.review_id,
        "user": r.username,
        "spot": r.spot_name,
        "rating": r.rating,
        "comment": r.comment,
        "date": r.created_at.strftime("%d.%m.%Y")
    } for r in result]

# --- 16. ADMIN: YORUM SİL (MODERASYON) ---
@app.delete("/api/admin/reviews/{review_id}")
def delete_review(review_id: int, db: Session = Depends(get_db)):
    # Yorum silinirse, rezervasyonun "has_reviewed" durumu ne olacak? 
    # Genelde False yapılabilir ama şimdilik sadece yorumu siliyoruz.
    db.execute(text("DELETE FROM reviews WHERE review_id = :rid"), {"rid": review_id})
    db.commit()
    return {"message": "Yorum silindi."}

# --- ANALİZ FONKSİYONLARINI GÜNCELLE (User ID yerine İSİM Dönsün) ---

@app.get("/api/admin/analysis/union")
def get_union_analysis(db: Session = Depends(get_db)):
    # UNION: Kütüphane A1 VEYA A2'yi kullananlar
    query = text("""
        SELECT u.username FROM reservations r JOIN users u ON r.user_id = u.user_id WHERE r.spot_id = 1 
        UNION 
        SELECT u.username FROM reservations r JOIN users u ON r.user_id = u.user_id WHERE r.spot_id = 2
    """)
    result = db.execute(query).fetchall()
    
    # DİKKAT: Eskiden sadece [row.username] dönüyordu, şimdi [{"name": row.username}] dönüyor.
    return [{"name": row.username} for row in result]

@app.get("/api/admin/analysis/intersect")
def get_intersect_analysis(db: Session = Depends(get_db)):
    # INTERSECT: İkisini de kullananlar
    query = text("""
        SELECT u.username FROM reservations r JOIN users u ON r.user_id = u.user_id WHERE r.spot_id = 1 
        INTERSECT 
        SELECT u.username FROM reservations r JOIN users u ON r.user_id = u.user_id WHERE r.spot_id = 2
    """)
    result = db.execute(query).fetchall()
    return [{"name": row.username} for row in result]

@app.get("/api/admin/analysis/except")
def get_except_analysis(db: Session = Depends(get_db)):
    # EXCEPT: Fark kümesi
    query = text("""
        SELECT u.username FROM reservations r JOIN users u ON r.user_id = u.user_id WHERE r.spot_id = 1 
        EXCEPT 
        SELECT u.username FROM reservations r JOIN users u ON r.user_id = u.user_id WHERE r.spot_id = 2
    """)
    result = db.execute(query).fetchall()
    return [{"name": row.username} for row in result]

    # --- 17. DOLU KOLTUKLARI GETİR ---
@app.get("/api/spots/{spot_id}/occupied")
def get_occupied_seats(spot_id: int, date: str, start: str, end: str, db: Session = Depends(get_db)):
    # Belirtilen tarih ve saat aralığında o mekandaki dolu koltuk numaralarını döndürür.
    # Frontend'den gelen format: date="2023-12-01", start="14:00", end="15:00"
    check_and_update_statuses(db)
    start_dt = f"{date} {start}:00"
    end_dt = f"{date} {end}:00"
    
    query = text("""
        SELECT seat_number FROM reservations 
        WHERE spot_id = :sid 
        AND status != 'İPTAL'
        AND (start_time < :end_dt AND end_time > :start_dt)
    """)
    
    result = db.execute(query, {"sid": spot_id, "start_dt": start_dt, "end_dt": end_dt}).fetchall()
    
    # Dolu koltukların listesini döndür [1, 3, 5] gibi
    return [row.seat_number for row in result]