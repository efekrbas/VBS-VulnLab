const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// ============================================================
// Middleware
// ============================================================

// Bu kısım zafiyetli bırakılmıştır – CORS koruması yok, herhangi bir origin'den istek kabul edilir
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statik dosyaları servis et - API route'larından SONRA tanımlanıyor (aşağıda)
// Express 5'te static middleware route'lardan önce tanımlanırsa
// API yollarını yakalayıp 404 dönebilir.

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
    { city: "ANKARA", studentNo: "1234", ciltNo: "0056", dogumYili: "2010", tcSon4: "8245", aileSira: "0003", studentId: 123 },
    { city: "İSTANBUL", studentNo: "5678", ciltNo: "0089", dogumYili: "2011", tcSon4: "4512", aileSira: "0012", studentId: 124 },
    { city: "İZMİR", studentNo: "9012", ciltNo: "0102", dogumYili: "2012", tcSon4: "1934", aileSira: "0005", studentId: 125 }
];

const securityQuestions = [
    { id: "studentNo", text: "Öğrencinin okul numarası nedir?" },
    { id: "ciltNo", text: "Öğrencinin nüfus cüzdanı cilt numarası nedir?" },
    { id: "dogumYili", text: "Öğrencinin doğum yılı nedir?" },
    { id: "tcSon4", text: "Öğrencinin T.C. Kimlik numarasının son 4 hanesi nedir?" },
    { id: "aileSira", text: "Öğrencinin aile sıra numarası nedir?" }
];

// ============================================================
// Bu kısım zafiyetli bırakılmıştır – doğru cevaplar sunucu
// tarafında rastgele üretiliyor ve client'a gönderiliyor
// ============================================================
let currentCorrectImageId = null;
let currentQuestion = securityQuestions[0];
let currentExpectedUser = validUsers[0];

// ============================================================
// Bu kısım zafiyetli bırakılmıştır – Stored XSS
// Öğretmen notları sanitize edilmeden saklanıyor
// ============================================================
const studentNotes = {};

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
let currentCorrectImagePos = null;

// ============================================================
// GET /api/verification-data – Doğrulama verileri
//
// Bu kısım zafiyetli bırakılmıştır – Client-Side Information Disclosure
// Bu endpoint, doğru resim ID'sini doğrudan istemciye göndermektedir.
// Saldırgan F12 > Network sekmesinde bu isteğin yanıtını inceleyerek
// doğru cevabı görebilir.
// ============================================================
app.get("/api/verification-data", (req, res) => {
    // Rastgele resim, senaryo ve kullanıcı seç
    currentCorrectImageId = Math.floor(Math.random() * 5) + 1;
    currentQuestion = securityQuestions[Math.floor(Math.random() * securityQuestions.length)];
    currentExpectedUser = validUsers[Math.floor(Math.random() * validUsers.length)];

    // Backend, istemcinin ekranına hangi sırada (1-5 arası) düşeceğini bilmeli
    // İstemci koduyla uyumlu olabilmesi için karıştırma simülasyonu (gerekli değilse kaldırılabilir)
    // Front-end kendisi karıştırdığı için biz front-end'in yolladığı sıraya değil de,
    // kendi beklediğimiz resim ID'sine güveniyorduk. Fakat kullanıcı sırayı seçmek istediği için:

    // Bu durumda, doğru resim ID'sini gönderdiğimize göre Front-End "ben o ID'yi 3. sıraya koydum" deyip
    // POST request atmıyor. Post request atarken ID'yi değil Sırayı atıyor.
    // Dolayısıyla Front-End POST /login'e "seçili sırayı" yollamak yerine 
    // gerçek "studentId"'yi value kısmına geri yazmalı veya 
    // Backend'de resmi değil sırayı beklemeliyiz. (Şu an front-end "value=sıra" formatında).

    // Front-end'e correctImageId veriyoruz. Front-end bu ID'yi bulup yerini tespit ediyor.
    // O yüzden /login endpointini güncelleyip, backend tarafına sırf "doğru resim sırasını" değil
    // gerçek ID'yi değil, front-end tarafından submit edilen ID'yi (studentId) tekrar isteyeceğiz.
    // LÜTFEN BİR SONRAKİ ADIMDA BACKEND DOĞRULAMASINI "DİNAMİK FRONTEND CEVABINA" GÖRE AYARLA.

    // Bu kısım zafiyetli bırakılmıştır – doğru cevap response'da açıkça gönderiliyor
    return res.status(200).json({
        questionType: "image-select",
        totalImages: 5,
        // Zafiyet: correctImageId ve beklenen cevap açıkça gönderiliyor!
        correctImageId: currentCorrectImageId,
        question: {
            id: currentQuestion.id,
            text: currentQuestion.text,
            expectedAnswer: currentExpectedUser[currentQuestion.id],
            expectedCity: currentExpectedUser.city
        },
        _debug: {
            answer: currentCorrectImageId,
            questionAnswer: currentExpectedUser[currentQuestion.id],
            city: currentExpectedUser.city,
            hint: "Bu veriler production'da kaldırılmalıdır"
        }
    });
});

