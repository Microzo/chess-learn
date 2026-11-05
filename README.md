# Chess-Learn

Game catur offline ala chess.com: belajar lawan bot dengan analisa langkah live, PvP di satu perangkat, dan replay dengan analisa penuh. Berjalan di browser laptop maupun HP.

## Fitur
| Mode | Deskripsi |
|---|---|
| **Belajar Strategi** | 40 pelajaran (dasar, 14 opening teruji, taktik, strategi middlegame, endgame termasuk Lucena dan Philidor, pola mat) dengan demo interaktif langkah demi langkah di papan, 12 puzzle **Latihan taktik** dengan petunjuk, dan glosarium 45 istilah. Tiap pelajaran opening punya mode **Latih sendiri**: Anda memainkan satu sisi, lawan membalas sesuai teori, dan langkah di luar teori dikoreksi. Progres tersimpan di perangkat. Posisi demo dan puzzle diperiksa dengan Stockfish. |
| **Belajar vs Bot** | 8 level bot. Setiap langkah langsung diberi label (Teori, Terbaik, Sangat baik, Bagus, Kurang akurat, Kesalahan, Blunder), selisih evaluasi, dan langkah terbaik. Ada tombol Saran dan Ulangi, bar dominasi (siapa yang unggul), lencana kategori di pojok kanan atas bidak yang baru bergerak (bisa dimatikan di Pengaturan), dan tombol **Kenapa?** (analisa mendalam). |
| **Main berdua (PvP)** | Dua pemain di satu layar, papan tidak berputar (dimainkan berdua di satu layar), jam catur (1 sampai 15 menit, dengan atau tanpa tambahan waktu), batal langkah (tanpa jam), remis, menyerah. |
| **Partai Legendaris** | Delapan partai kelas dunia (Opera Game, Immortal Game, Evergreen Game, Game of the Century, Immortal Zugzwang Game, Kasparov–Topalov 1999, Deep Blue–Kasparov 1997, Fischer–Spassky 1972) sebagai replay dengan catatan Indonesia di langkah penting, poin pelajaran, dan penjelasan notasi. Bisa dianalisa engine atau disimpan ke Replay. Catatan tersedia dalam English dan Indonesia. Data di `src/data/classics.ts` dan `src/data/en/`; tes memvalidasi legalitas langkah, jumlah langkah, dan kecocokan tiap catatan dengan langkahnya. |
| **Latihan Endgame** | Sepuluh endgame klasik (raja+ratu, raja+benteng, dua benteng, jebakan pat, oposisi, aturan kotak, Lucena, Philidor, dua gajah, gajah beda warna) melawan bot terkuat. Sasaran menang atau bertahan remis; ada tombol Saran engine dan tautan ke pelajaran terkait. |
| **Ujian & Progres** | Ujian per level (Pemula, Menengah, Lanjut): 6 soal teori acak dari bank 15 soal per level + 4 puzzle papan, lulus di 70%. Menampilkan level saat ini, skor terbaik, akurasi per topik, dan soal yang salah beserta tautan pelajaran. Tanpa akun: progres tersimpan di perangkat dan bisa diekspor/diimpor sebagai JSON. |
| **Replay & Analisa** | Navigasi langkah (tombol/panah keyboard), lencana kategori di papan, mode **Mendalam** yang menjelaskan alasan skor tiap langkah (perubahan peluang menang, skakmat yang terlewat, buah menggantung, tema posisional seperti bidak ganda/terisolasi/lolos, kolom terbuka, keamanan raja, mobilitas, ancaman baru pada buah lawan, dan pertahanan buah sendiri, serta pilihan engine dan kelanjutannya), grafik evaluasi, akurasi per pemain, ringkasan kategori, nama opening, papan alternatif terbaik. Bisa impor PGN, salin atau unduh PGN, dan cadangkan atau pulihkan semua partai (berkas JSON). |
| **Pengaturan** | Bahasa (English bawaan, Bahasa Indonesia), tema gelap/terang, empat warna papan, koordinat, bar dominasi, efek suara dan volume. Tersimpan di perangkat. |

Partai tersimpan otomatis di perangkat (localStorage).

## Stack
TypeScript, Vite, chess.js (aturan), Stockfish 17.1 WASM lite single-thread di Web Worker (bot + analisa). Tanpa backend, semua jalan di perangkat.

## Menjalankan
```
npm install        # sekaligus menyalin engine ke public/engine
npm run dev        # http://localhost:5173 (hanya komputer ini; untuk HP lihat bawah)
npm test          # tes unit + tes layar (vitest, DOM tiruan), tanpa browser
npm run test:e2e   # tes end-to-end di browser sungguhan + engine asli + offline (Playwright)
npm run build      # hasil di dist/
npm run preview    # uji build produksi di http://localhost:4173
```

