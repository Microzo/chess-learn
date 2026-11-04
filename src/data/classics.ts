/**
 * Partai kelas dunia untuk dipelajari langkah demi langkah dan notasinya.
 * Daftar langkah dicocokkan dengan Wikipedia (Immortal Game, Opera Game, Game of the Century,
 * Kasparov–Topalov 1999, Deep Blue–Kasparov game 6; Fischer–Spassky game 6 dicocokkan pada
 * pembukaan dan akhir partai) dan divalidasi chess.js di tests/lessons/classics.test.ts.
 *
 * Kunci catatan memakai notasi seperti di partai: '17.Rd8#' (langkah Putih) atau '16...Nxb8' (Hitam).
 * Tes memastikan setiap kunci cocok dengan langkah yang benar-benar dimainkan di posisi itu.
 */
export interface Classic {
  id: string;
  title: string;
  white: string;
  black: string;
  event: string;
  year: number;
  result: '1-0' | '0-1';
  opening: string;
  level: 'Pemula' | 'Menengah' | 'Lanjut';
  summary: string;
  learn: string[];
  pgn: string;
  notes: [key: string, text: string][];
}

/** "17.Rd8#" → { ply: 33, san: "Rd8#" }; "16...Nxb8" → { ply: 32, san: "Nxb8" } */
export function parseNoteKey(key: string): { ply: number; san: string } | null {
  const m = /^(\d+)(\.{1,3})(.+)$/.exec(key);
  if (!m || (m[2] !== '.' && m[2] !== '...')) return null;
  const n = Number(m[1]);
  return { ply: (n - 1) * 2 + (m[2] === '.' ? 1 : 2), san: m[3]! };
}

