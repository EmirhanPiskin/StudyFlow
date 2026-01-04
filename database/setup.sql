-- ==========================================
-- PROJE: StudyFlow Veritabanı Kurulum Dosyası
-- ==========================================

-- 1. TEMİZLİK (Eski tabloları siler, çakışmayı önler)
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS study_spots CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP SEQUENCE IF EXISTS reservation_seq;
DROP VIEW IF EXISTS admin_dashboard_stats;

-- 2. TABLOLAR VE KISITLAR (CONSTRAINTS)

-- Tablo 1: Kullanıcılar
-- Role kısıtı ve Unique mail
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) CHECK (role IN ('ADMIN', 'STUDENT')), 
    efficiency_score INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tablo 2: Çalışma Alanları (Mekanlar)
-- Kapasite negatif olamaz (Check Constraint)
CREATE TABLE study_spots (
    spot_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    capacity INT CHECK (capacity > 0),
    features TEXT, 
    is_available BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(255)
);

--SEQUENCE KULLANIMI (Açıkça tanımladık)
CREATE SEQUENCE reservation_seq START 100 INCREMENT 1;

-- Tablo 3: Rezervasyonlar
-- Foreign Key + Delete Cascade (Kullanıcı silinirse rezervasyon da gider)
CREATE TABLE reservations (
    reservation_id INT PRIMARY KEY DEFAULT nextval('reservation_seq'), 
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    spot_id INT REFERENCES study_spots(spot_id) ON DELETE SET NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(20) CHECK (status IN ('AKTİF', 'İPTAL', 'TAMAMLANDI')) DEFAULT 'AKTİF',
	has_reviewed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tablo 4: Değerlendirmeler (Reviews)
-- Rating 1-5 arası olmalı
CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    spot_id INT REFERENCES study_spots(spot_id),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. INDEX VE VIEW TASARIMI

-- INDEX (Mekan aramaları hızlansın diye)
CREATE INDEX idx_spot_name ON study_spots(name);

--  VIEW (Admin Dashboard İstatistikleri)
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM reservations WHERE status = 'AKTİF') as active_reservations,
    (SELECT COUNT(*) FROM study_spots WHERE is_available = TRUE) as available_spots,
    (
        SELECT COALESCE(AVG(sub.avg_rating), 0)::NUMERIC(10,2)
        FROM (
            SELECT AVG(rating) as avg_rating
            FROM reviews
            GROUP BY spot_id
        ) sub
    ) as average_site_rating,
    (SELECT COUNT(*) FROM users WHERE role = 'STUDENT') as total_students;

-- 4. FONKSİYONLAR (STORED PROCEDURES)

-- CURSOR ve RECORD Kullanımı
-- Mekanın geçmiş rezervasyonlarını listeler
CREATE OR REPLACE FUNCTION get_spot_history(p_spot_id INT)
RETURNS TABLE(r_user VARCHAR, r_start TIMESTAMP, r_status VARCHAR) AS $$
DECLARE
    rec RECORD;
    cur_reservations CURSOR FOR 
        SELECT u.username, r.start_time, r.status 
        FROM reservations r
        JOIN users u ON r.user_id = u.user_id
        WHERE r.spot_id = p_spot_id;
BEGIN
    OPEN cur_reservations;
    LOOP
        FETCH cur_reservations INTO rec;
        EXIT WHEN NOT FOUND;
        r_user := rec.username;
        r_start := rec.start_time;
        r_status := rec.status;
        RETURN NEXT;
    END LOOP;
    CLOSE cur_reservations;
END;
$$ LANGUAGE plpgsql;

-- Parametre alan ve hesap yapan fonksiyon
-- Kullanıcının toplam çalışma saatini hesaplar
CREATE OR REPLACE FUNCTION calculate_study_hours(p_user_id INT)
RETURNS FLOAT AS $$
DECLARE
    total_hours FLOAT;
BEGIN
    SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (end_time - start_time))/3600), 0)
    INTO total_hours
    FROM reservations
    WHERE user_id = p_user_id AND status = 'TAMAMLANDI';
    RETURN total_hours;
END;
$$ LANGUAGE plpgsql;

-- Yardımcı Fonksiyon: Müsaitlik Kontrolü
CREATE OR REPLACE FUNCTION check_availability(p_spot_id INT, p_start TIMESTAMP, p_end TIMESTAMP)
RETURNS BOOLEAN AS $$
DECLARE
    conflict_count INT;
BEGIN
    SELECT COUNT(*) INTO conflict_count
    FROM reservations
    WHERE spot_id = p_spot_id 
      AND status = 'AKTİF'
      AND (start_time, end_time) OVERLAPS (p_start, p_end);
      
    IF conflict_count > 0 THEN RETURN FALSE; ELSE RETURN TRUE; END IF;
END;
$$ LANGUAGE plpgsql;

-- 5. TRIGGERLAR (TETİKLEYİCİLER)

-- TRIGGER 1 (Çakışma Kontrolü - Before Insert)
CREATE OR REPLACE FUNCTION prevent_overlap()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT check_availability(NEW.spot_id, NEW.start_time, NEW.end_time) THEN
        RAISE EXCEPTION 'Bu saat aralığında bu mekan dolu! (Trigger Hatası)';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_overlap
BEFORE INSERT ON reservations
FOR EACH ROW
EXECUTE FUNCTION prevent_overlap();

