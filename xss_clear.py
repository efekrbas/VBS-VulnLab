"""
Stored XSS Temizleyici Scripti
======================================
Bu script, /api/notes/clear endpoint'ine istek atarak
sunucudaki tüm zararlı XSS payloadlarını temizler.
"""

import requests
import sys

BASE_URL = "http://localhost:3000"
CLEAR_URL = f"{BASE_URL}/api/notes/clear"
ADMIN_URL = f"{BASE_URL}/api/admin/dump"

def clear_notes():
    print("=" * 60)
    print("  Stored XSS Temizleyici Başlatılıyor...")
    print("=" * 60)

    # Adım 1: Admin dump'dan öğrenci ID'lerini al
    print()
    print("  [*] Adım 1: Admin dump'dan öğrenci ID'leri inceleniyor...")
    student_ids = []
    try:
        res = requests.get(ADMIN_URL)
        data = res.json()
        student_ids = list(data.get("allStudents", {}).keys())
        print(f"  [+] {len(student_ids)} öğrenci bulundu: {student_ids}")
    except Exception as e:
        print(f"  [!] Admin dump'a erişilemedi: {e}")

    # Adım 2: Temizleme İsteği Gönder
    print()
    print("  [*] Adım 2: Sunucudaki Stored XSS payload'ları temizleniyor...")
    print(f"  [*] Hedef endpoint: /api/notes/clear")

    try:
        res = requests.get(CLEAR_URL)
        data = res.json()

        if data.get("success"):
            print()
            print("!" * 60)
            print("  [+] XSS PAYLOADLARI BAŞARIYLA TEMİZLENDİ!")
            print(f"  [+] Temizlenen Öğrenci ID'leri: {student_ids}")
            print(f"  [+] Sunucu Mesajı: {data.get('message')}")
            print()
            print("  [*] Kurban artık sayfayı güvenle açabilir.")
            print("!" * 60)
        else:
            print(f"  [-] Temizleme başarısız: {data.get('message')}")

    except requests.exceptions.ConnectionError:
        print("  [!] Sunucuya bağlanılamıyor! Sunucunun çalıştığından emin olun.")
    except Exception as e:
        print(f"  [!] Hata: {e}")

if __name__ == "__main__":
    clear_notes()
    input("\nÇıkmak için Enter'a basın...")
