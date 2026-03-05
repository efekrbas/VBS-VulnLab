const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// ============================================================
// Middleware
// ============================================================

// Bu kısım zafiyetli bırakılmıştır – CORS koruması yok, herhangi bir origin'den istek kabul edilir
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statik dosyaları servis et (index.html, style.css, script.js, SVG'ler)
app.use(express.static(path.join(__dirname)));

// ============================================================
// Bu kısım zafiyetli bırakılmıştır – rate limiting yok
// Brute-force saldırılarına karşı herhangi bir koruma bulunmamaktadır.
// Gerçek bir uygulamada express-rate-limit gibi bir middleware kullanılmalıdır.
// ============================================================

// ============================================================
// Sabit kullanıcı verileri (veritabanı yerine)
// Bu kısım zafiyetli bırakılmıştır – veriler düz metin olarak saklanıyor, şifreleme/hashing yok
// ============================================================
const validUsers = [
    { city: "ANKARA", studentNo: "1234", studentId: 123 },
    { city: "ISTANBUL", studentNo: "5678", studentId: 124 },
    { city: "IZMIR", studentNo: "9012", studentId: 125 }
];

// ============================================================
// Bu kısım zafiyetli bırakılmıştır – doğru resim ID'si sunucu
// tarafında saklanıyor ama client'a açık açık gönderiliyor
// ============================================================
let currentCorrectImageId = null;

// ============================================================
// Hayali öğrenci karne verileri
// Bu kısım zafiyetli bırakılmıştır – tüm öğrenci verileri aynı
// veri yapısında, herhangi bir erişim kontrolü olmadan saklanıyor
// ============================================================
const studentDatabase = {
    123: {
        name: "Ahmet Yılmaz",
        school: "Atatürk Ortaokulu",
        class: "8-A",
        id: 123,
        grades: [
            { subject: "Matematik", exam1: 85, exam2: 90, grade: 88 },
            { subject: "Türkçe", exam1: 78, exam2: 82, grade: 80 },
            { subject: "Fen Bilimleri", exam1: 92, exam2: 88, grade: 90 },
            { subject: "Sosyal Bilgiler", exam1: 70, exam2: 75, grade: 73 },
            { subject: "İngilizce", exam1: 95, exam2: 98, grade: 97 },
            { subject: "Müzik", exam1: 80, exam2: 85, grade: 83 }
        ]
    },
    124: {
        name: "Zeynep Kaya",
        school: "Cumhuriyet Ortaokulu",
        class: "7-B",
        id: 124,
        grades: [
            { subject: "Matematik", exam1: 55, exam2: 60, grade: 58 },
            { subject: "Türkçe", exam1: 90, exam2: 95, grade: 93 },
            { subject: "Fen Bilimleri", exam1: 65, exam2: 70, grade: 68 },
            { subject: "Sosyal Bilgiler", exam1: 88, exam2: 92, grade: 90 },
            { subject: "İngilizce", exam1: 72, exam2: 68, grade: 70 },
            { subject: "Müzik", exam1: 95, exam2: 90, grade: 93 }
        ]
    },
    125: {
        name: "Emre Demir",
        school: "Fatih Ortaokulu",
        class: "6-C",
        id: 125,
        grades: [
            { subject: "Matematik", exam1: 100, exam2: 95, grade: 98 },
            { subject: "Türkçe", exam1: 88, exam2: 90, grade: 89 },
            { subject: "Fen Bilimleri", exam1: 96, exam2: 92, grade: 94 },
            { subject: "Sosyal Bilgiler", exam1: 82, exam2: 78, grade: 80 },
            { subject: "İngilizce", exam1: 90, exam2: 85, grade: 88 },
            { subject: "Müzik", exam1: 70, exam2: 75, grade: 73 }
        ]
    },
    126: {
        name: "Elif Arslan",
        school: "İnönü Ortaokulu",
        class: "8-D",
        id: 126,
        grades: [
            { subject: "Matematik", exam1: 45, exam2: 50, grade: 48 },
            { subject: "Türkçe", exam1: 60, exam2: 65, grade: 63 },
            { subject: "Fen Bilimleri", exam1: 55, exam2: 58, grade: 57 },
            { subject: "Sosyal Bilgiler", exam1: 72, exam2: 68, grade: 70 },
            { subject: "İngilizce", exam1: 40, exam2: 45, grade: 43 },
            { subject: "Müzik", exam1: 88, exam2: 90, grade: 89 }
        ]
    },
    127: {
        name: "Can Özkan",
        school: "Mehmet Akif Ortaokulu",
        class: "7-A",
        id: 127,
        grades: [
            { subject: "Matematik", exam1: 78, exam2: 82, grade: 80 },
            { subject: "Türkçe", exam1: 85, exam2: 80, grade: 83 },
            { subject: "Fen Bilimleri", exam1: 90, exam2: 88, grade: 89 },
            { subject: "Sosyal Bilgiler", exam1: 95, exam2: 92, grade: 94 },
            { subject: "İngilizce", exam1: 88, exam2: 90, grade: 89 },
            { subject: "Müzik", exam1: 75, exam2: 80, grade: 78 }
        ]
    }
};

// ============================================================
// GET /api/verification-data – Doğrulama verileri
//
// Bu kısım zafiyetli bırakılmıştır – Client-Side Information Disclosure
// Bu endpoint, doğru resim ID'sini doğrudan istemciye göndermektedir.
// Saldırgan F12 > Network sekmesinde bu isteğin yanıtını inceleyerek
// doğru cevabı görebilir.
// ============================================================
app.get("/api/verification-data", (req, res) => {
    // Rastgele bir doğru resim ID'si oluştur (1-5 arası)
    currentCorrectImageId = Math.floor(Math.random() * 5) + 1;

    // Bu kısım zafiyetli bırakılmıştır – doğru cevap response'da açıkça gönderiliyor
    return res.status(200).json({
        questionType: "image-select",
        totalImages: 5,
        // Zafiyet: correctImageId açıkça gönderiliyor!
        correctImageId: currentCorrectImageId,
        _debug: {
            answer: currentCorrectImageId,
            hint: "Bu veri production'da kaldırılmalıdır"
        }
    });
});

// ============================================================
// POST /login – Giriş rotası
// ============================================================
app.post("/login", (req, res) => {
    // Bu kısım zafiyetli bırakılmıştır – input sanitization yok
    // Kullanıcıdan gelen veriler herhangi bir temizleme/doğrulama işleminden geçirilmeden
    // doğrudan kullanılmaktadır. XSS, injection gibi saldırılara açıktır.
    const { city, studentNo, selectedImageId } = req.body;

    // ----------------------------------------------------------------
    // Bu kısım zafiyetli bırakılmıştır – SQL Injection'a açık pattern
    // Gerçek bir veritabanı kullanılsaydı, bu tür string karşılaştırma
    // parametrize edilmemiş SQL sorgularına dönüşebilirdi.
    // Örnek zafiyetli sorgu: SELECT * FROM users WHERE city = '${city}'
    // ----------------------------------------------------------------

    // Basit alanların boş olup olmadığını kontrol et
    // Bu kısım zafiyetli bırakılmıştır – yetersiz doğrulama, sadece boşluk kontrolü yapılıyor
    if (!city || !studentNo || !selectedImageId) {
        return res.status(400).json({
            success: false,
            message: "Tüm alanlar doldurulmalıdır!"
        });
    }

    // Bu kısım zafiyetli bırakılmıştır – düz metin karşılaştırma, hashing yok
    // Gerçek bir uygulamada şifreler bcrypt gibi algoritmalarla hash'lenmeli
    // ve karşılaştırma güvenli bir şekilde yapılmalıdır.
    // Bu kısım zafiyetli bırakılmıştır – resim doğrulaması sunucu tarafında
    // currentCorrectImageId ile yapılıyor, ancak bu değer client'a zaten sızdırılmış durumda
    const user = validUsers.find(
        (u) =>
            u.city === city &&
            u.studentNo === studentNo
    );

    // Resim doğrulaması ayrı yapılıyor
    const imageCorrect = currentCorrectImageId && selectedImageId === String(currentCorrectImageId);

    if (user && !imageCorrect) {
        return res.status(401).json({
            success: false,
            message: "Seçilen resim hatalı! Lütfen doğru öğrenci resmini seçiniz."
        });
    }

    if (user) {
        // Bu kısım zafiyetli bırakılmıştır – session/token yönetimi yok
        // Başarılı girişten sonra herhangi bir JWT token veya session oluşturulmuyor.
        // Kullanıcı kimlik doğrulaması kalıcı olarak takip edilmiyor.
        //
        // Bu kısım zafiyetli bırakılmıştır – IDOR (Insecure Direct Object Reference)
        // studentId doğrudan client'a gönderiliyor ve redirect URL'inde kullanılıyor.
        // Kullanıcı bu ID'yi değiştirerek başka öğrencilerin verilerine erişebilir.
        return res.status(200).json({
            success: true,
            message: "Giriş başarılı! Sisteme yönlendiriliyorsunuz...",
            redirectUrl: `/dashboard?studentId=${user.studentId}`
        });
    } else {
        // Bu kısım zafiyetli bırakılmıştır – hata mesajı çok açıklayıcı
        // Saldırgana hangi bilgilerin doğru/yanlış olduğuna dair ipucu verebilir.
        return res.status(401).json({
            success: false,
            message: "Girilen bilgiler hatalı! Lütfen tekrar deneyiniz."
        });
    }
});

// ============================================================
// GET /dashboard – Karne sayfası
// ============================================================
app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "dashboard.html"));
});