### Main di HP (satu jaringan Wi-Fi dengan laptop)
1. `npm run dev -- --host` (atau `npm run build && npm run preview -- --host`). Ini membuka server ke seluruh jaringan Wi-Fi; pakai hanya di jaringan tepercaya dan matikan setelah selesai (server dev Vite bukan untuk jaringan publik).
2. Buka `http://<IP-laptop>:5173` di browser HP (cek IP dengan `ipconfig`). Izinkan Node.js di Windows Firewall bila diminta.
3. Ini hanya jalan selama laptop menyala. Untuk offline sungguhan di HP, hosting `dist/` di HTTPS (lihat di bawah).

### Offline di HP / bisa di-install
Service worker (PWA) hanya aktif di HTTPS atau localhost. Upload isi `dist/` sekali ke hosting statis gratis (GitHub Pages, Cloudflare Pages, Netlify), buka di HP, pilih "Tambahkan ke layar utama". Setelah itu semua, termasuk engine, tersimpan dan bisa dimainkan tanpa internet.

## Struktur
```
src/
├─ core/        logika murni tanpa UI
│  ├─ game/       status permainan, PGN
│  ├─ engine/     wrapper UCI Stockfish, level bot
│  ├─ analysis/   classifier, deteksi opening, analyzer, akurasi
│  └─ storage/    simpan partai
├─ modes/       learning/  lessons/ (pelajaran, puzzle)  pvp/  replay/
├─ ui/          board/  panels/  screens/  styles/
├─ data/        daftar opening (ECO), materi pelajaran dan glosarium
└─ types/
public/         engine/ (Stockfish), icons/, manifest, sw.js
scripts/        copy-engine, make-icons
tests/          vitest: analysis/ game/ lessons/ storage/ ui/ (layar, DOM tiruan); e2e/ (Playwright)
```

## Cara penilaian langkah
Evaluasi engine diubah ke peluang menang; kategori ditentukan dari penurunan peluang menang bagi pemain yang melangkah (ambang di `core/analysis/classifier.ts`): Terbaik (langkah engine), Sangat baik < 2%, Bagus < 5%, Kurang akurat < 10%, Kesalahan < 20%, Blunder ≥ 20%. Langkah yang masih ada di daftar opening ditandai Teori. **Brilian** (!!): langkah terbaik yang mengorbankan material minimal 3 poin tanpa membuat posisi kalah (deteksi pengorbanan di `core/analysis/tactics.ts`). **Hebat** (!): langkah terbaik yang unik, alternatif terbaik kedua (MultiPV 2) peluang menangnya turun minimal 20 poin. Keduanya tidak diberikan saat posisi sudah menang telak, saat langkahnya skakmat, atau saat hanya ada satu langkah legal.

## Belum ada / rencana
- Jam catur untuk mode lawan bot.
- Latihan taktik dengan puzzle dari basis data besar (saat ini 12 puzzle buatan sendiri).
- Daftar opening baru ±80 jalur; bisa diganti dataset ECO lengkap.

## Kredit
Bidak: set SVG orisinal buatan proyek ini (CC0, lihat `public/pieces/original/LICENSE.txt`). Suara disintesis lewat WebAudio.

## Pengujian
- `npm test`: tes logika (analisa, jam, pelajaran, puzzle, penyimpanan) dan tes layar dengan DOM tiruan (papan, puzzle, latihan opening, PvP berjam, cadangan, layar utama).
- `npm run test:e2e`: membangun aplikasi, menjalankannya dengan `vite preview`, lalu menguji di browser sungguhan: klik dan seret mouse, jam, Stockfish asli (bot, label Brilian), unduh/pulihkan cadangan, dan **mode offline** (service worker + engine WASM dari cache). Lokal memakai Microsoft Edge yang terpasang; di mesin lain jalankan `npx playwright install chromium` lalu `E2E_CHANNEL=chromium npm run test:e2e`.

## Keamanan
- Tanpa backend, akun, atau panggilan jaringan; semua data di perangkat. Build produksi memasang Content-Security-Policy (hanya origin sendiri, tanpa inline script maupun `eval`).
- Berkas cadangan dan PGN yang diimpor divalidasi dan dibatasi ukurannya; teks selalu ditampilkan sebagai teks, bukan HTML.
- Batasan: GitHub Pages tidak bisa mengirim header HTTP, jadi `frame-ancestors` (anti-clickjacking) tidak bisa diterapkan. Aplikasi tidak punya aksi sensitif sehingga dampaknya kecil.
- Server dev hanya localhost; `--host` hanya untuk jaringan tepercaya. `npm audit` pada dependensi produksi bersih; temuan tersisa ada di perkakas pengembangan (vite 5 / vitest 2) dan tidak ikut terbit.

Menguji situs yang sudah terbit (tanpa server lokal): `E2E_BASE_URL=https://microzo.github.io/chess-learn/ npm run test:e2e`.
