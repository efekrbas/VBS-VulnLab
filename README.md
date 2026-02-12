# e-Okul Eski VBS Güvenlik Kontrol Sayfası (Replika)

MEB E-Okul sistemindeki eski "VBS Güvenlik Kontrol" doğrulama sayfasının frontend replikasıdır. Sayfa her yenilendiğinde (F5) doğrulama soruları ve görseller değişir.

## 🌐 Live Demo

🔗 **[Canlı Demo](https://efekrbas.github.io/eokul-eski-dogrulama-sayfasi/)**

## 🖥️ Ekran Görüntüsü

<img width="1918" height="974" alt="Ekran görüntüsü 2026-02-12 054903" src="https://github.com/user-attachments/assets/c89d5715-9c63-4825-b55a-062bc2ff2f06" />

Sayfa, orijinal eski e-Okul doğrulama ekranının tasarımını birebir taklit eder:
- Koyu başlık çubuğu ("VBS GÜVENLİK KONTROL")
- Turuncu uyarı metni
- İl seçimi dropdown'u
- Dinamik doğrulama sorusu
- 5 adet öğrenci görseli seçimi
- "Tamam" butonu

## 📱 Responsive Tasarım

Sayfa tüm cihaz boyutlarına uyumludur:

| Cihaz | Breakpoint | Özellikler |
|-------|-----------|------------|
| 🖥️ Masaüstü | > 768px | Orijinal düzen, yatay form satırları |
| 📱 Tablet | ≤ 768px | Dikey form, tam genişlik inputlar, esnek resim boyutları |
| 📱 Mobil | ≤ 480px | Kompakt spacing, tam genişlik buton |
| 📱 Küçük Ekran | ≤ 360px | Minimum boşluklar, küçültülmüş fontlar |

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
├── style.css       # Stil dosyası (responsive media queries)
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
- **CSS3** — Orijinal tasarıma uygun stil + responsive media queries
- **JavaScript (Canvas API)** — Dinamik görsel oluşturma ve soru rastgeleleştirme

## ⚠️ Not

Bu proje tamamen eğitim/demo amaçlıdır. Herhangi bir backend bağlantısı veya gerçek doğrulama işlemi içermez.
