# 🧋 HuyCha Sales Summarizer & Logger

Aplikasi web modern untuk **merangkum dan mencatat hasil penjualan** dari file ekspor kasir POS (seperti Pawoon POS). 

Dibuat khusus untuk menyelesaikan masalah pencatatan produk yang terlalu mendetail (seperti perbedaan level gula & es: `100% - 70%`, `50% - 70%`, `30% - 30%`), sehingga produk yang sama tidak lagi terpecah menjadi produk terpisah yang berdiri sendiri.

---

## ✨ Fitur Utama

1. **Pembersihan Cerdas Varian Produk**:
   - Menghapus detail kustomisasi persentase gula (*sugar level*) dan es (*ice level*) secara otomatis.
   - Contoh: `Roasted Smoky Oolong Milk Tea - 16 oz - 100% - 70%` &rarr; `Roasted Smoky Oolong Milk Tea - 16 oz`.
   - Menyatukan baris-baris varian tersebut menjadi satu nama produk pokok dengan total kuantitas (*cup*) dan omset yang tepat secara matematis.
2. **Akordion Rincian Asal Varian**:
   - Klik pada nama produk untuk melihat rincian breakdown varian gula/es asli dan kontribusinya.
3. **Mencatat Hasil Rangkuman (History & Notes)**:
   - Fitur **"Simpan ke Catatan Riwayat"** untuk mencatat rekap harian ke penyimpanan lokal browser (*LocalStorage*).
   - Menambahkan catatan harian (misal: "Hari ini hujan lebat sore", "Promo GoFood 20%").
   - Fitur Backup & Restore data riwayat dalam format JSON.
4. **Ekspor & Berbagi Multiformat**:
   - **Download Excel (.xlsx)**: File spreadsheet bersih siap pakai lengkap dengan header dan baris grand total.
   - **Download CSV**: Kompatibel dengan semua spreadsheet atau sistem database.
   - **Format Pesan WhatsApp**: Format rekap pesan teks yang rapi dan elegan, siap disalin atau dikirim langsung ke grup WhatsApp tim / owner.
   - **Cetak Laporan / PDF**: Tampilan cetak yang telah dioptimasi khusus untuk printer atau simpan ke PDF.
5. **Dukungan Format File Luas**:
   - Mendukung format `.xls` (Pawoon POS), `.xlsx` (Excel modern), dan `.csv`.
   - Fitur tombol instan **"Muat Contoh Laporan HuyCha"** untuk pengujian langsung.
6. **100% Client-Side Safe & Offline Capable**:
   - Semua kalkulasi diproses langsung di peramban web pengguna, data omset dan keuangan rahasia Anda aman dan tidak pernah dikirim ke pihak luar.

---

## 🚀 Cara Menjalankan di Komputer Lokal

1. Buka folder proyek di terminal / PowerShell:
   ```bash
   cd C:\Project\HuyCha
   ```
2. Jalankan server lokal:
   ```bash
   npm run dev
   ```
3. Buka browser di alamat:
   ```
   http://localhost:3000
   ```

---

## 🌐 Cara Deploy ke Vercel (Online Kapanpun & Gratis)

Anda dapat men-deploy aplikasi ini ke **Vercel** agar bisa diakses kapan saja melalui HP, laptop, atau tablet dari outlet mana pun secara online.

### Metode 1: Lewat GitHub & Web Vercel (Direkomendasikan)
1. Buat repository baru di akun GitHub Anda (misal dinamai `huycha-sales`).
2. Di folder proyek ini, jalankan perintah git:
   ```bash
   git init
   git add .
   git commit -m "Inisialisasi aplikasi perangkum penjualan HuyCha"
   git branch -M main
   git remote add origin https://github.com/USERNAME-ANDA/huycha-sales.git
   git push -u origin main
   ```
3. Buka [https://vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
4. Klik tombol **"Add New..."** &rarr; pilih **"Project"**.
5. Pilih repository `huycha-sales` yang baru saja Anda buat.
6. Vercel akan otomatis mendeteksi konfigurasi:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
7. Klik tombol **"Deploy"**.
8. Dalam hitungan detik, aplikasi web Anda sudah aktif dan live dengan URL publik (contoh: `https://huycha-sales.vercel.app`)!

---

### Metode 2: Lewat Vercel CLI (Langsung dari Terminal)
1. Pasang Vercel CLI secara global (jika belum ada):
   ```bash
   npm install -g vercel
   ```
2. Jalankan perintah deploy di folder proyek:
   ```bash
   vercel
   ```
3. Ikuti petunjuk di layar (tekan Enter untuk pilihan default).
4. Untuk deploy ke domain production:
   ```bash
   vercel --prod
   ```

---

## 📁 Struktur Folder Proyek

```text
HuyCha/
├── Laporan/                   # Folder contoh file laporan penjualan Pawoon POS
│   └── Laporan_Penjualan_Produk_-_HuyCha_...xls
├── public/                    # Aset statis & contoh file uji
│   └── sample-report.xls
├── src/
│   ├── components/            # Komponen antarmuka pengguna (React)
│   │   ├── ActionToolbar.jsx  # Tombol simpan, download Excel/CSV, cetak
│   │   ├── FileUpload.jsx     # Upload dropzone & loader contoh file
│   │   ├── Guide.jsx          # Panduan cara kerja & instruksi deploy
│   │   ├── Header.jsx         # Navigasi & logo HuyCha
│   │   ├── ProductTable.jsx   # Tabel produk bersih dengan akordion rincian
│   │   ├── SavedRecords.jsx   # Manajemen riwayat catatan tersimpan
│   │   ├── SummaryStats.jsx   # Kartu metrik KPI omset, cup, diskon, best seller
│   │   └── WhatsAppModal.jsx  # Generator pesan rekap siap kirim WhatsApp
│   ├── utils/
│   │   ├── exporter.js        # Utilitas ekspor ke .xlsx, CSV, dan format WA
│   │   ├── parser.js          # Pembersih sugar/ice % dan kalkulasi omset
│   │   └── storage.js         # Utilitas penyimpanan lokal (LocalStorage)
│   ├── App.jsx                # Komponen utama
│   ├── index.css              # Konfigurasi Tailwind & print CSS
│   └── main.jsx               # Entry point aplikasi
├── package.json               # Dependensi proyek
├── tailwind.config.js         # Konfigurasi tema warna HuyCha
├── vercel.json                # Konfigurasi deployment Vercel
├── vite.config.js             # Konfigurasi Vite & code splitting
└── README.md                  # Dokumentasi proyek
```
