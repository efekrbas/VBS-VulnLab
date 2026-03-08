document.addEventListener("DOMContentLoaded", async function () {
    // ===================== CITY RANDOMIZER =====================
    const cities = [
        "ADANA", "ADIYAMAN", "AFYONKARAHİSAR", "AĞRI", "AMASYA", "ANKARA",
        "ANTALYA", "ARTVİN", "AYDIN", "BALIKESİR", "BİLECİK", "BİNGÖL",
        "BİTLİS", "BOLU", "BURDUR", "BURSA", "ÇANAKKALE", "ÇANKIRI",
        "ÇORUM", "DENİZLİ", "DİYARBAKIR", "EDİRNE", "ELAZIĞ", "ERZİNCAN",
        "ERZURUM", "ESKİŞEHİR", "GAZİANTEP", "GİRESUN", "GÜMÜŞHANE",
        "HAKKARİ", "HATAY", "ISPARTA", "MERSİN", "İSTANBUL", "İZMİR",
        "KARS", "KASTAMONU", "KAYSERİ", "KIRKLARELİ", "KIRŞEHİR",
        "KOCAELİ", "KONYA", "KÜTAHYA", "MALATYA", "MANİSA",
        "KAHRAMANMARAŞ", "MARDİN", "MUĞLA", "MUŞ", "NEVŞEHİR", "NİĞDE",
        "ORDU", "RİZE", "SAKARYA", "SAMSUN", "SİİRT", "SİNOP", "SİVAS",
        "TEKİRDAĞ", "TOKAT", "TRABZON", "TUNCELİ", "ŞANLIURFA", "UŞAK",
        "VAN", "YOZGAT", "ZONGULDAK", "AKSARAY", "BAYBURT", "KARAMAN",
        "KIRIKKALE", "BATMAN", "ŞIRNAK", "BARTIN", "ARDAHAN", "IĞDIR",
        "YALOVA", "KARABÜK", "KİLİS", "OSMANİYE", "DÜZCE"
    ];

    const citySelect = document.getElementById("city-select");
    const cityList = document.getElementById("city-list");
    if (citySelect && cityList) {
        cityList.innerHTML = "";

        // Türkçe alfabe sırasına göre sırala
        const sortedCities = cities.slice().sort((a, b) => a.localeCompare(b, 'tr'));

        sortedCities.forEach(city => {
            const opt = document.createElement("option");
            opt.value = city;
            cityList.appendChild(opt);
        });
        citySelect.value = "";
    }

    const imageContainer = document.getElementById("image-grid");
    const imageCount = 5;

    // =====================================================================
    // Bu kısım zafiyetli bırakılmıştır – Client-Side Information Disclosure
    // Doğru resmin hangisi olduğu bilgisi sunucudan alınıp istemcide
    // birçok yere açıkça yazılmaktadır.
    // Saldırgan F12 (DevTools) ile bu bilgiye kolayca ulaşabilir.
    // =====================================================================

    // Sunucudan doğrulama verisini al
    // ZAFİYET #0: Network sekmesinde /api/verification-data yanıtı görülebilir
    let correctImageId = 3; // fallback
    let currentQuestionText = "Öğrencinin okul numarası nedir?";
    let expectedAnswerStr = "1234";
    let expectedCityStr = "ANKARA";

    try {
        const verifyRes = await fetch("/api/verification-data");
        const verifyData = await verifyRes.json();
        correctImageId = verifyData.correctImageId;
        if (verifyData.question) {
            currentQuestionText = verifyData.question.text;
            expectedAnswerStr = verifyData.question.expectedAnswer;
            expectedCityStr = verifyData.question.expectedCity;
        }
    } catch (e) {
        console.error("Doğrulama verisi alınamadı:", e);
    }

    // Dinamik soruyu etikete yerleştirme
    const labelElement = document.getElementById("dynamic-label");
    if (labelElement) {
        labelElement.innerHTML = `<span class="required">*</span> ${currentQuestionText}`;
    }

    // ZAFİYET #1: Doğru cevap global bir JavaScript değişkeninde saklanıyor
    // F12 > Console sekmesinde "window.__studentVerification" yazarak bulunabilir
    window.__studentVerification = {
        dopigruResimId: correctImageId,
        beklenenCevap: expectedAnswerStr,
        sepihir: expectedCityStr,
        soruTipi: currentQuestionText,
        _pipigipiSecret: true
    };

    // ZAFİYET #2: Doğru cevap console'a yazdırılıyor (Console sekmesinde görünür)
    console.log("[DEBUG] Doğrulama bilgisi yüklendi. Doğru resim ID: " + correctImageId);
    console.log("[DEBUG] Beklenen şehir: " + expectedCityStr + ", Beklenen Cevap: " + expectedAnswerStr);

    imageContainer.innerHTML = "";

    // Dizi değerlerini karıştırarak rastgele sıralama oluştur
    const imageIds = [1, 2, 3, 4, 5];
    const shuffledIds = imageIds.sort(() => Math.random() - 0.5);

    for (let i = 0; i < imageCount; i++) {
        const studentId = shuffledIds[i]; // Ekranda i. sıradaki resim, aslında studentId numaralı öğrenci
        const isCorrectImage = (studentId === correctImageId);

        const div = document.createElement("div");

        // ZAFİYET #3: Doğru resmin div'ine "correct-student" CSS class'ı ekleniyor
        if (isCorrectImage) {
            div.className = "image-option correct-student";
        } else {
            div.className = "image-option";
        }

        // ZAFİYET #4: Doğru resme data-correct="true" attribute'u ekleniyor
        div.setAttribute("data-student-id", studentId);
        if (isCorrectImage) {
            div.setAttribute("data-correct", "true");
            div.setAttribute("data-verified", "student-match");
        } else {
            div.setAttribute("data-correct", "false");
        }

        div.innerHTML = `
            <input type="radio" name="student-image" id="img${i}" value="${i + 1}">
            <label for="img${i}" style="width:auto; margin:0; color:inherit;">Seç</label>
        `;

        const img = document.createElement("img");
        img.src = "images/student_photo_" + studentId + ".png";
        img.alt = "Öğrenci " + studentId;
        img.style.objectFit = "cover";

        // ZAFİYET #5: Doğru resmin img stiline gizli bir attribute ekleniyor
        if (isCorrectImage) {
            img.setAttribute("data-role", "verified-student-photo");
            // Backend'in beklediği değeri form için de güncellememiz gerekebileceğinden,
            // Hangi sıradaki resmin doğru olduğunu global değişkende saklayalım:
            window.correctImagePos = i + 1;
        }

        img.onclick = function () {
            document.getElementById("img" + i).checked = true;
        };

        div.appendChild(img);
        imageContainer.appendChild(div);
    }

    // ZAFİYET #6: HTML yorumu olarak doğru cevap kaynak kodda bırakılıyor
    // F12 > Elements sekmesinde HTML yorumu olarak görünür
    const commentNode = document.createComment(
        " Doğrulama Bilgisi: Doğru resim Sırası = " + window.correctImagePos +
        " | Beklenen Cevap = " + expectedAnswerStr + " | Şehir = " + expectedCityStr + " "
    );
    imageContainer.parentNode.insertBefore(commentNode, imageContainer);

    // ===================== FORM SUBMIT (Backend'e POST) =====================
    const submitBtn = document.querySelector(".submit-btn");
    if (submitBtn) {
        submitBtn.addEventListener("click", async function () {
            const city = document.getElementById("city-select").value;
            const studentNo = document.getElementById("dynamic-input").value;
            const selectedImage = document.querySelector('input[name="student-image"]:checked');
            const selectedImageId = selectedImage ? selectedImage.value : null;

            if (!city || !studentNo || !selectedImageId) {
                alert("Lütfen tüm alanları doldurunuz!");
                return;
            }

            try {
                const response = await fetch("/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ city, studentNo, selectedImageId })
                });

                const data = await response.json();

                if (data.success) {
                    alert("✅ " + data.message);
                    // Giriş başarılı – dashboard'a yönlendir
                    if (data.redirectUrl) {
                        window.location.href = data.redirectUrl;
                    }
                } else {
                    alert("❌ " + data.message);
                }
            } catch (error) {
                alert("Sunucuya bağlanırken bir hata oluştu!");
                console.error("Hata:", error);
            }
        });
    }
});
