document.addEventListener("DOMContentLoaded", function () {
    // ===================== DYNAMIC QUESTION =====================
    const questions = [
        "Öğrencinin nüfus cüzdanı cilt numarası nedir?",
        "Öğrencinin doğum yılı nedir?",
        "Öğrencinin okul numarası nedir?",
        "Öğrencinin T.C. Kimlik numarasının son 2 hanesi nedir?",
        "Öğrencinin anne adı nedir?",
        "Öğrencinin baba adı nedir?",
        "Öğrencinin aile sıra numarası nedir?",
        "Öğrencinin sınıf numarası nedir?"
    ];

    const randomIndex = Math.floor(Math.random() * questions.length);
    const labelElement = document.getElementById("dynamic-label");
    if (labelElement) {
        labelElement.innerHTML = `<span class="required">*</span> ${questions[randomIndex]}`;
    }

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
    if (citySelect) {
        citySelect.innerHTML = "";
        const shuffled = cities.slice().sort(() => Math.random() - 0.5);
        const defaultCity = shuffled[Math.floor(Math.random() * shuffled.length)];
        shuffled.forEach(city => {
            const opt = document.createElement("option");
            opt.value = city;
            opt.textContent = city;
            if (city === defaultCity) opt.selected = true;
            citySelect.appendChild(opt);
        });
    }

    // ===================== IMAGE GENERATION (Canvas) =====================
    const imageContainer = document.getElementById("image-grid");
    const imageCount = 5;

    // Helper: seeded pseudo-random for consistent per-image look within a load
    function mulberry32(a) {
        return function () {
            a |= 0; a = a + 0x6D2B79F5 | 0;
            var t = Math.imul(a ^ a >>> 15, 1 | a);
            t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    }

    // Scene generators – each creates a different kind of "student photo"
    function drawLandscape(ctx, w, h, rng) {
        // Sky gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
        const skyHue = Math.floor(rng() * 40) + 190;
        skyGrad.addColorStop(0, `hsl(${skyHue}, 60%, 70%)`);
        skyGrad.addColorStop(1, `hsl(${skyHue}, 40%, 85%)`);
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);

        // Clouds
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        for (let i = 0; i < 3; i++) {
            const cx = rng() * w;
            const cy = rng() * h * 0.3 + 10;
            ctx.beginPath();
            ctx.arc(cx, cy, 20 + rng() * 15, 0, Math.PI * 2);
            ctx.arc(cx + 20, cy - 5, 15 + rng() * 10, 0, Math.PI * 2);
            ctx.arc(cx - 15, cy, 15 + rng() * 10, 0, Math.PI * 2);
            ctx.fill();
        }

        // Mountains
        const mountainColors = ["#6b8e5a", "#5a7d4a", "#4a6d3a"];
        for (let m = 0; m < 3; m++) {
            ctx.fillStyle = mountainColors[m];
            ctx.beginPath();
            ctx.moveTo(-10, h * 0.65);
            const peakX = rng() * w;
            const peakY = h * (0.25 + rng() * 0.15);
            ctx.lineTo(peakX, peakY);
            ctx.lineTo(w + 10, h * 0.65);
            ctx.fill();
        }

        // Ground
        const groundGrad = ctx.createLinearGradient(0, h * 0.6, 0, h);
        groundGrad.addColorStop(0, "#7caa5d");
        groundGrad.addColorStop(1, "#5a8a3d");
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, h * 0.6, w, h * 0.4);

        // Path
        ctx.strokeStyle = "#c4a96a";
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(w * 0.5, h);
        ctx.quadraticCurveTo(w * 0.45, h * 0.7, w * 0.48, h * 0.55);
        ctx.stroke();

        // Child silhouette (walking)
        drawChildSilhouette(ctx, w * 0.46, h * 0.52, 0.35, rng);
    }

    function drawPortrait(ctx, w, h, rng) {
        // Background
        const bgHue = Math.floor(rng() * 360);
        const bgGrad = ctx.createLinearGradient(0, 0, w, h);
        bgGrad.addColorStop(0, `hsl(${bgHue}, 30%, 80%)`);
        bgGrad.addColorStop(1, `hsl(${(bgHue + 40) % 360}, 25%, 70%)`);
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Face
        const skinTones = ["#f5d0a9", "#e8c196", "#d4a574", "#c49564"];
        const skinColor = skinTones[Math.floor(rng() * skinTones.length)];
        const faceX = w / 2;
        const faceY = h * 0.4;
        const faceW = w * 0.28;
        const faceH = w * 0.33;

        // Hair (behind face)
        const hairColors = ["#2c1810", "#4a3020", "#1a0e08", "#6b4423", "#3d2314"];
        ctx.fillStyle = hairColors[Math.floor(rng() * hairColors.length)];
        ctx.beginPath();
        ctx.ellipse(faceX, faceY - faceH * 0.15, faceW * 1.15, faceH * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Face shape
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.ellipse(faceX, faceY, faceW, faceH, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = "#fff";
        const eyeY = faceY - faceH * 0.1;
        const eyeSpacing = faceW * 0.35;
        [-1, 1].forEach(side => {
            ctx.beginPath();
            ctx.ellipse(faceX + side * eyeSpacing, eyeY, 6, 4.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#3d2b1f";
            ctx.beginPath();
            ctx.arc(faceX + side * eyeSpacing, eyeY, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#fff";
        });

        // Nose
        ctx.strokeStyle = darkenColor(skinColor, 0.85);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(faceX, faceY);
        ctx.quadraticCurveTo(faceX + 3, faceY + faceH * 0.18, faceX, faceY + faceH * 0.22);
        ctx.stroke();

        // Mouth (smile)
        ctx.strokeStyle = "#c0736a";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(faceX, faceY + faceH * 0.2, faceW * 0.25, 0.15, Math.PI - 0.15);
        ctx.stroke();

        // Ears
        ctx.fillStyle = skinColor;
        [-1, 1].forEach(side => {
            ctx.beginPath();
            ctx.ellipse(faceX + side * faceW * 0.95, faceY, 5, 8, 0, 0, Math.PI * 2);
            ctx.fill();
        });

        // Body / uniform
        const uniformColors = ["#2c3e7a", "#1a5276", "#2e4053", "#4a235a"];
        ctx.fillStyle = uniformColors[Math.floor(rng() * uniformColors.length)];
        ctx.beginPath();
        ctx.moveTo(faceX - w * 0.35, h);
        ctx.quadraticCurveTo(faceX - w * 0.15, faceY + faceH + 5, faceX, faceY + faceH + 3);
        ctx.quadraticCurveTo(faceX + w * 0.15, faceY + faceH + 5, faceX + w * 0.35, h);
        ctx.lineTo(faceX - w * 0.35, h);
        ctx.fill();

        // Collar
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.moveTo(faceX - 10, faceY + faceH - 2);
        ctx.lineTo(faceX, faceY + faceH + 15);
        ctx.lineTo(faceX + 10, faceY + faceH - 2);
        ctx.fill();
    }

    function drawGroupPhoto(ctx, w, h, rng) {
        // Outdoor school background
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, "#87CEEB");
        bgGrad.addColorStop(0.5, "#a8d8ea");
        bgGrad.addColorStop(1, "#6b8f5a");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // School building silhouette
        ctx.fillStyle = "#d4a96a";
        ctx.fillRect(w * 0.1, h * 0.15, w * 0.8, h * 0.4);
        ctx.fillStyle = "#b8935a";
        ctx.fillRect(w * 0.35, h * 0.05, w * 0.3, h * 0.15);
        // Windows
        ctx.fillStyle = "#5a9bd5";
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 4; col++) {
                ctx.fillRect(w * 0.15 + col * w * 0.18, h * 0.2 + row * h * 0.13, w * 0.1, h * 0.08);
            }
        }

        // Ground
        ctx.fillStyle = "#6b8f5a";
        ctx.fillRect(0, h * 0.55, w, h * 0.45);

        // Draw 2-3 children
        const numKids = 2 + Math.floor(rng() * 2);
        const spacing = w / (numKids + 1);
        for (let i = 0; i < numKids; i++) {
            drawSmallChild(ctx, spacing * (i + 1), h * 0.5, rng, 0.3);
        }
    }

    function drawWinterScene(ctx, w, h, rng) {
        // Snowy sky
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        skyGrad.addColorStop(0, "#b0c4de");
        skyGrad.addColorStop(1, "#e8e8e8");
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);

        // Snowy ground
        ctx.fillStyle = "#f0f0f0";
        ctx.fillRect(0, h * 0.6, w, h * 0.4);

        // Snow-covered trees
        for (let i = 0; i < 3; i++) {
            const tx = rng() * w;
            const ty = h * 0.35 + rng() * h * 0.15;
            ctx.fillStyle = "#2d5a27";
            ctx.beginPath();
            ctx.moveTo(tx, ty - 30);
            ctx.lineTo(tx - 18, ty + 10);
            ctx.lineTo(tx + 18, ty + 10);
            ctx.fill();
            ctx.fillStyle = "#f5f5f5";
            ctx.beginPath();
            ctx.moveTo(tx, ty - 30);
            ctx.lineTo(tx - 12, ty - 12);
            ctx.lineTo(tx + 12, ty - 12);
            ctx.fill();
            ctx.fillStyle = "#5a3a1a";
            ctx.fillRect(tx - 3, ty + 10, 6, 12);
        }

        // Snowflakes
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        for (let i = 0; i < 30; i++) {
            ctx.beginPath();
            ctx.arc(rng() * w, rng() * h, 1.5 + rng() * 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Child with winter clothes
        drawWinterChild(ctx, w * 0.5, h * 0.52, rng);
    }

    function drawClassroomScene(ctx, w, h, rng) {
        // Classroom wall
        ctx.fillStyle = "#f5e6d3";
        ctx.fillRect(0, 0, w, h);

        // Blackboard
        ctx.fillStyle = "#2d5a27";
        ctx.fillRect(w * 0.15, h * 0.05, w * 0.7, h * 0.35);
        ctx.fillStyle = "#3d7a37";
        ctx.fillRect(w * 0.17, h * 0.07, w * 0.66, h * 0.31);
        // Chalk text
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.font = "8px Arial";
        ctx.fillText("A B C Ç D", w * 0.25, h * 0.2);
        ctx.fillText("1 + 2 = 3", w * 0.25, h * 0.3);

        // Desk
        ctx.fillStyle = "#8B6914";
        ctx.fillRect(w * 0.1, h * 0.65, w * 0.8, h * 0.06);
        ctx.fillStyle = "#6d5010";
        ctx.fillRect(w * 0.15, h * 0.71, w * 0.05, h * 0.2);
        ctx.fillRect(w * 0.8, h * 0.71, w * 0.05, h * 0.2);

        // Student at desk
        drawSmallChild(ctx, w * 0.5, h * 0.57, rng, 0.3);

        // Books on desk
        const bookColors = ["#c0392b", "#2980b9", "#27ae60"];
        bookColors.forEach((color, i) => {
            ctx.fillStyle = color;
            ctx.fillRect(w * 0.6 + i * 12, h * 0.6, 10, h * 0.05);
        });
    }

    // Helper functions to draw people
    function drawChildSilhouette(ctx, x, y, scale, rng) {
        const s = scale * 100;
        // Backpack
        ctx.fillStyle = "#c0392b";
        ctx.fillRect(x - s * 0.2, y - s * 0.3, s * 0.35, s * 0.4);

        // Body
        ctx.fillStyle = "#34495e";
        ctx.fillRect(x - s * 0.15, y - s * 0.4, s * 0.3, s * 0.6);

        // Head
        const skinTones = ["#f5d0a9", "#e8c196", "#d4a574"];
        ctx.fillStyle = skinTones[Math.floor(rng() * skinTones.length)];
        ctx.beginPath();
        ctx.arc(x, y - s * 0.5, s * 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        ctx.fillStyle = "#2c1810";
        ctx.beginPath();
        ctx.arc(x, y - s * 0.55, s * 0.15, Math.PI, Math.PI * 2);
        ctx.fill();

        // Legs
        ctx.fillStyle = "#2c3e50";
        ctx.fillRect(x - s * 0.1, y + s * 0.2, s * 0.08, s * 0.3);
        ctx.fillRect(x + s * 0.02, y + s * 0.2, s * 0.08, s * 0.3);
    }

    function drawSmallChild(ctx, x, y, rng, scale) {
        const s = scale * 100;
        const skinTones = ["#f5d0a9", "#e8c196", "#d4a574"];
        const skinColor = skinTones[Math.floor(rng() * skinTones.length)];
        const hairColors = ["#2c1810", "#4a3020", "#1a0e08", "#6b4423"];
        const hairColor = hairColors[Math.floor(rng() * hairColors.length)];
        const uniformColors = ["#1a3c6e", "#2e4053", "#1a5276", "#4a235a"];
        const uniformColor = uniformColors[Math.floor(rng() * uniformColors.length)];

        // Body
        ctx.fillStyle = uniformColor;
        ctx.beginPath();
        ctx.moveTo(x - s * 0.25, y + s * 0.6);
        ctx.quadraticCurveTo(x, y + s * 0.05, x + s * 0.25, y + s * 0.6);
        ctx.fill();

        // Head
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.arc(x, y - s * 0.1, s * 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        ctx.fillStyle = hairColor;
        ctx.beginPath();
        ctx.arc(x, y - s * 0.15, s * 0.2, Math.PI, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = "#3d2b1f";
        ctx.beginPath();
        ctx.arc(x - s * 0.07, y - s * 0.12, 2, 0, Math.PI * 2);
        ctx.arc(x + s * 0.07, y - s * 0.12, 2, 0, Math.PI * 2);
        ctx.fill();

        // Smile
        ctx.strokeStyle = "#c0736a";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y - s * 0.02, s * 0.06, 0.2, Math.PI - 0.2);
        ctx.stroke();
    }

    function drawWinterChild(ctx, x, y, rng) {
        const s = 35;
        const skinTones = ["#f5d0a9", "#e8c196"];
        const skinColor = skinTones[Math.floor(rng() * skinTones.length)];
        const coatColors = ["#c0392b", "#2980b9", "#8e44ad", "#e67e22"];
        const coatColor = coatColors[Math.floor(rng() * coatColors.length)];

        // Coat body
        ctx.fillStyle = coatColor;
        ctx.beginPath();
        ctx.moveTo(x - s * 0.5, y + s * 1.2);
        ctx.quadraticCurveTo(x - s * 0.4, y, x, y - s * 0.1);
        ctx.quadraticCurveTo(x + s * 0.4, y, x + s * 0.5, y + s * 1.2);
        ctx.fill();

        // Head
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.arc(x, y - s * 0.4, s * 0.35, 0, Math.PI * 2);
        ctx.fill();

        // Beanie
        ctx.fillStyle = "#e74c3c";
        ctx.beginPath();
        ctx.arc(x, y - s * 0.45, s * 0.35, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(x - s * 0.35, y - s * 0.5, s * 0.7, s * 0.1);
        // Pompon
        ctx.beginPath();
        ctx.arc(x, y - s * 0.8, s * 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = "#3d2b1f";
        ctx.beginPath();
        ctx.arc(x - 5, y - s * 0.4, 2, 0, Math.PI * 2);
        ctx.arc(x + 5, y - s * 0.4, 2, 0, Math.PI * 2);
        ctx.fill();

        // Scarf
        ctx.fillStyle = "#f1c40f";
        ctx.fillRect(x - s * 0.3, y - s * 0.1, s * 0.6, s * 0.15);

        // Legs
        ctx.fillStyle = "#2c3e50";
        ctx.fillRect(x - s * 0.2, y + s * 1.2, s * 0.15, s * 0.5);
        ctx.fillRect(x + s * 0.05, y + s * 1.2, s * 0.15, s * 0.5);
    }

    function darkenColor(hex, factor) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${Math.floor(r * factor)},${Math.floor(g * factor)},${Math.floor(b * factor)})`;
    }

    // ===================== CREATE IMAGES =====================
    const sceneTypes = [drawLandscape, drawPortrait, drawGroupPhoto, drawWinterScene, drawClassroomScene];

    // Shuffle scene order
    for (let i = sceneTypes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sceneTypes[i], sceneTypes[j]] = [sceneTypes[j], sceneTypes[i]];
    }

    imageContainer.innerHTML = "";

    for (let i = 0; i < imageCount; i++) {
        const canvas = document.createElement("canvas");
        canvas.width = 120;
        canvas.height = 120;
        const ctx = canvas.getContext("2d");

        // Create a unique seed for each image
        const seed = Date.now() + i * 9973 + Math.floor(Math.random() * 10000);
        const rng = mulberry32(seed);

        // Draw scene
        sceneTypes[i % sceneTypes.length](ctx, 120, 120, rng);

        const div = document.createElement("div");
        div.className = "image-option";
        div.innerHTML = `
            <input type="radio" name="student-image" id="img${i}" value="${i + 1}">
            <label for="img${i}" style="width:auto; margin:0; color:inherit;">Seç</label>
        `;

        canvas.style.border = "2px solid #2c3e50";
        canvas.style.cursor = "pointer";
        canvas.onclick = function () {
            document.getElementById("img" + i).checked = true;
        };

        div.appendChild(canvas);
        imageContainer.appendChild(div);
    }
});
