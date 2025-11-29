✅ 1. Hocanın İstekleri ve Frontend Karşılıkları
Hocanın proje bildirisindeki maddeleri arayüzde şu şekilde kurguladım. Sunumda bu eşleşmeleri kullanacağız:

Insert İşlemi: Anasayfada "Rezerve Et", Admin panelinde "Yeni Alan Ekle" ve Geçmiş Rezervasyonlarda "Puan Ver" butonları var.

Update İşlemi: Profil sayfasında kullanıcı adı/şifre güncelleme formu var.

Delete İşlemi: Admin panelinde mekan silme, Öğrenci panelinde rezervasyon iptal etme butonları var.

View Kullanımı: Admin Dashboard'daki istatistikler (Aktif Rezervasyon Sayısı vb.) veritabanındaki bir VIEWden çekilecek şekilde tasarlandı.

Index Kullanımı: Anasayfadaki "Arama Çubuğu", arka planda veritabanı index'ini tetikleyecek.

Union / Intersect / Except: Admin panelinde "Özel Kitle Analizi" başlığı altında bu sorguları çalıştıran butonlar ekledim.

Trigger (Çakışma): Rezervasyon yaparken çakışma olursa Backend'den hata bekliyorum.

Trigger (Puanlama): "Puan Ver" dendiğinde reviews tablosuna insert yapılacak, trigger arka planda user puanını güncelleyecek.

🛠️ 2. Database Tasarımı İçin Kritik Notlar (SQL Tarafı)
Frontend'de kullandığım veri yapısına (JSON) uyması için veritabanı tablolarında şu sütunların mutlaka olması gerekiyor:

a) study_spots (Mekanlar Tablosu)

id: Primary Key

name: Varchar (Örn: "Kütüphane Masa 12")

capacity: Int

features: Text veya Array (Frontend bunu "Priz, Klima" şeklinde virgülle ayrılmış veya array bekliyor)

is_available: Boolean (Frontend'de dolu/boş kart rengini bu belirliyor)

image: Varchar (Resim URL'si tutacağız)

b) reservations (Rezervasyon Tablosu)

id: Primary Key (Sequence ile artmalı)

user_id: Foreign Key

spot_id: Foreign Key

start_time & end_time: Timestamp

status: Varchar ('AKTİF', 'İPTAL', 'TAMAMLANDI' gibi statüler dönmeli)

c) users ve reviews

users tablosunda role sütunu olmalı ('ADMIN' veya 'STUDENT'). Login işlemi buna göre yönlendiriliyor.

reviews tablosunda rating (1-5 arası check constraint) olmalı.

🔌 3. Backend (API) Bağlantı Noktaları
Java/Spring tarafında yazılacak Controller'ların şu URL'lere cevap vermesi gerekiyor. (Frontend şu an mockData ile çalışıyor, API hazır olunca bu uçlara bağlanacak):
GET	/api/spots	Tüm mekanları JSON listesi olarak döner.

GET	/api/spots/search?q=...	Index kullanarak arama yapar.

POST	/api/reservations/create	Yeni rezervasyon ekler. Eğer DB Trigger'ı "Çakışma Var" hatası verirse, Backend 409 Conflict statü kodu ve hata mesajı dönmelidir. Frontend bu hatayı kullanıcıya gösteriyor.

GET	/api/my-history	Giriş yapan kullanıcının rezervasyonlarını döner.

POST	/api/reviews	Puanlama yapar. (2. Trigger burada çalışacak).

POST	/api/admin/add-spot	Yeni mekan ekler (Sequence burada kullanılmalı).

GET	/api/admin/stats	View üzerinden istatistikleri çeker.

GET	/api/admin/reports/union	Union/Intersect sorgularının sonucunu döner.

PUT	/api/user/update	Kullanıcı bilgilerini günceller (Update işlemi).