-- TRIGGER 2 (Puanlama Sonrası Skor Artışı - After Insert)
CREATE OR REPLACE FUNCTION update_user_score()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users
    SET efficiency_score = efficiency_score + 10
    WHERE user_id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_add_score
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_user_score();

-- 6. VERİ DOLDURMA (SEED DATA - Her tabloya 10 Kayıt)

-- USERS (10 Kayıt)
INSERT INTO users (username, password, email, role) VALUES
('recep_karaya', '12345', 'recep@univ.edu', 'STUDENT'),
('admin_user', 'admin123', 'admin@univ.edu', 'ADMIN'),
('ahmet_yildiz', 'pass01', 'ahmet@univ.edu', 'STUDENT'),
('ayse_kara', 'pass02', 'ayse@univ.edu', 'STUDENT'),
('fatma_celik', 'pass03', 'fatma@univ.edu', 'STUDENT'),
('mehmet_demir', 'pass04', 'mehmet@univ.edu', 'STUDENT'),
('ali_can', 'pass05', 'ali@univ.edu', 'STUDENT'),
('zeynep_su', 'pass06', 'zeynep@univ.edu', 'STUDENT'),
('burak_tan', 'pass07', 'burak@univ.edu', 'STUDENT'),
('selin_nur', 'pass08', 'selin@univ.edu', 'STUDENT');

-- STUDY_SPOTS (10 Kayıt)
INSERT INTO study_spots (name, capacity, features, is_available, image_url) VALUES
('Kütüphane A1', 4, 'Priz, Sessiz', TRUE, 'https://images.unsplash.com/photo-1497366216548-37526070297c'),
('Kütüphane A2', 4, 'Priz, Sessiz', TRUE, 'https://images.unsplash.com/photo-1568605114967-8130f3a36994'),
('Grup Odası 1', 6, 'Projeksiyon, Yazı Tahtası', TRUE, 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4'),
('Bilgisayar Lab 1', 1, 'i7 PC, Ethernet', TRUE, 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6'),
('Teras Çalışma', 10, 'Açık Hava, WiFi', TRUE, 'https://images.unsplash.com/photo-1564507592333-c60657eea523'),
('Sessiz Kabin 1', 1, 'Ses Yalıtımı', TRUE, 'https://images.unsplash.com/photo-1519389950473-47ba0277781c'),
('Sessiz Kabin 2', 1, 'Ses Yalıtımı', TRUE, 'https://images.unsplash.com/photo-1519389950473-47ba0277781c'),
('Bilgisayar Lab 2', 1, 'i7 PC, Ethernet', TRUE, 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6'),
('Grup Odası 2', 6, 'TV, HDMI', FALSE, 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4'),
('Kafe Masası', 2, 'Priz, Kahve Yakın', TRUE, 'https://images.unsplash.com/photo-1554118811-1e0d58224f24');

-- RESERVATIONS (10 Kayıt)
INSERT INTO reservations (user_id, spot_id, start_time, end_time, status) VALUES
(1, 1, '2023-12-01 10:00:00', '2023-12-01 12:00:00', 'TAMAMLANDI'),
(3, 2, '2023-12-01 14:00:00', '2023-12-01 16:00:00', 'TAMAMLANDI'),
(4, 3, '2023-12-02 09:00:00', '2023-12-02 11:00:00', 'İPTAL'),
(5, 1, '2023-12-03 10:00:00', '2023-12-03 12:00:00', 'AKTİF'),
(6, 4, '2023-12-04 13:00:00', '2023-12-04 15:00:00', 'İPTAL'), -- İptal sebebi: Oda kapalı
(1, 5, '2023-12-05 08:00:00', '2023-12-05 10:00:00', 'AKTİF'),
(7, 6, '2023-12-06 11:00:00', '2023-12-06 13:00:00', 'TAMAMLANDI'),
(8, 7, '2023-12-07 15:00:00', '2023-12-07 17:00:00', 'AKTİF'),
(9, 8, '2023-12-08 10:00:00', '2023-12-08 11:00:00', 'TAMAMLANDI'),
(10, 9, '2023-12-09 09:00:00', '2023-12-09 18:00:00', 'AKTİF');

-- REVIEWS (10 Kayıt)
INSERT INTO reviews (user_id, spot_id, rating, comment) VALUES
(1, 1, 5, 'Çok verimli geçti.'),
(3, 2, 4, 'Biraz soğuktu ama iyi.'),
(4, 3, 5, 'Grup çalışması için ideal.'),
(7, 6, 3, 'Bilgisayar biraz yavaştı.'),
(9, 8, 4, 'Kabin çok dar.'),
(1, 5, 5, 'İnternet çok hızlı.'),
(8, 7, 5, 'Manzara harika.'),
(3, 1, 4, 'Sandalye gıcırdıyor.'),
(5, 1, 5, 'Sınav öncesi hayat kurtardı.'),
(6, 4, 1, 'Oda kilitliydi giremedik.');

-- 7. ÖRNEK SORGULAR 

-- Aggregate ve Having
-- "Ortalama puanı 4 ve üzeri olan mekanlar"
-- SELECT s.name, AVG(r.rating) FROM study_spots s JOIN reviews r ON s.spot_id = r.spot_id GROUP BY s.name HAVING AVG(r.rating) >= 4;

--  Union / Intersect / Except
-- "Hem Lab 1'i hem Lab 2'yi kullanan çalışkan öğrenciler (Intersect)"
-- SELECT user_id FROM reservations WHERE spot_id = 5 INTERSECT SELECT user_id FROM reservations WHERE spot_id = 6;