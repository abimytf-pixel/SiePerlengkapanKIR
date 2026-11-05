# Sie Perlengkapan KIR — Camp Riset 2026

Aplikasi manajemen peminjaman alat berbasis PWA (Progressive Web App) untuk kegiatan Camp Riset KIR MAN 1 Jombang.

## Fitur

- 📷 Scanner barcode/QR Code (Code 128) via kamera
- 📋 Import data master alat dari Excel (`.xlsx`)
- 📊 Export laporan peminjaman ke Excel
- 🔄 Sinkronisasi data ke Firebase Firestore
- 📱 Dapat diinstall sebagai aplikasi (PWA)
- ✈️ Bekerja offline (IndexedDB + Service Worker)

## Struktur File

```
pwa-inventaris-kir/
├── index.html        — Struktur tampilan & pemanggilan resource
├── style.css         — Seluruh desain tampilan (CSS)
├── db.js             — IndexedDB wrapper (penyimpanan lokal)
├── app.js            — Logika utama, Scanner, & Excel
├── firebase-sync.js  — Konfigurasi & sinkronisasi Firebase
├── sw.js             — Service Worker (PWA Offline)
└── manifest.json     — Konfigurasi instalasi PWA
```

## Setup & Deployment

### 1. Konfigurasi Firebase (Opsional — untuk sync cloud)

Buka [`firebase-sync.js`](firebase-sync.js) dan ganti nilai placeholder:

```js
const firebaseConfig = {
  apiKey:            "GANTI_DENGAN_API_KEY_ANDA",
  authDomain:        "GANTI_DENGAN_AUTH_DOMAIN_ANDA",
  projectId:         "GANTI_DENGAN_PROJECT_ID_ANDA",
  // ...
};
```

> ⚠️ **JANGAN** commit file ini ke GitHub publik jika berisi API Key asli!
> Gunakan GitHub Actions Secrets atau Cloudflare Pages environment variables.

### 2. Deploy ke GitHub Pages

```bash
# 1. Buat repository baru di GitHub

# 2. Push folder ini ke repository
git init
git add .
git commit -m "Initial commit: PWA Sie Perlengkapan KIR"
git remote add origin https://github.com/USERNAME/REPO_NAME.git
git push -u origin main

# 3. Aktifkan GitHub Pages di Settings > Pages
#    Source: Deploy from branch > main > / (root)
```

Setelah deploy, akses aplikasi di:
`https://USERNAME.github.io/REPO_NAME`

### 3. Format Excel untuk Import Master Alat

File Excel harus memiliki header tepat seperti berikut:

| Kode Barcode | Nama Alat | Batas Pinjam |
|---|---|---|
| ALT001 | Tenda Dome | 2 |
| ALT002 | Kompas | - |

- **Kode Barcode**: harus unik, akan dikonversi ke huruf kapital
- **Nama Alat**: nama yang akan tampil di aplikasi
- **Batas Pinjam**: angka (maks per kelompok), isi `-` untuk tanpa batas

## Catatan Keamanan

| Risiko | Status | Mitigasi |
|---|---|---|
| XSS via innerHTML | ✅ Diperbaiki | Semua data user dirender via `escapeHTML()` / `textContent` |
| Regex Injection | ✅ Diperbaiki | Input di-escape dengan `escapeRegex()` sebelum masuk `RegExp` |
| Validasi import Excel | ✅ Diperbaiki | Tipe file, panjang field, & karakter divalidasi |
| ID transaksi mudah ditebak | ✅ Diperbaiki | ID menggunakan `timestamp + random string` |
| CDN tanpa SRI | ⚠️ Sebagian | FontAwesome sudah ada SRI; Tailwind CDN tidak support SRI |
| Firebase tanpa auth | ℹ️ Perlu setup | Tambahkan Firebase Auth & Firestore Security Rules |