// ============================================================
// GET /api/student – Öğrenci bilgileri API'si
//
// ██████████████████████████████████████████████████████████████
// ██  Bu kısım zafiyetli bırakılmıştır – IDOR ZAFİYETİ      ██
// ██                                                          ██
// ██  Bu endpoint herhangi bir oturum (session) kontrolü      ██
// ██  yapmadan, URL'deki 'id' parametresine göre öğrenci      ██
// ██  verilerini döndürmektedir. Giriş yapmış kullanıcının    ██
// ██  bu öğrenciye erişim yetkisi olup olmadığı kontrol        ██
// ██  EDİLMEMEKTEDİR.                                         ██
// ██                                                          ██
// ██  Saldırgan, URL'deki studentId değerini değiştirerek     ██
// ██  (ör: ?id=124, ?id=125) başka öğrencilerin karne         ██
// ██  bilgilerine erişebilir.                                  ██
// ██████████████████████████████████████████████████████████████
// ============================================================
app.get("/api/student", (req, res) => {
    const studentId = req.query.id;

    // Bu kısım zafiyetli bırakılmıştır – input doğrulaması yetersiz
    if (!studentId) {
        return res.status(400).json({
            success: false,
            message: "Öğrenci ID gereklidir!"
        });
    }

    // Bu kısım zafiyetli bırakılmıştır – IDOR
    // Herhangi bir yetkilendirme kontrolü yapılmadan doğrudan
    // veritabanından (burada in-memory objeden) öğrenci verisi çekiliyor.
    // Düzeltme (Remediation): Oturum bilgisinden (session/JWT) giriş yapan
    // kullanıcının kimliği alınmalı ve sadece KENDİ verisine erişmesine
    // izin verilmelidir.
    const student = studentDatabase[studentId];

    if (!student) {
        return res.status(404).json({
            success: false,
            message: "Öğrenci bulunamadı!"
        });
    }

    // Bu kısım zafiyetli bırakılmıştır – tüm öğrenci verileri filtrelenmeden gönderiliyor
    return res.status(200).json({
        success: true,
        student: {
            name: student.name,
            school: student.school,
            class: student.class,
            id: student.id
        },
        grades: student.grades
    });
});

