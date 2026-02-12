# e-Okul Eski VBS Güvenlik Kontrol Sayfası (Replika)

MEB E-Okul sistemindeki eski "VBS Güvenlik Kontrol" doğrulama sayfasının frontend replikasıdır. Sayfa her yenilendiğinde (F5) doğrulama soruları ve görseller değişir.

## 🌐 Live Demo

🔗 **[Canlı Demo](https://efekrbas.github.io/eokul-eski-dogrulama-sayfasi/)**

## 🖥️ Ekran Görüntüsü

Sayfa, orijinal e-Okul doğrulama ekranının tasarımını birebir taklit eder:
- Koyu başlık çubuğu ("VBS GÜVENLİK KONTROL")
- Turuncu uyarı metni
- İl seçimi dropdown'u
- Dinamik doğrulama sorusu
- 5 adet öğrenci görseli seçimi
- "Tamam" butonu

## 🚀 Kullanım

1. `index.html` dosyasını tarayıcınızda açın.
2. **F5** tuşuna basarak sayfayı yenileyin — her seferinde:
   - Doğrulama sorusu değişir
   - Seçili şehir değişir
   - Görsellerin sırası ve içeriği değişir

## 📁 Dosya Yapısı

```
eokul-eski-dogrulama-sayfasi/
├── index.html      # Ana sayfa
├── style.css       # Stil dosyası
├── script.js       # Dinamik soru & görsel mantığı
└── README.md       # Bu dosya
```

## 🔄 Dinamik İçerik

### Sorular
Her yenilemede aşağıdaki sorulardan biri rastgele seçilir:
- Nüfus cüzdanı cilt numarası
- Doğum yılı
- Okul numarası
- T.C. Kimlik numarasının son 2 hanesi
- Anne / Baba adı
- Aile sıra numarası
- Sınıf numarası

### Görseller (Canvas ile Oluşturulur)
5 farklı sahne tipi rastgele sırayla gösterilir:
| Sahne | Açıklama |
|-------|----------|
| 🏔️ Manzara | Dağ yolunda yürüyen çocuk |
| 👤 Portre | Öğrenci yüz çizimi |
| 👥 Grup | Okul binası önünde çocuklar |
| ❄️ Kış | Karlı ortamda çocuk |
| 🏫 Sınıf | Tahta ve sıralarda öğrenci |

## 🛠️ Teknolojiler

- **HTML5** — Sayfa yapısı
- **CSS3** — Orijinal tasarıma uygun stil
- **JavaScript (Canvas API)** — Dinamik görsel oluşturma ve soru rastgeleleştirme

## ⚠️ Not

Bu proje tamamen eğitim/demo amaçlıdır. Herhangi bir backend bağlantısı veya gerçek doğrulama işlemi içermez.
