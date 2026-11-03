# Roadmap

1. **Fondasi**: `npm install`, halaman papan kosong, `core/game` (chess.js: langkah legal, status, PGN).
2. **Papan UI**: `ui/board` drag/klik, highlight langkah legal, promosi, suara (sudah: drag, klik, animasi geser, suara sintetis).
3. **PvP offline**: `modes/pvp` + jam catur, undo, resign/draw, simpan ke storage.
4. **Engine**: `core/engine` memuat Stockfish WASM di worker; API `analyse(fen, depth)` mengembalikan `EngineLine`.
5. **Bot**: level 1..10 lewat `Skill Level` / `UCI_Elo` + depth terbatas.
6. **Analisa**: `analysis/analyzer` (eval sebelum/sesudah, `classifier`), `opening` (cocokkan urutan langkah ke `openings/eco.json`), komentar teks.
7. **Learning mode**: setelah setiap langkah pemain, tampilkan panel analisa (label, selisih, langkah terbaik, opening); tombol "ulangi langkah".
8. **Replay**: timeline evaluasi, daftar langkah berwarna, akurasi, analisa batch untuk partai PvP.
9. **Belajar Strategi**: `modes/lessons` + `data/lessons.ts` (pelajaran, demo papan, glosarium); isi divalidasi `tests/lessons`. Sudah termasuk Lucena/Philidor, 14 opening, dan 12 puzzle taktik. Ide lanjutan: puzzle dari basis data besar, latihan oposisi, lebih banyak opening dan endgame.
10. **Jam PvP** (`core/game/clock.ts`), **Latihan taktik** (`data/puzzles.ts`), label **Brilian/Hebat**: selesai.
11. **Polish**: tema, pengaturan, PWA/Tauri agar bisa di-install offline.

## Catatan desain
- Klasifikasi berbasis penurunan peluang menang (lihat `core/analysis/classifier.ts`), ambang bisa di-tuning.
- `brilliant` (pengorbanan material minimal 3 poin yang tetap terbaik) dan `great` (alternatif kedua turun >= 20% peluang menang lewat MultiPV 2) sudah ada; ambang di `classifier.ts` (`UPGRADE`).
- Data opening: gunakan dataset ECO lisensi terbuka (mis. lichess-org/chess-openings), dikonversi oleh `scripts/build-openings`.