/*
============================================================
 IDOR ZAFİYETİ – REMEDIATION (Düzeltme Yöntemleri)
============================================================

 1. OTURUM KONTROLÜ (Session-Based Access Control):
    - Kullanıcı giriş yaptığında bir session/JWT token oluşturulmalı.
    - /api/student endpoint'ine gelen isteklerde token doğrulanmalı.
    - Token'daki kullanıcı kimliği ile istenen studentId eşleştirilmeli.

    Örnek güvenli kod:
    ──────────────────
    app.get("/api/student", authenticateToken, (req, res) => {
        const loggedInStudentId = req.user.studentId; // Token'dan
        const requestedId = req.query.id;

        if (loggedInStudentId !== parseInt(requestedId)) {
            return res.status(403).json({
                success: false,
                message: "Bu öğrencinin verilerine erişim yetkiniz yok!"
            });
        }
        // ... veriyi döndür
    });

 2. TAHMİN EDİLEMEZ ID'LER (UUID):
    - Ardışık sayısal ID'ler (123, 124, 125) yerine UUID kullanılmalı.
    - Örnek: /api/student?id=a3f8b2c1-9d4e-4f6a-b7c8-1234567890ab
    - Bu, ID'lerin tahmin edilmesini zorlaştırır (ama tek başına yeterli değil!).

 3. SUNUCU TARAFLI YETKİLENDİRME:
    - Her API çağrısında "Bu kullanıcı bu kaynağa erişebilir mi?" kontrolü yapılmalı.
    - Role-based access control (RBAC) uygulanmalı.

============================================================
*/

// ============================================================
// Sunucuyu başlat
// ============================================================
app.listen(PORT, () => {
    console.log(`[e-Okul VBS] Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});
