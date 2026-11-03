# Roadmap

1. **Fondasi**: `npm install`, halaman papan kosong, `core/game` (chess.js: langkah legal, status, PGN).
2. **Papan UI**: `ui/board` drag/klik, highlight langkah legal, promosi, suara (sudah: drag, klik, animasi geser, suara sintetis).
3. **PvP offline**: `modes/pvp` + jam catur, undo, resign/draw, simpan ke storage.
4. **Engine**: `core/engine` memuat Stockfish WASM di worker; API `analyse(fen, depth)` mengembalikan `EngineLine`.
5. **Bot**: level 1..10 lewat `Skill Level` / `UCI_Elo` + depth terbatas.
6. **Analisa**: `analysis/analyzer` (eval sebelum/sesudah, `classifier`), `opening` (cocokkan urutan langkah ke `openings/eco.json`), komentar teks.
7. **Learning mode**: setelah setiap langkah pemain, tampilkan panel analisa (label, selisih, langkah terbaik, opening); tombol "ulangi langkah".
8. **Replay**: timeline evaluasi, daftar langkah berwarna, akurasi, analisa batch untuk partai PvP.
9. **Polish**: tema, pengaturan, PWA/Tauri agar bisa di-install offline.

## Catatan desain
- Klasifikasi berbasis penurunan peluang menang (lihat `core/analysis/classifier.ts`), ambang bisa di-tuning.
- `brilliant` dan `great` ditunda; butuh deteksi pengorbanan material dan "only move".
- Data opening: gunakan dataset ECO lisensi terbuka (mis. lichess-org/chess-openings), dikonversi oleh `scripts/build-openings`.