export const CLASSICS: Classic[] = [
  {
    id: 'opera',
    title: 'Opera Game',
    white: 'Paul Morphy',
    black: 'Adipati Brunswick & Pangeran Isouard',
    event: 'Paris, 1858 (dimainkan di kotak opera)',
    year: 1858,
    result: '1-0',
    opening: 'Pertahanan Philidor',
    level: 'Pemula',
    summary: 'Contoh paling jernih tentang perkembangan cepat, penguasaan pusat, dan serangan ke raja yang belum rokade.',
    learn: [
      'Morphy mengembangkan bidak ringan dengan cepat, sementara Hitam menukar bidak dan memakai langkah untuk bidak b dan c.',
      'Pin (ikatan): gajah g5 mengikat kuda f6 ke ratu, gajah b5 mengikat kuda d7 ke raja.',
      'Korbankan materi untuk membuka garis ke raja yang belum aman.',
      'Skakmat akhir hanya dengan satu benteng dan satu gajah.',
    ],
    pgn: '[Event "Opera Game"]\n[Site "Paris"]\n[Date "1858.??.??"]\n[White "Paul Morphy"]\n[Black "Adipati Brunswick & Pangeran Isouard"]\n[Result "1-0"]\n\n1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0',
    notes: [
      ['1.e4', 'Langkah pembuka paling umum: merebut pusat dan membuka jalan bagi ratu dan gajah.'],
      ['3...Bg4', 'Gajah Hitam mengikat kuda f3 ke ratu d1. Pin seperti ini akan menjadi tema sepanjang partai.'],
      ['4.dxe5', 'Putih membuka pusat. Hitam akhirnya menukar gajahnya dengan kuda f3, dan Morphy mendapat perkembangan ratu secara gratis.'],
      ['6.Bc4', 'Gajah menyorot f7, titik terlemah Hitam (hanya dijaga raja).'],
      ['7.Qb3', 'Serangan ganda ke b7 dan f7. Hitam menjawab 7...Qe7 agar f7 tetap aman.'],
      ['9.Bg5', 'Gajah mengikat kuda f6 ke ratu e7. Kuda itu tidak bebas bergerak.'],
      ['10.Nxb5', 'Pengorbanan kuda: membuka garis c dan b menuju raja Hitam yang belum rokade.'],
      ['11.Bxb5+', 'Skak! Hitam harus menutup dengan kuda d7, yang kini terikat oleh gajah b5.'],
      ['12.O-O-O', 'Rokade panjang: pengembangan sekaligus mengaktifkan benteng ke kolom d dengan ancaman Rxd7.'],
      ['13.Rxd7', 'Pengorbanan kualitas (benteng demi kuda) untuk menghancurkan penjaga raja.'],
      ['16.Qb8+', 'Pengorbanan ratu! Hitam wajib menjawab dengan kuda, sehingga kolom d terbuka total.'],
      ['17.Rd8#', 'Skakmat. Gajah g5 menutup petak e7, sehingga raja Hitam tidak punya jalan lari.'],
    ],
  },
  {
    id: 'immortal',
    title: 'Immortal Game (Partai Abadi)',
    white: 'Adolf Anderssen',
    black: 'Lionel Kieseritzky',
    event: 'London, 1851 (partai santai di sela turnamen)',
    year: 1851,
    result: '1-0',
    opening: 'Gambit Raja, Gambit Gajah',
    level: 'Menengah',
    summary: 'Anderssen mengorbankan gajah, kedua benteng, dan ratunya, lalu memberi skakmat dengan tiga bidak ringan.',
    learn: [
      'Gambit: menyerahkan bidak untuk inisiatif dan perkembangan.',
      'Waktu (tempo) bisa lebih berharga daripada materi, terutama saat raja lawan belum aman.',
      'Pengorbanan beruntun bisa sah bila setiap langkah memaksa dan berakhir pada skakmat.',
      'Gaya romantis abad ke-19: serangan langsung ke raja.',
    ],
    pgn: '[Event "London 1851"]\n[Site "London"]\n[Date "1851.??.??"]\n[White "Adolf Anderssen"]\n[Black "Lionel Kieseritzky"]\n[Result "1-0"]\n\n1. e4 e5 2. f4 exf4 3. Bc4 Qh4+ 4. Kf1 b5 5. Bxb5 Nf6 6. Nf3 Qh6 7. d3 Nh5 8. Nh4 Qg5 9. Nf5 c6 10. g4 Nf6 11. Rg1 cxb5 12. h4 Qg6 13. h5 Qg5 14. Qf3 Ng8 15. Bxf4 Qf6 16. Nc3 Bc5 17. Nd5 Qxb2 18. Bd6 Bxg1 19. e5 Qxa1+ 20. Ke2 Na6 21. Nxg7+ Kd8 22. Qf6+ Nxf6 23. Be7# 1-0',
    notes: [
      ['2.f4', 'Gambit Raja: Putih menawarkan bidak f demi membuka kolom f dan menguasai pusat.'],
      ['3...Qh4+', 'Ratu Hitam memberi skak dini. Putih tidak bisa rokade lagi setelah rajanya berjalan.'],
      ['4.Kf1', 'Raja berjalan sendiri dan kehilangan hak rokade. Anderssen rela, asalkan perkembangan bidaknya lancar.'],
      ['4...b5', 'Gambit balasan Hitam: menawarkan bidak b untuk mengalihkan gajah putih.'],
      ['5.Bxb5', 'Anderssen menerima gambit balasan.'],
      ['11.Rg1', 'Benteng membuka garis g untuk mendorong bidak ke depan, tanpa peduli rajanya yang terbuka.'],
      ['17.Nd5', 'Kuda masuk ke d5 dengan ancaman dan tidak peduli pada ancaman Hitam.'],
      ['18.Bd6', 'Langkah tenang yang mengabaikan benteng g1 dan a1 yang bisa dimakan. Inilah inti dari pengorbanan beruntun.'],
      ['19.e5', 'Bidak e5 menjaga petak f6 dan d6. Dua petak itu kelak menjadi kunci skakmat.'],
      ['21.Nxg7+', 'Kuda memberi skak dan memakan bidak, memaksa raja ke d8.'],
      ['22.Qf6+', 'Pengorbanan ratu! Setelah ini skakmat tidak terelakkan.'],
      ['23.Be7#', 'Skakmat dengan gajah e7, dibantu kuda d5 dan kuda g7. Raja Hitam terkunci oleh bidaknya sendiri.'],
    ],
  },
  {
    id: 'game-of-the-century',
    title: 'Game of the Century',
    white: 'Donald Byrne',
    black: 'Bobby Fischer',
    event: 'Rosenwald Memorial, New York, 17 Oktober 1956',
    year: 1956,
    result: '0-1',
    opening: 'Pertahanan Grünfeld',
    level: 'Lanjut',
    summary: 'Fischer, usia 13 tahun, mengorbankan ratunya di langkah ke-17 dan memenangkan partai lewat kerja sama bidak ringan.',
    learn: [
      'Pengorbanan ratu demi kompensasi nyata: dua gajah, kuda, dan benteng bekerja bersama.',
      'Skak berulang dengan kuda dipakai untuk menambah waktu dan menarik raja ke posisi buruk.',
      'Aktivitas bidak lebih penting daripada jumlah poin materi.',
      'Pertahanan Grünfeld: Hitam membiarkan Putih membangun pusat, lalu menyerangnya.',
    ],
    pgn: '[Event "Rosenwald Memorial"]\n[Site "New York"]\n[Date "1956.10.17"]\n[White "Donald Byrne"]\n[Black "Bobby Fischer"]\n[Result "0-1"]\n\n1. Nf3 Nf6 2. c4 g6 3. Nc3 Bg7 4. d4 O-O 5. Bf4 d5 6. Qb3 dxc4 7. Qxc4 c6 8. e4 Nbd7 9. Rd1 Nb6 10. Qc5 Bg4 11. Bg5 Na4 12. Qa3 Nxc3 13. bxc3 Nxe4 14. Bxe7 Qb6 15. Bc4 Nxc3 16. Bc5 Rfe8+ 17. Kf1 Be6 18. Bxb6 Bxc4+ 19. Kg1 Ne2+ 20. Kf1 Nxd4+ 21. Kg1 Ne2+ 22. Kf1 Nc3+ 23. Kg1 axb6 24. Qb4 Ra4 25. Qxb6 Nxd1 26. h3 Rxa2 27. Kh2 Nxf2 28. Re1 Rxe1 29. Qd8+ Bf8 30. Nxe1 Bd5 31. Nf3 Ne4 32. Qb8 b5 33. h4 h5 34. Ne5 Kg7 35. Kg1 Bc5+ 36. Kf1 Ng3+ 37. Ke1 Bb4+ 38. Kd1 Bb3+ 39. Kc1 Ne2+ 40. Kb1 Nc3+ 41. Kc1 Rc2# 0-1',
    notes: [
      ['3...Bg7', 'Setup Grünfeld: gajah Hitam menyorot pusat dari jauh sambil raja bersiap rokade.'],
      ['11...Na4', 'Kuda Hitam melompat ke a4 dan menyerang ratu putih di c5.'],
      ['13...Nxe4', 'Fischer mulai membuka posisi Putih dengan mengambil bidak e4.'],
      ['14.Bxe7', 'Byrne memakan bidak dan menyerang ratu Hitam. Tampak menguntungkan, tetapi inilah yang diperhitungkan Fischer.'],
      ['17...Be6', 'Pengorbanan ratu yang terkenal. Hitam menawarkan ratu b6 untuk membuka serangan bersama gajah dan kuda.'],
      ['18...Bxc4+', 'Gajah memakan gajah putih dengan skak, dan Hitam mulai mendapat kompensasi.'],
      ['20...Nxd4+', 'Skak berulang dengan kuda (e2, d4, c3) mendorong raja bolak-balik dan memakan bidak.'],
      ['23...axb6', 'Bidak a memakan gajah b6. Ratu Hitam sudah diserahkan, tetapi bidak-bidak ringan Hitam sangat aktif dan raja putih terkurung.'],
      ['25...Nxd1', 'Kuda memakan benteng d1 dan serangan Hitam terus berjalan.'],
      ['41...Rc2#', 'Skakmat. Gajah b3 menjaga benteng, kuda c3 menutup b1 dan d1, dan ratu putih jauh dari raja.'],
    ],
  },
  {
    id: 'kasparov-topalov',
    title: 'Kasparov vs Topalov (Immortal modern)',
    white: 'Garry Kasparov',
    black: 'Veselin Topalov',
    event: 'Wijk aan Zee (Hoogovens), 1999',
    year: 1999,
    result: '1-0',
    opening: 'Pertahanan Pirc',
    level: 'Lanjut',
    summary: 'Dua pengorbanan benteng beruntun memaksa raja Hitam berjalan dari b8 sampai e1.',
    learn: [
      'Kombinasi jarak jauh: Kasparov melihat banyak langkah ke depan.',
      'Pengorbanan benteng yang membuka raja lawan ke semua penyerang.',
      'Langkah tenang (36.Bf1) bisa lebih kuat daripada skak lanjutan.',
      'Struktur Pirc: Hitam membiarkan Putih membangun pusat lalu menekan dari sayap.',
    ],
    pgn: '[Event "Hoogovens"]\n[Site "Wijk aan Zee"]\n[Date "1999.??.??"]\n[White "Garry Kasparov"]\n[Black "Veselin Topalov"]\n[Result "1-0"]\n\n1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Be3 Bg7 5. Qd2 c6 6. f3 b5 7. Nge2 Nbd7 8. Bh6 Bxh6 9. Qxh6 Bb7 10. a3 e5 11. O-O-O Qe7 12. Kb1 a6 13. Nc1 O-O-O 14. Nb3 exd4 15. Rxd4 c5 16. Rd1 Nb6 17. g3 Kb8 18. Na5 Ba8 19. Bh3 d5 20. Qf4+ Ka7 21. Rhe1 d4 22. Nd5 Nbxd5 23. exd5 Qd6 24. Rxd4 cxd4 25. Re7+ Kb6 26. Qxd4+ Kxa5 27. b4+ Ka4 28. Qc3 Qxd5 29. Ra7 Bb7 30. Rxb7 Qc4 31. Qxf6 Kxa3 32. Qxa6+ Kxb4 33. c3+ Kxc3 34. Qa1+ Kd2 35. Qb2+ Kd1 36. Bf1 Rd2 37. Rd7 Rxd7 38. Bxc4 bxc4 39. Qxh8 Rd3 40. Qa8 c3 41. Qa4+ Ke1 42. f4 f5 43. Kc1 Rd2 44. Qa7 1-0',
    notes: [
      ['4.Be3', 'Gajah ke e3 dan ratu ke d2: pola serangan klasik melawan Pirc, dengan rencana Bh6 untuk menukar gajah bidak raja Hitam.'],
      ['8.Bh6', 'Putih menawarkan pertukaran gajah yang membahayakan keamanan raja Hitam.'],
      ['11.O-O-O', 'Putih rokade panjang dan Hitam menyusul di langkah 13. Kedua raja berada di sayap ratu.'],
      ['18.Na5', 'Kuda masuk ke a5 dan menekan raja Hitam di sayap ratu.'],
      ['22.Nd5', 'Kuda dikorbankan untuk mengalihkan penjaga dan membuka posisi.'],
      ['24.Rxd4', 'Pengorbanan benteng pertama: Putih membuka garis d dan memaksa bidak Hitam memakan.'],
      ['25.Re7+', 'Pengorbanan benteng kedua. Raja Hitam terpaksa maju ke b6 dan mulai diburu melintasi papan.'],
      ['26.Qxd4+', 'Ratu memberi skak dan memaksa Kxa5.'],
      ['27.b4+', 'Bidak memberi skak dan menyeret raja Hitam makin jauh dari bidaknya.'],
      ['36.Bf1', 'Langkah tenang yang menyiapkan Rd7. Lawan kehabisan jawaban yang baik.'],
      ['37.Rd7', 'Benteng d7 dikorbankan untuk memutus pertahanan terakhir.'],
      ['41...Ke1', 'Raja Hitam berhasil sampai e1, di sisi Putih. Pemandangan yang sangat tidak biasa.'],
      ['44.Qa7', 'Topalov menyerah; ancaman skakmat tidak bisa dihalau.'],
    ],
  },
  {
    id: 'deep-blue',
    title: 'Deep Blue vs Kasparov (partai 6, 1997)',
    white: 'Deep Blue',
    black: 'Garry Kasparov',
    event: 'New York, 11 Mei 1997 (pertandingan ulang, partai 6)',
    year: 1997,
    result: '1-0',
    opening: 'Pertahanan Caro-Kann',
    level: 'Menengah',
    summary: 'Partai penentu: komputer mengalahkan juara dunia dalam pertandingan resmi. Kasparov menyerah di langkah 19.',
    learn: [
      'Pengorbanan kuda di e6 membuka raja Hitam dan menghancurkan koordinasi.',
      'Mengapa teori pembukaan penting: satu langkah kurang tepat bisa langsung dihukum.',
      'Komputer menghitung taktik dengan akurat; pemain manusia perlu waspada.',
      'Pertahanan Caro-Kann: Hitam membangun struktur kokoh dengan c6 dan d5.',
    ],
    pgn: '[Event "IBM Man-Machine"]\n[Site "New York"]\n[Date "1997.05.11"]\n[White "Deep Blue"]\n[Black "Garry Kasparov"]\n[Result "1-0"]\n\n1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Nd7 5. Ng5 Ngf6 6. Bd3 e6 7. N1f3 h6 8. Nxe6 Qe7 9. O-O fxe6 10. Bg6+ Kd8 11. Bf4 b5 12. a4 Bb7 13. Re1 Nd5 14. Bg3 Kc8 15. axb5 cxb5 16. Qd3 Bc6 17. Bf5 exf5 18. Rxe7 Bxe7 19. c4 1-0',
    notes: [
      ['1...c6', 'Caro-Kann: pertahanan kokoh yang menyiapkan d5 tanpa menyisakan kelemahan.'],
      ['5.Ng5', 'Kuda ke g5 menyerang f7 dan memberi tekanan sejak pembukaan.'],
      ['7...h6', 'Dianggap kurang tepat. Langkah ini memungkinkan pengorbanan kuda di e6.'],
      ['8.Nxe6', 'Pengorbanan kuda. Ratu Hitam harus memakan, dan raja Hitam kehilangan perlindungan.'],
      ['10.Bg6+', 'Gajah memberi skak dan menyingkirkan hak rokade Hitam.'],
      ['17.Bf5', 'Gajah dikorbankan lagi untuk membuka kolom e.'],
      ['18.Rxe7', 'Benteng memakan ratu Hitam. Hitam hanya mendapat benteng sebagai ganti dan posisinya tidak bisa dipertahankan.'],
      ['19.c4', 'Kasparov menyerah. Deep Blue memenangkan pertandingan dengan skor 3,5 : 2,5.'],
    ],
  },
  {
    id: 'fischer-spassky-6',
    title: 'Fischer vs Spassky (partai 6, 1972)',
    white: 'Bobby Fischer',
    black: 'Boris Spassky',
    event: 'Kejuaraan Dunia, Reykjavik, 1972 (partai 6)',
    year: 1972,
    result: '1-0',
    opening: 'Gambit Ratu Ditolak, Variasi Tartakower',
    level: 'Menengah',
    summary: 'Fischer membuka dengan 1.c4 (bukan 1.e4 kesukaannya) dan menang dengan permainan strategi yang sangat bersih. Spassky ikut bertepuk tangan.',
    learn: [
      'Fischer sering memulai dengan 1.e4; di sini ia memilih 1.c4 untuk mengejutkan lawan.',
      'Strategi: pusat yang kuat dan bidak bebas membuat penyerangan di sayap raja berjalan mulus.',
      'Penukaran bidak ringan meninggalkan bidak Hitam yang lemah (d5) sebagai sasaran.',
      'Hitam terlalu pasif; ruang dan inisiatif akhirnya dimenangkan Putih.',
    ],
    pgn: '[Event "World Championship"]\n[Site "Reykjavik"]\n[Date "1972.07.??"]\n[White "Bobby Fischer"]\n[Black "Boris Spassky"]\n[Result "1-0"]\n\n1. c4 e6 2. Nf3 d5 3. d4 Nf6 4. Nc3 Be7 5. Bg5 O-O 6. e3 h6 7. Bh4 b6 8. cxd5 Nxd5 9. Bxe7 Qxe7 10. Nxd5 exd5 11. Rc1 Be6 12. Qa4 c5 13. Qa3 Rc8 14. Bb5 a6 15. dxc5 bxc5 16. O-O Ra7 17. Be2 Nd7 18. Nd4 Qf8 19. Nxe6 fxe6 20. e4 d4 21. f4 Qe7 22. e5 Rb8 23. Bc4 Kh8 24. Qh3 Nf8 25. b3 a5 26. f5 exf5 27. Rxf5 Nh7 28. Rcf1 Qd8 29. Qg3 Re7 30. h4 Rbb7 31. e6 Rbc7 32. Qe5 Qe8 33. a4 Qd8 34. R1f2 Qe8 35. R2f3 Qd8 36. Bd3 Qe8 37. Qe4 Nf6 38. Rxf6 gxf6 39. Rxf6 Kg8 40. Bc4 Kh8 41. Qf4 1-0',
    notes: [
      ['1.c4', 'Pembukaan Inggris. Fischer meninggalkan 1.e4 untuk mengejutkan Spassky.'],
      ['3.d4', 'Partai berpindah ke Gambit Ratu Ditolak: pusat bidak Putih c4 dan d4.'],
      ['5.Bg5', 'Gajah mengikat kuda f6 ke ratu, pola klasik di Gambit Ratu.'],
      ['9.Bxe7', 'Putih menukar gajah bidak hitam yang aktif.'],
      ['10.Nxd5', 'Penukaran kuda menyisakan bidak Hitam di d5, yang kelak menjadi sasaran.'],
      ['19.Nxe6', 'Kuda memakan gajah dan merusak struktur bidak Hitam.'],
      ['20.e4', 'Putih merebut ruang di pusat dengan bidak e.'],
      ['22.e5', 'Bidak e5 menekan Hitam dan memberi petak kuat bagi gajah.'],
      ['31.e6', 'Bidak e6 menusuk ke dalam posisi Hitam dan membuka garis untuk ratu dan benteng.'],
      ['41.Qf4', 'Spassky menyerah. Ia bertepuk tangan untuk lawannya.'],
    ],
  },
];
