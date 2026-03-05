<div align="center">

# 🔒 VBS-SecLab

### Vulnerable by Design — A Cybersecurity Education Platform

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Python](https://img.shields.io/badge/Python-3.x-3776AB?logo=python&logoColor=white)](https://python.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Educational](https://img.shields.io/badge/Purpose-Educational%20Only-red)](#%EF%B8%8F-disclaimer)

**🇬🇧 [English](#-overview)** · **🇹🇷 [Türkçe](#-genel-bakış)**

<img src="https://img.shields.io/badge/⚠️-DO%20NOT%20USE%20IN%20PRODUCTION-FF0000?style=for-the-badge" alt="Warning" />

</div>

---

## 📖 Overview

**VBS-SecLab** is an intentionally vulnerable web application modeled after Turkey's legacy **e-Okul VBS (Veli Bilgilendirme Sistemi)** student verification interface. It is designed as a hands-on cybersecurity training lab where students can discover, exploit, and understand common web vulnerabilities in a safe, controlled environment.

> [!CAUTION]
> This application contains **intentional security vulnerabilities**. It is built strictly for **educational and research purposes**. Never deploy this on a public server or use it against real systems.

## 🎯 Purpose

- Teach **OWASP Top 10** vulnerability concepts through practical exercises
- Provide a realistic, culturally relevant lab environment for Turkish cybersecurity students
- Demonstrate the gap between vulnerable and secure code with side-by-side examples
- Offer ready-to-use exploit scripts for understanding attacker methodology

## 🛡️ Vulnerabilities

### 1. Brute-Force Attack (No Rate Limiting)

| Category | Detail |
|----------|--------|
| **OWASP** | A07:2021 – Identification and Authentication Failures |
| **Location** | `POST /login` |
| **Description** | The login endpoint accepts unlimited requests with no rate limiting, account lockout, or CAPTCHA. An attacker can systematically try all possible student numbers. |
| **Impact** | Complete credential enumeration in seconds (~500+ requests/sec) |
| **Exploit** | Run `python brute_force.py` — iterates 0001–9999 and finds valid credentials |

**Remediation (Best Practices):**

```javascript
// ✅ Secure: Implement rate limiting with express-rate-limit
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,   // 15-minute window
    max: 5,                      // 5 attempts per window
    message: { error: 'Too many login attempts. Try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.post('/login', loginLimiter, (req, res) => { /* ... */ });
```

Additional measures:
- Implement **progressive delays** (exponential backoff)
- Add **CAPTCHA** after 3 failed attempts
- Deploy **account lockout** policies
- Use **fail2ban** or WAF-level blocking

---

### 2. IDOR (Insecure Direct Object Reference)

| Category | Detail |
|----------|--------|
| **OWASP** | A01:2021 – Broken Access Control |
| **Location** | `GET /api/student?id=X`, `GET /dashboard?studentId=X` |
| **Description** | After authentication, the application uses sequential, predictable student IDs in the URL. No server-side authorization check verifies whether the logged-in user owns the requested resource. |
| **Impact** | Any authenticated user can access any student's report card by changing the `studentId` parameter (e.g., `?studentId=124`, `?studentId=125`) |
| **Exploit** | Simply modify the URL in the browser address bar |

**Remediation (Best Practices):**

```javascript
// ✅ Secure: Server-side authorization check
app.get('/api/student', authenticateToken, (req, res) => {
    const loggedInUserId = req.user.studentId;  // From JWT/session
    const requestedId = parseInt(req.query.id);

    // Verify ownership
    if (loggedInUserId !== requestedId) {
        return res.status(403).json({
            error: 'Access denied. You can only view your own records.'
        });
    }
    // ... return data
});
```

Additional measures:
- Use **UUIDs** instead of sequential integers (`a3f8b2c1-9d4e-...` vs `123`)
- Implement **Role-Based Access Control (RBAC)**
- Enforce authorization at the **data access layer**, not just the API layer
- Log and alert on **horizontal privilege escalation** attempts

---

### 3. Client-Side Information Disclosure

| Category | Detail |
|----------|--------|
| **OWASP** | A04:2021 – Insecure Design |
| **Location** | `script.js`, `GET /api/verification-data` |
| **Description** | The correct answer to the image verification challenge is leaked through **7 distinct vectors**, all discoverable via browser DevTools (F12). |
| **Impact** | Complete bypass of the image-based verification step |

**Discovery Vectors:**

| # | Vector | DevTools Tab | What's Exposed |
|---|--------|-------------|----------------|
| 0 | `/api/verification-data` response | **Network** | `{"correctImageId": X, "_debug": {"answer": X}}` |
| 1 | `window.__studentVerification` | **Console** | Global object with correct image ID |
| 2 | `console.log("[DEBUG]...")` | **Console** | `Doğru resim ID: X` |
| 3 | `class="correct-student"` | **Elements** | CSS class only on correct image |
| 4 | `data-correct="true"` | **Elements** | Data attribute on correct div |
| 5 | `data-role="verified-student-photo"` | **Elements** | Data attribute on correct canvas |
| 6 | `<!-- Doğru resim ID = X -->` | **Elements** | HTML comment with answer |

**Remediation (Best Practices):**

```javascript
// ✅ Secure: Server-side verification only
// The client should NEVER receive the correct answer.
// Instead, submit the user's choice and validate server-side.

app.post('/verify-image', (req, res) => {
    const { selectedImageId, sessionToken } = req.body;
    const session = sessions.get(sessionToken);

    if (session.correctImageId === selectedImageId) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});
```

Additional measures:
- **Never expose** verification answers in API responses, DOM, or console
- Remove **all debug logging** in production builds
- Use **environment-based configuration** (`NODE_ENV=production`)
- Implement **Content Security Policy (CSP)** headers
- Run **static analysis** tools to detect information leaks

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [Python 3](https://python.org/) (for exploit scripts)

### Installation

```bash
# Clone the repository
git clone https://github.com/efekrbas/e-okul-eski-dogrulama-sayfasi.git
cd e-okul-eski-dogrulama-sayfasi

# Install dependencies
npm install

# Start the server
npm start
```

Then open **http://localhost:3000** in your browser.

### Running the Exploit

```bash
# Brute-force attack (requires server running)
python brute_force.py
```

### Test Credentials

| City | Student No | Image | Student ID |
|------|-----------|-------|------------|
| ANKARA | 1234 | *(dynamic)* | 123 |
| ISTANBUL | 5678 | *(dynamic)* | 124 |
| IZMIR | 9012 | *(dynamic)* | 125 |

## 📁 Project Structure

```
VBS-SecLab/
├── server.js           # Express backend with vulnerable endpoints
├── index.html          # Login page (VBS verification form)
├── dashboard.html      # Student report card (IDOR target)
├── script.js           # Client-side logic (info disclosure vectors)
├── style.css           # Responsive styling
├── brute_force.py      # Brute-force exploit script
├── package.json        # Node.js dependencies
└── README.md           # This file
```

## 🧪 Lab Exercises

| Exercise | Difficulty | Goal |
|----------|-----------|------|
| 🟢 Find the correct image via F12 | Easy | Inspect DOM/Console to find `data-correct="true"` |
| 🟢 Read the API response in Network tab | Easy | Observe `/api/verification-data` response |
| 🟡 Brute-force the student number | Medium | Run `brute_force.py` or craft your own script |
| 🟡 Access another student's grades (IDOR) | Medium | Change `studentId` in URL after login |
| 🔴 Chain all vulnerabilities | Hard | Use info disclosure → brute-force → IDOR sequentially |

## ⚖️ Legal & Ethical Notice

> [!WARNING]
> - This tool is for **authorized educational use only**
> - Do **NOT** use these techniques against systems you don't own
> - Unauthorized access to computer systems is **illegal** under Turkish Penal Code (TCK 243-245) and international law (CFAA, Computer Misuse Act, etc.)
> - The author assumes **no liability** for misuse

## 📚 References

- [OWASP Top 10 (2021)](https://owasp.org/Top10/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [PortSwigger Web Security Academy](https://portswigger.net/web-security)
- [CWE-307: Improper Restriction of Excessive Authentication Attempts](https://cwe.mitre.org/data/definitions/307.html)
- [CWE-639: Authorization Bypass Through User-Controlled Key (IDOR)](https://cwe.mitre.org/data/definitions/639.html)
- [CWE-200: Exposure of Sensitive Information](https://cwe.mitre.org/data/definitions/200.html)

---

<div align="center">

# 🇹🇷 Türkçe

</div>

## 📖 Genel Bakış

**VBS-SecLab**, Türkiye'deki eski **e-Okul VBS (Veli Bilgilendirme Sistemi)** doğrulama arayüzünü temel alan, **kasıtlı olarak zafiyetli** bırakılmış bir web uygulamasıdır. Siber güvenlik öğrencilerinin yaygın web güvenlik açıklarını güvenli bir ortamda keşfetmesi, sömürmesi ve anlaması için tasarlanmıştır.

> [!CAUTION]
> Bu uygulama **kasıtlı güvenlik açıkları** içermektedir. Yalnızca **eğitim ve araştırma amaçlıdır**. Gerçek sistemlerde veya halka açık sunucularda asla kullanmayın.

## 🛡️ Zafiyetler

### 1. Brute-Force Saldırısı (Rate Limiting Yok)
- **Konum:** `POST /login`
- **Açıklama:** Login endpoint'i sınırsız istek kabul eder. Saldırgan tüm öğrenci numaralarını saniyeler içinde deneyebilir (~500+ istek/sn).
- **Exploit:** `python brute_force.py` komutunu çalıştırın.
- **Çözüm:** `express-rate-limit` ile istek sınırlama, CAPTCHA, hesap kilitleme.

### 2. IDOR (Güvensiz Doğrudan Nesne Referansı)
- **Konum:** `GET /api/student?id=X`, `GET /dashboard?studentId=X`
- **Açıklama:** URL'deki `studentId` değeri değiştirilerek başka öğrencilerin karne bilgilerine erişilebilir.
- **Exploit:** Tarayıcı adres çubuğunda `studentId` parametresini değiştirin.
- **Çözüm:** Sunucu taraflı yetkilendirme (JWT/session kontrolü), UUID kullanımı, RBAC.

### 3. İstemci Taraflı Bilgi Sızıntısı
- **Konum:** `script.js`, `GET /api/verification-data`
- **Açıklama:** Doğru resim cevabı F12 DevTools ile 7 farklı yoldan keşfedilebilir.
- **Exploit:** F12 > Console/Elements/Network sekmelerini inceleyin.
- **Çözüm:** Doğrulama mantığını sunucu tarafında tutun, debug loglarını kaldırın, CSP uygulayın.

## 🚀 Hızlı Başlangıç

```bash
git clone https://github.com/efekrbas/e-okul-eski-dogrulama-sayfasi.git
cd e-okul-eski-dogrulama-sayfasi
npm install
npm start
# Tarayıcıda http://localhost:3000 açın
```

## ⚖️ Yasal Uyarı

> [!WARNING]
> - Bu araç yalnızca **yetkili eğitim kullanımı** içindir
> - Bu teknikleri size ait olmayan sistemlere karşı **KULLANMAYIN**
> - Yetkisiz erişim Türk Ceza Kanunu (TCK 243-245) ve uluslararası yasalar kapsamında **suçtur**

---

<div align="center">

Made with ❤️ for cybersecurity education

**[⬆ Back to Top](#-vbs-seclab)**

</div>
