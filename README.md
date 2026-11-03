# Chess-Learn

Game catur offline ala chess.com: belajar lawan bot dengan analisa langkah live, PvP di satu perangkat, dan replay dengan analisa penuh. Berjalan di browser laptop maupun HP.

## Fitur
| Mode | Deskripsi |
|---|---|
| **Belajar Strategi** | 33 pelajaran (dasar, 9 opening teruji, taktik, strategi middlegame, endgame, pola mat) dengan demo interaktif langkah demi langkah di papan, ditambah glosarium 45 istilah catur. Progres belajar tersimpan di perangkat. |
| **Belajar vs Bot** | 8 level bot. Setiap langkah langsung diberi label (Teori, Terbaik, Sangat baik, Bagus, Kurang akurat, Kesalahan, Blunder), selisih evaluasi, dan langkah terbaik. Ada tombol Saran dan Ulangi. |
| **Main berdua (PvP)** | Dua pemain di satu layar, papan bisa berputar otomatis, batal langkah, remis, menyerah. |
| **Replay & Analisa** | Navigasi langkah (tombol/panah keyboard), grafik evaluasi, akurasi per pemain, ringkasan kategori, nama opening, papan alternatif terbaik. Bisa impor PGN. |

Partai tersimpan otomatis di perangkat (localStorage).

## Stack
TypeScript, Vite, chess.js (aturan), Stockfish 17.1 WASM lite single-thread di Web Worker (bot + analisa). Tanpa backend, semua jalan di perangkat.

## Menjalankan
```
npm install        # sekaligus menyalin engine ke public/engine
npm run dev        # http://localhost:5173 (juga bisa dari HP, lihat bawah)
npm test
npm run build      # hasil di dist/
npm run preview    # uji build produksi di http://localhost:4173
```

### Main di HP (satu jaringan Wi-Fi dengan laptop)
1. `npm run dev` (atau `npm run build && npm run preview`).
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
├─ modes/       learning/  lessons/  pvp/  replay/
├─ ui/          board/  panels/  screens/  styles/
├─ data/        daftar opening (ECO), materi pelajaran dan glosarium
└─ types/
public/         engine/ (Stockfish), icons/, manifest, sw.js
scripts/        copy-engine, make-icons
tests/          vitest
```

## Cara penilaian langkah
Evaluasi engine diubah ke peluang menang; kategori ditentukan dari penurunan peluang menang bagi pemain yang melangkah (ambang di `core/analysis/classifier.ts`): Terbaik (langkah engine), Sangat baik < 2%, Bagus < 5%, Kurang akurat < 10%, Kesalahan < 20%, Blunder ≥ 20%. Langkah yang masih ada di daftar opening ditandai Teori.

## Belum ada / rencana
- Kategori Brilian dan Hebat (butuh deteksi pengorbanan material dan "satu-satunya langkah").
- Jam catur untuk PvP.
- Daftar opening baru ±80 jalur; bisa diganti dataset ECO lengkap.

## Kredit
Bidak: set SVG orisinal buatan proyek ini (CC0, lihat `public/pieces/original/LICENSE.txt`). Suara disintesis lewat WebAudio.