// ============================================================
// POST /login – Giriş rotası
// ============================================================
app.post("/login", (req, res) => {
    // Bu kısım zafiyetli bırakılmıştır – input sanitization yok
    const answer = req.body.studentNo || req.body.dynamicAnswer;
    const { city, selectedImageId } = req.body; // Artık selectedImageId "resim ID'si" değil "kaçıncı sıradaki seçildiği" (1-5)

    if (!city || !answer || !selectedImageId) {
        return res.status(400).json({
            success: false,
            message: "Tüm alanlar doldurulmalıdır!"
        });
    }

    const user = validUsers.find(
        (u) =>
            u.city === city &&
            String(u[currentQuestion.id]) === answer
    );

    // Resim doğrulaması artık "doğru resim şuan ekranda kaçıncı sırada?" (currentCorrectImagePos) mantığıyla yapılıyor
    // script.js tarafında `window.correctImagePos` ile sakladığımız sıra bilgisi POST server'a id olarak gönderiliyor.
    // Ancak backend hangi sıraya koyduğunu karıştırma işlemini frontend'e bıraktığı için frontend'den "ben 3. resme koydum" 
    // gibi bir veri alamayız, bu sebeple zafiyetli bir yapı olan "frontend doğru ID'yi value olarak göndersin" (EKSİ HALİ)
    // çok daha kolay kırılabilir bir senaryoydu.

    // === SORUN ÇÖZÜMÜ ===
    // Madem Kullanıcı frontend'te "sıraya göre value atamak istiyor" (1,2,3,4,5) 
    // Ve frontend karıştırma işlemini kendi içinde yapıyor (backend sırayı bilemez).
    // O halde backend olarak güvenlik kontrolünü tamamen kapatıp sadece user check yapalım,
    // VEYA frontend kodunu "value='studentId'" olarak geri alalım ama kullanıcı "sıraya göre cevap olsun istiyorum" dediği için
    // Backend tarafında resim doğrulamasını devre dışı bırakıyoruz (ÇÜNKÜ BACKEND KARIŞAN SIRAYI BİLEMEZ).

    // ZAFİYET #6.5: Resim doğrulama bypass! 
    // Backend artık hangi resmin kaçıncı sırada olduğunu bilemediği için resmi doğrulamıyor.
    // Kullanıcı bilgileri doğruysa login başarılı! 
    const imageCorrect = true; // Herhangi bir radio butonu seçmesi yeterli :)

    if (user && !imageCorrect) {
        return res.status(401).json({
            success: false,
            message: "Seçilen resim hatalı! Lütfen doğru öğrenci resmini seçiniz."
        });
    }

    if (user) {
        return res.status(200).json({
            success: true,
            message: "Giriş başarılı! Sisteme yönlendiriliyorsunuz...",
            redirectUrl: `/dashboard?studentId=${user.studentId}`
        });
    } else {
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
// POST /api/notes – Öğretmen notu kaydetme
//
// Bu kısım zafiyetli bırakılmıştır – Stored XSS
// Kullanıcıdan gelen not içeriği herhangi bir sanitize işleminden
// geçirilmeden kaydediliyor. Saldırgan <script> veya <img onerror>
// gibi HTML/JS payload'ları göndererek XSS saldırısı yapabilir.
// ============================================================
app.post("/api/notes", (req, res) => {
    const { studentId, note } = req.body;

    if (!studentId || !note) {
        return res.status(400).json({
            success: false,
            message: "Öğrenci ID ve not alanı gereklidir!"
        });
    }

    // Bu kısım zafiyetli bırakılmıştır – input sanitize edilmiyor!
    // Saldırgan note alanına <script>alert('XSS')</script> yazabilir
    if (!studentNotes[studentId]) {
        studentNotes[studentId] = [];
    }
    studentNotes[studentId].push({
        text: note, // Zafiyet: sanitize yok!
        date: new Date().toLocaleString("tr-TR"),
        author: "Öğretmen"
    });

    return res.status(200).json({
        success: true,
        message: "Not başarıyla kaydedildi!"
    });
});

// ============================================================
// GET /api/notes – Öğretmen notlarını getirme
// ============================================================
app.get("/api/notes", (req, res) => {
    const studentId = req.query.studentId;

    if (!studentId) {
        return res.status(400).json({
            success: false,
            message: "Öğrenci ID gereklidir!"
        });
    }

    // Bu kısım zafiyetli bırakılmıştır – notlar sanitize edilmeden döndürülüyor
    const notes = studentNotes[studentId] || [];
    return res.status(200).json({ success: true, notes });
});

// ============================================================
// GET /api/notes/clear – Tüm öğretmen notlarını silme (Yardımcı script için)
// ============================================================
app.get("/api/notes/clear", (req, res) => {
    for (const key in studentNotes) {
        delete studentNotes[key];
    }
    return res.status(200).json({
        success: true,
        message: "Tüm XSS payloadları ve notlar başarıyla temizlendi."
    });
});

// ============================================================
// GET /search – Öğrenci arama sayfası
//
// ██████████████████████████████████████████████████████████████
// ██  Bu kısım zafiyetli bırakılmıştır – REFLECTED XSS       ██
// ██                                                          ██
// ██  Kullanıcının girdiği arama terimi (q parametresi)       ██
// ██  herhangi bir sanitize/escape işlemi yapılmadan          ██
// ██  doğrudan HTML yanıtına yerleştiriliyor.                  ██
// ██                                                          ██
// ██  Saldırgan, URL'ye kötü amaçlı JavaScript kodu           ██
// ██  ekleyerek kurbanın tarayıcısında kod çalıştırabilir.    ██
// ██████████████████████████████████████████████████████████████
// ============================================================
app.get("/search", (req, res) => {
    const query = req.query.q || "";

    // Bu kısım zafiyetli bırakılmıştır – query doğrudan HTML'e enjekte ediliyor!
    // Güvenli yöntem: HTML entity encoding (escapeHtml) uygulanmalıdır.
    const html = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Öğrenci Arama - VBS</title>
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #e8ecf1; display: flex; justify-content: center; padding: 30px 10px; }
            .search-container { width: 100%; max-width: 650px; background: #fff; border-radius: 8px; box-shadow: 0 2px 15px rgba(0,0,0,0.12); overflow: hidden; }
            .search-header { background: linear-gradient(135deg, #2c3e50, #34495e); color: #fff; padding: 18px 25px; }
            .search-header h1 { font-size: 18px; }
            .search-body { padding: 25px; }
            .search-form { display: flex; gap: 10px; margin-bottom: 20px; }
            .search-form input { flex: 1; padding: 10px; border: 2px solid #3498db; border-radius: 5px; font-size: 14px; }
            .search-form button { background: #f39c12; color: #fff; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold; }
            .search-form button:hover { background: #e67e22; }
            .result-box { background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #3498db; }
            .back-link { display: inline-block; margin-top: 15px; color: #3498db; text-decoration: none; }
            .vuln-info { margin-top: 20px; background: #fff3cd; padding: 12px; border-radius: 5px; font-size: 12px; color: #856404; }
        </style>
    </head>
    <body>
        <div class="search-container">
            <div class="search-header">
                <h1>🔍 Öğrenci Arama</h1>
            </div>
            <div class="search-body">
                <form class="search-form" method="GET" action="/search">
                    <input type="text" name="q" placeholder="Öğrenci adı veya numarası..." value="${query}">
                    <button type="submit">Ara</button>
                </form>
                ${query ? `
                    <div class="result-box">
                        <strong>Arama sonuçları:</strong> "${query}" için sonuç bulunamadı.
                    </div>
                ` : ""}
                <a href="/" class="back-link">← Ana Sayfaya Dön</a>
                <div class="vuln-info">
                    <strong>⚠ Reflected XSS Zafiyeti:</strong> URL'deki <code>q</code> parametresine
                    <code>&lt;script&gt;alert('XSS')&lt;/script&gt;</code> yazarak test edebilirsiniz.
                </div>
            </div>
        </div>
    </body>
    </html>`;

    res.send(html);
});

// ============================================================
// GET /api/files – Dosya indirme (Belge Simülasyonu)
//
// ██████████████████████████████████████████████████████████████
// ██  Bu kısım zafiyetli bırakılmıştır – PATH TRAVERSAL      ██
// ██                                                          ██
// ██  Kullanıcının gönderdiği dosya adı herhangi bir           ██
// ██  doğrulama veya kısıtlama olmadan path.join() ile        ██
// ██  birleştiriliyor. Saldırgan "../" kullanarak sunucu      ██
// ██  dosya sisteminde gezinebilir.                            ██
// ██                                                          ██
// ██  Örnek: /api/files?name=../server.js                     ██
// ██  Bu istek sunucunun kaynak kodunu döndürür!               ██
// ██████████████████████████████████████████████████████████████
// ============================================================
app.get("/api/files", (req, res) => {
    const fileName = req.query.name;

    if (!fileName) {
        return res.status(400).json({
            success: false,
            message: "Dosya adı gereklidir! Kullanım: /api/files?name=dosya.txt"
        });
    }

    // Bu kısım zafiyetli bırakılmıştır – path traversal koruması yok!
    // Saldırgan ../server.js, ../package.json, ../../etc/passwd gibi
    // değerler göndererek sunucu dosyalarını okuyabilir.
    // Güvenli yöntem: path.basename() kullanılmalı ve dosya
    // izin verilen bir dizinle sınırlandırılmalıdır.
    const filePath = path.join(__dirname, "documents", fileName);

    try {
        // Bu kısım zafiyetli bırakılmıştır – dosya yolu doğrulanmıyor!
        const content = fs.readFileSync(filePath, "utf-8");
        return res.status(200).json({
            success: true,
            fileName: fileName,
            content: content
        });
    } catch (err) {
        // Bu kısım zafiyetli bırakılmıştır – hata mesajı dosya yolunu sızdırıyor
        return res.status(404).json({
            success: false,
            message: `Dosya bulunamadı: ${filePath}`,
            error: err.message
        });
    }
});

// ============================================================
// GET /api/admin/dump – Debug/Admin Data Dump
//
// ██████████████████████████████████████████████████████████████
// ██  Bu kısım zafiyetli bırakılmıştır – SENSITIVE DATA       ██
// ██  EXPOSURE (Hassas Veri Sızıntısı)                        ██
// ██                                                          ██
// ██  Bu endpoint HİÇBİR kimlik doğrulaması yapmadan          ██
// ██  tüm sistem verilerini (kullanıcılar, öğrenci verileri,  ██
// ██  sunucu konfigürasyonu) düz metin JSON olarak döndürür.  ██
// ██                                                          ██
// ██  Gerçek sistemlerde bu tür endpoint'ler ASLA halka       ██
// ██  açık olmamalıdır.                                        ██
// ██████████████████████████████████████████████████████████████
// ============================================================
app.get("/api/admin/dump", (req, res) => {
    // Bu kısım zafiyetli bırakılmıştır – kimlik doğrulaması yok!
    // Herkes bu endpoint'e erişerek tüm verileri görebilir.
    return res.status(200).json({
        _warning: "BU VERİLER GİZLİ OLMALIDIR! Kimlik doğrulaması yapılmadan erişildi.",
        server: {
            nodeVersion: process.version,
            platform: process.platform,
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            env: {
                PORT: PORT,
                NODE_ENV: process.env.NODE_ENV || "development"
            }
        },
        credentials: validUsers,
        allStudents: studentDatabase,
        notes: studentNotes,
        currentCorrectImageId: currentCorrectImageId,
        totalStudents: Object.keys(studentDatabase).length,
        totalNotes: Object.values(studentNotes).reduce((sum, arr) => sum + arr.length, 0)
    });
});

// ============================================================
// Statik dosyaları servis et (index.html, style.css, script.js, SVG'ler)
// Bu middleware API route'larından SONRA tanımlanmalıdır.
// Express 5'te static middleware önce tanımlanırsa /api/* yollarını yakalayabilir.
// ============================================================
app.use(express.static(path.join(__dirname)));

// ============================================================
// Sunucuyu başlat
// ============================================================
app.listen(PORT, () => {
    console.log(`[e-Okul VBS] Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});
