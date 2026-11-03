/**
 * Materi belajar catur (statis, offline). Setiap demo diputar di papan langkah demi langkah.
 * Semua langkah divalidasi oleh tests/lessons/lessons.test.ts (legal, dan skakmat bila `expectMate`).
 */

export type Category = 'dasar' | 'opening' | 'taktik' | 'strategi' | 'endgame' | 'mat';

export interface Step {
  /** langkah SAN; kosong = hanya anotasi pada posisi yang sama */
  san?: string;
  note: string;
  /** kotak yang disorot (biru) */
  hint?: string[];
}

export interface Demo {
  /** FEN awal; kosong = posisi awal standar */
  fen?: string;
  /** teks untuk posisi awal sebelum langkah pertama */
  intro: string;
  hint?: string[];
  flip?: boolean;
  steps: Step[];
  /** posisi akhir harus skakmat */
  expectMate?: boolean;
  /** posisi akhir harus pat (stalemate) */
  expectStalemate?: boolean;
}

export interface Lesson {
  id: string;
  category: Category;
  title: string;
  summary: string;
  body: string[];
  points: string[];
  demo?: Demo;
}

export const CATEGORY_LABEL: Record<Category, { icon: string; title: string; sub: string }> = {
  dasar: { icon: '🧱', title: 'Dasar', sub: 'Prinsip, nilai bidak, rokade, cara menang & seri' },
  opening: { icon: '📖', title: 'Opening', sub: 'Pembukaan yang sudah teruji berpuluh tahun' },
  taktik: { icon: '⚔️', title: 'Taktik', sub: 'Pola yang memenangkan material' },
  strategi: { icon: '🧭', title: 'Strategi middlegame', sub: 'Struktur bidak, posisi bidak, rencana' },
  endgame: { icon: '🏁', title: 'Endgame', sub: 'Mengubah keunggulan menjadi kemenangan' },
  mat: { icon: '👑', title: 'Pola skakmat', sub: 'Cara raja lawan terjebak' },
};

export const CATEGORY_ORDER: Category[] = ['dasar', 'opening', 'taktik', 'strategi', 'endgame', 'mat'];

export const LESSONS: Lesson[] = [
  /* ---------------------------------------------------------------- DASAR */
  {
    id: 'prinsip-opening',
    category: 'dasar',
    title: 'Tiga prinsip emas opening',
    summary: 'Kuasai pusat, kembangkan bidak, amankan raja.',
    body: [
      'Hampir semua opening yang bagus berpegang pada tiga gagasan sederhana: kuasai pusat papan (e4, d4, e5, d5), kembangkan bidak ringan (kuda dan gajah) secepat mungkin, lalu rokade supaya raja aman dan benteng terhubung.',
      'Bidak di pusat memberi ruang dan membuat kuda serta gajah lebih aktif. Bidak ringan yang masih di barisan awal tidak berguna; setiap langkah opening sebaiknya membawa bidak baru ke kotak yang aktif.',
      'Yang perlu dihindari: menggerakkan bidak yang sama dua kali tanpa alasan, mengeluarkan ratu terlalu dini (mudah diusir dengan kehilangan tempo), dan terlalu banyak langkah bidak sayap sebelum bidak ringan keluar.',
    ],
    points: [
      'Pusat dulu: e4/d4 (atau e5/d5 untuk Hitam).',
      'Kuda sebelum gajah, dan keduanya sebelum langkah bidak sayap.',
      'Rokade biasanya dalam 10 langkah pertama.',
      'Jangan memakan bidak pinggiran dengan ratu bila itu membuat pengembangan tertinggal.',
    ],
    demo: {
      intro: 'Kita lihat Italian Game (Giuoco Pianissimo): contoh bersih dari ketiga prinsip tadi.',
      steps: [
        { san: 'e4', note: 'Putih menguasai pusat dan membuka jalur untuk ratu dan gajah.', hint: ['e4', 'd5', 'f5'] },
        { san: 'e5', note: 'Hitam membalas dengan cara yang sama: pusat dan jalur untuk gajah serta ratu.', hint: ['e5'] },
        { san: 'Nf3', note: 'Kuda keluar sambil menyerang bidak e5. Mengembangkan bidak dan menciptakan ancaman sekaligus.', hint: ['f3', 'e5'] },
        { san: 'Nc6', note: 'Hitam mempertahankan e5 sambil mengembangkan kuda.', hint: ['c6'] },
        { san: 'Bc4', note: 'Gajah menuju diagonal aktif dan menekan titik lemah f7 (hanya dijaga raja).', hint: ['c4', 'f7'] },
        { san: 'Bc5', note: 'Hitam menyeimbangkan: gajahnya juga ke diagonal aktif dan menekan f2.', hint: ['c5', 'f2'] },
        { san: 'c3', note: 'Putih menyiapkan d4 untuk merebut pusat penuh.', hint: ['c3', 'd4'] },
        { san: 'Nf6', note: 'Hitam menyerang e4 dengan kuda kedua. Semua bidak ringan sudah keluar.', hint: ['f6', 'e4'] },
        { san: 'd3', note: 'Putih menjaga e4 dengan tenang dan membuka jalur untuk gajah c1.', hint: ['d3', 'e4'] },
        { san: 'd6', note: 'Hitam menjaga e5 dengan bidak, membuka gajah c8.', hint: ['d6', 'e5'] },
        { san: 'O-O', note: 'Putih rokade: raja aman, benteng h1 pindah ke f1 dan ikut permainan.', hint: ['g1', 'f1'] },
        { san: 'O-O', note: 'Hitam juga rokade. Kedua pihak mengembangkan bidak, menguasai pusat, dan mengamankan raja.', hint: ['g8', 'f8'] },
      ],
    },
  },
  {
    id: 'nilai-bidak',
    category: 'dasar',
    title: 'Nilai bidak dan material',
    summary: 'Bidak 1, kuda 3, gajah 3, benteng 5, ratu 9.',
    body: [
      'Nilai standar: bidak = 1, kuda = 3, gajah = 3, benteng = 5, ratu = 9. Angka ini perkiraan kasar untuk menimbang pertukaran, bukan hukum mutlak.',
      'Gajah dan kuda kira-kira setara, tetapi gajah sedikit lebih kuat di posisi terbuka dan kuda di posisi tertutup. Dua gajah (pasangan gajah) biasanya bernilai sedikit lebih dari 6 karena saling melengkapi di dua warna kotak.',
      'Menukar benteng (5) dengan kuda atau gajah (3) disebut memenangkan atau kehilangan "kualitas" (exchange): selisihnya sekitar dua poin. Namun posisi bisa mengalahkan material: serangan berbahaya, bidak lewat yang kuat, atau raja yang terjebak sering lebih penting daripada selisih satu bidak.',
    ],
    points: [
      'Hitung dulu sebelum menukar: apa yang berubah setelah semua penukaran selesai?',
      'Saat unggul material, sederhanakan lewat pertukaran.',
      'Saat tertinggal, hindari pertukaran dan cari komplikasi.',
      'Raja tidak punya nilai tukar, tetapi di endgame ia sama aktifnya dengan bidak ringan.',
    ],
  },
  {
    id: 'rokade',
    category: 'dasar',
    title: 'Rokade dan keamanan raja',
    summary: 'Satu langkah yang mengamankan raja dan mengaktifkan benteng.',
    body: [
      'Rokade adalah satu-satunya langkah di mana dua bidak bergerak sekaligus. Raja melompat dua kotak ke arah benteng, lalu benteng melompat ke sisi seberang raja. Rokade pendek (O-O) lebih umum karena raja berlindung di balik tiga bidak f, g, h.',
      'Syarat rokade: raja dan benteng yang dipakai belum pernah bergerak, tidak ada bidak di antara keduanya, raja tidak sedang skak, dan raja tidak melewati atau mendarat di kotak yang diserang lawan.',
      'Raja yang terlambat rokade sering menjadi sasaran serangan di tengah saat kolom e atau d terbuka. Prinsipnya: sebelum membuka pusat dengan pertukaran bidak, pastikan rajamu sudah aman.',
    ],
    points: [
      'O-O: rokade pendek (sisi raja). O-O-O: rokade panjang (sisi ratu).',
      'Setelah rokade, jangan terburu-buru mendorong bidak di depan raja (f, g, h).',
      'Rokade ke sisi berlawanan lawan memicu perlombaan serangan bidak.',
    ],
    demo: {
      fen: 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1',
      intro: 'Posisi hanya raja dan benteng. Lihat dua jenis rokade untuk kedua warna.',
      hint: ['e1', 'a1', 'h1'],
      steps: [
        { san: 'O-O', note: 'Rokade pendek Putih: raja ke g1, benteng h1 ke f1.', hint: ['g1', 'f1'] },
        { san: 'O-O-O', note: 'Rokade panjang Hitam: raja ke c8, benteng a8 ke d8.', hint: ['c8', 'd8'] },
      ],
    },
  },
  {
    id: 'notasi',
    category: 'dasar',
    title: 'Notasi aljabar',
    summary: 'Cara membaca dan menulis langkah catur.',
    body: [
      'Kolom (file) diberi huruf a sampai h dari kiri ke kanan sisi Putih, baris (rank) diberi angka 1 sampai 8 dari sisi Putih. Setiap kotak punya nama unik, misalnya e4 atau g8.',
      'Bidak ditulis dengan huruf: K raja, Q ratu, R benteng, B gajah, N kuda. Bidak tidak diberi huruf. Contoh: Nf3 berarti kuda ke f3, e4 berarti bidak ke e4.',
      'Tanda tambahan: x untuk makan (Nxe5, exd5), + untuk skak, # untuk skakmat, = untuk promosi (e8=Q), O-O dan O-O-O untuk rokade. Bila dua bidak sejenis bisa ke kotak yang sama, tambahkan kolom atau baris asal: Nbd2, R1e2.',
    ],
    points: [
      'Penomoran: 1.e4 e5 artinya langkah ke-1 Putih e4, Hitam e5.',
      'Hitam ditandai dengan titik tiga: 1...e5.',
      'PGN adalah format teks standar untuk menyimpan partai (bisa diimpor di menu Replay).',
    ],
  },
  {
    id: 'menang-seri',
    category: 'dasar',
    title: 'Skakmat, pat, dan remis',
    summary: 'Cara partai berakhir, dan jebakan pat.',
    body: [
      'Skakmat: raja sedang diserang (skak) dan tidak ada cara lolos: tidak bisa pindah, menangkap penyerang, atau menghalangi. Itu satu-satunya cara menang berdasarkan posisi (selain lawan menyerah atau kehabisan waktu).',
      'Pat (stalemate): pemain yang jalan tidak punya langkah legal, tetapi rajanya tidak sedang skak. Hasilnya remis, bukan kemenangan. Ini kesalahan klasik saat unggul: terlalu bersemangat mengurung raja lawan sampai tidak ada kotak tersisa.',
      'Remis juga terjadi lewat kesepakatan, pengulangan posisi tiga kali, aturan 50 langkah tanpa gerakan bidak atau penangkapan, dan material yang tidak cukup untuk skakmat (misalnya raja lawan raja, atau raja + satu ringan lawan raja).',
    ],
    points: [
      'Sebelum langkah penentu, cek: apakah lawan masih punya satu langkah legal?',
      'Raja + ratu atau raja + benteng cukup untuk skakmat; raja + kuda atau gajah saja tidak.',
      'Bila kalah material, pat dan pengulangan posisi adalah penyelamat.',
    ],
    demo: {
      fen: '7k/5Q2/6K1/8/8/8/8/8 b - - 0 1',
      intro: 'Putih punya ratu dan raja, Hitam hanya raja. Giliran Hitam jalan.',
      hint: ['h8'],
      expectStalemate: true,
      steps: [
        { note: 'Raja h8 tidak diserang, tetapi g8, g7, dan h7 semuanya dijaga oleh ratu f7 dan raja g6. Tidak ada langkah legal: ini PAT, hasilnya remis. Bandingkan: bila ratu berada di g7 (dijaga raja g6), raja yang sama sedang skak tanpa kotak lari, itulah skakmat.', hint: ['g8', 'g7', 'h7', 'h8'] },
      ],
    },
  },

  /* -------------------------------------------------------------- OPENING */
  {
    id: 'italian',
    category: 'opening',
    title: 'Italian Game',
    summary: '1.e4 e5 2.Nf3 Nc6 3.Bc4: opening klasik yang ramah pemula.',
    body: [
      'Italian Game adalah salah satu opening tertua dan paling teruji. Putih mengembangkan gajah ke c4, menekan titik f7, dan menyiapkan rokade cepat. Rencana khasnya: c3 lalu d4 untuk merebut pusat penuh.',
      'Varian tenang (Giuoco Pianissimo) memainkan d3 dan membangun posisi pelan-pelan. Varian tajam memainkan d4 segera, atau gambit Evans (4.b4) untuk membuka permainan dengan tempo.',
      'Bagi Hitam, 3...Bc5 dan 3...Nf6 adalah jawaban utama. Perhatikan jebakan di sekitar f7 dan e5, terutama bila Putih sudah menaruh gajah di c4 dan kuda di g5.',
    ],
    points: [
      'Gagasan Putih: gajah c4 menekan f7, c3 + d4 untuk pusat.',
      'Gagasan Hitam: ...d6 dan ...O-O, atau ...d5 untuk melepas pusat.',
      'Cocok dipelajari pertama: rencananya jelas dan mudah diingat.',
    ],
    demo: {
      intro: 'Garis utama Giuoco Pianissimo hingga rokade.',
      steps: [
        { san: 'e4', note: 'Pusat dan jalur gajah.', hint: ['e4'] },
        { san: 'e5', note: 'Balasan simetris.', hint: ['e5'] },
        { san: 'Nf3', note: 'Menyerang e5 sambil mengembangkan kuda.', hint: ['f3', 'e5'] },
        { san: 'Nc6', note: 'Menjaga e5.', hint: ['c6', 'e5'] },
        { san: 'Bc4', note: 'Gajah ke diagonal a2-g8, mengincar f7.', hint: ['c4', 'f7'] },
        { san: 'Bc5', note: 'Hitam membalas dengan gajah aktif yang mengincar f2.', hint: ['c5', 'f2'] },
        { san: 'c3', note: 'Gagasan d4: bidak c3 mendukung d4 yang akan dimajukan.', hint: ['c3', 'd4'] },
        { san: 'Nf6', note: 'Menyerang e4.', hint: ['f6', 'e4'] },
        { san: 'd3', note: 'Cara tenang menjaga e4 dan membuka gajah c1.', hint: ['d3'] },
        { san: 'd6', note: 'Memperkuat e5.', hint: ['d6'] },
        { san: 'O-O', note: 'Putih rokade; permainan posisi yang seimbang.', hint: ['g1', 'f1'] },
        { san: 'O-O', note: 'Hitam juga rokade. Lanjutan: Re1, a4, h3 dan Nbd2-f1-g3.', hint: ['g8', 'f8'] },
      ],
    },
  },
  {
    id: 'ruy-lopez',
    category: 'opening',
    title: 'Ruy Lopez (Spanish)',
    summary: '1.e4 e5 2.Nf3 Nc6 3.Bb5: tekanan jangka panjang pada e5.',
    body: [
      'Ruy Lopez telah menjadi senjata utama pemain elit sejak abad ke-16. Gajah b5 menekan kuda c6, penjaga bidak e5. Ancamannya tidak langsung, tetapi menciptakan tekanan jangka panjang.',
      'Setelah 3...a6 4.Ba4 Nf6 5.O-O Be7, Putih memainkan Re1 dan Bb3, lalu c3 dan d4. Hitam menjawab dengan ...b5, ...d6 dan ...O-O. Posisinya kaya strategi: siapa yang menguasai pusat, siapa yang punya kolom terbuka.',
      'Closed (dengan Marshall Attack sebagai cabang tajamnya), Open, dan Berlin adalah pilihan utama Hitam. Garis-garis ini sangat mendalam, jadi pelajari gagasannya dulu sebelum menghafal langkah.',
    ],
    points: [
      'Gagasan Putih: tekanan pada e5, lalu c3 + d4.',
      'Gagasan Hitam: ...a6 dan ...b5 mengusir gajah, ...d6 dan ...O-O.',
      'Posisinya lambat dan strategis: baik untuk melatih pemahaman posisi.',
    ],
    demo: {
      intro: 'Garis Closed Ruy Lopez.',
      steps: [
        { san: 'e4', note: 'Pusat.', hint: ['e4'] },
        { san: 'e5', note: 'Pusat.', hint: ['e5'] },
        { san: 'Nf3', note: 'Menyerang e5.', hint: ['f3', 'e5'] },
        { san: 'Nc6', note: 'Menjaga e5.', hint: ['c6'] },
        { san: 'Bb5', note: 'Gajah menekan c6, penjaga e5. Gagasannya: mengincar Nc6 agar tekanan pada e5 meningkat (bukan ancaman langsung).', hint: ['b5', 'c6', 'e5'] },
        { san: 'a6', note: 'Menanyai gajah: apakah mau menukar atau mundur?', hint: ['a6', 'b5'] },
        { san: 'Ba4', note: 'Mempertahankan tekanan; menukar di c6 adalah variasi lain.', hint: ['a4', 'c6'] },
        { san: 'Nf6', note: 'Hitam mengembangkan sambil menyerang e4.', hint: ['f6', 'e4'] },
        { san: 'O-O', note: 'Putih rokade dan membiarkan e4 untuk sementara. Bila ...Nxe4, Putih memainkan d4 atau Re1 dengan tekanan di kolom e (Open Ruy Lopez).', hint: ['g1', 'f1'] },
        { san: 'Be7', note: 'Memperkuat dan menyiapkan rokade.', hint: ['e7'] },
        { san: 'Re1', note: 'Menjaga e4 dengan benteng.', hint: ['e1', 'e4'] },
        { san: 'b5', note: 'Mengusir gajah ke b3.', hint: ['b5', 'a4'] },
        { san: 'Bb3', note: 'Gajah ke diagonal a2-g8 yang aktif.', hint: ['b3', 'g8'] },
        { san: 'd6', note: 'Mendukung e5 dan membuka gajah c8.', hint: ['d6'] },
        { san: 'c3', note: 'Menyiapkan d4.', hint: ['c3', 'd4'] },
        { san: 'O-O', note: 'Posisi khas Closed Ruy Lopez. Lanjutan khas: h3, d4, Nbd2.', hint: ['g8', 'f8'] },
      ],
    },
  },
  {
    id: 'sicilian',
    category: 'opening',
    title: 'Sicilian Defense (Najdorf)',
    summary: '1.e4 c5: pertahanan paling populer dan paling tajam untuk Hitam.',
    body: [
      'Sicilian (1...c5) adalah pembalasan tidak simetris terhadap 1.e4. Hitam tidak meniru Putih, tetapi menyerang pusat dari sayap dan menciptakan ketidakseimbangan sejak awal.',
      'Dalam Open Sicilian, Putih bermain d4 dan menukar bidak itu dengan bidak c Hitam. Putih mendapat ruang dan inisiatif; Hitam mendapat kolom c semi-terbuka dan serangan balik di sayap ratu. Varian Najdorf (5...a6) adalah yang paling fleksibel: a6 mencegah kuda atau gajah Putih ke b5 dan menyiapkan ...e5 atau ...b5.',
      'Hasilnya sering permainan tajam dengan rokade berlawanan arah: Putih menyerang raja di kingside, Hitam menyerang di sayap ratu. Sangat mendalam, tetapi layak dipelajari bila kamu suka bermain tajam.',
    ],
    points: [
      'Hitam: kolom c semi-terbuka, serangan balik di sayap ratu.',
      'Putih: ruang lebih banyak, serangan di sayap raja (Be3, f3, Qd2, g4).',
      'Hitam butuh pengetahuan teori; Putih bisa memilih Anti-Sicilian (Alapin 2.c3) bila ingin lebih tenang.',
    ],
    demo: {
      intro: 'Open Sicilian hingga Najdorf.',
      steps: [
        { san: 'e4', note: 'Putih membuka dengan bidak raja.', hint: ['e4'] },
        { san: 'c5', note: 'Sicilian: Hitam tidak mengikuti simetri. Bidak c menyerang d4 dan membuka kolom c nantinya.', hint: ['c5', 'd4'] },
        { san: 'Nf3', note: 'Menyiapkan d4.', hint: ['f3', 'd4'] },
        { san: 'd6', note: 'Menjaga e5 dan membuka gajah c8.', hint: ['d6', 'e5'] },
        { san: 'd4', note: 'Putih membuka pusat: pertukaran bidak d untuk bidak c.', hint: ['d4'] },
        { san: 'cxd4', note: 'Hitam menukar.', hint: ['d4'] },
        { san: 'Nxd4', note: 'Kuda aktif di pusat. Putih unggul ruang, Hitam punya kolom c.', hint: ['d4'] },
        { san: 'Nf6', note: 'Menyerang e4.', hint: ['f6', 'e4'] },
        { san: 'Nc3', note: 'Menjaga e4 sambil mengembangkan.', hint: ['c3', 'e4'] },
        { san: 'a6', note: 'Najdorf: a6 mencegah Nb5/Bb5, dan menyiapkan ...e5 atau ...b5. Fleksibel dan tajam.', hint: ['a6', 'b5'] },
      ],
    },
  },
  {
    id: 'french',
    category: 'opening',
    title: 'French Defense',
    summary: '1.e4 e6 2.d4 d5: kokoh, dengan serangan balik di sayap ratu.',
    body: [
      'French adalah pertahanan yang solid: Hitam membangun rantai bidak e6-d5 dan menantang pusat Putih. Kelemahan utamanya adalah gajah c8 yang terkunci di belakang bidak e6 dan d5.',
      'Hitam biasanya menyerang pangkal rantai Putih dengan ...c5, dan mengincar d4. Putih mendapat ruang, terutama setelah 3.e5 (Advance), tetapi bidak e5 itu bisa menjadi target.',
      'Pelajaran struktur bidak: rantai bidak diserang dari pangkalnya (d4 untuk Putih, e6 untuk Hitam), bukan dari ujungnya.',
    ],
    points: [
      'Hitam: ...c5 menyerang d4, ...f6 menyerang e5.',
      'Putih: ruang di kingside, serangan di sana; rantai d4-e5.',
      'Masalah Hitam: gajah c8 "buruk". Cari cara mengeluarkannya (…b6, …Ba6) atau menukarnya.',
    ],
    demo: {
      intro: 'French klasik: 3.Nc3 Nf6 4.Bg5.',
      steps: [
        { san: 'e4', note: 'Pusat.', hint: ['e4'] },
        { san: 'e6', note: 'Hitam menyiapkan d5; posisi kokoh tetapi sedikit pasif.', hint: ['e6', 'd5'] },
        { san: 'd4', note: 'Putih menguasai pusat penuh.', hint: ['d4', 'e4'] },
        { san: 'd5', note: 'Hitam menantang e4. Rantai bidak Hitam: e6-d5.', hint: ['d5', 'e6'] },
        { san: 'Nc3', note: 'Menjaga e4 dengan kuda dan mengembangkan.', hint: ['c3', 'e4'] },
        { san: 'Nf6', note: 'Menyerang e4 lagi.', hint: ['f6', 'e4'] },
        { san: 'Bg5', note: 'Gajah menekan Nf6, penjaga pusat Hitam.', hint: ['g5', 'f6'] },
        { san: 'Be7', note: 'Memecah pin dan menyiapkan rokade.', hint: ['e7'] },
        { san: 'e5', note: 'Putih mendorong e5 dan mengusir kuda f6.', hint: ['e5', 'f6'] },
        { san: 'Nfd7', note: 'Kuda mundur ke d7; Hitam akan menyerang pangkal rantai Putih dengan ...c5.', hint: ['d7', 'd4'] },
        { san: 'Bxe7', note: 'Putih menukar gajah yang menekan.', hint: ['e7'] },
        { san: 'Qxe7', note: 'Hitam menyelesaikan penukaran. Rencana Hitam: ...c5, ...Nc6, ...f6.', hint: ['e7'] },
      ],
    },
  },
  {
    id: 'caro-kann',
    category: 'opening',
    title: 'Caro-Kann Defense',
    summary: '1.e4 c6: solid, dengan gajah c8 yang tetap aktif.',
    body: [
      'Caro-Kann mirip French dalam kekokohan, tetapi memecahkan masalah gajah c8. Hitam menyiapkan ...d5 dengan ...c6, lalu mengeluarkan gajah (…Bf5) sebelum memainkan ...e6.',
      'Garis klasik: 3.Nc3 dxe4 4.Nxe4 Bf5. Hitam merelakan pusat sebentar demi struktur bidak yang sehat dan gajah yang bebas. Posisinya mudah dipahami: tidak ada kelemahan besar dan rencana jelas.',
      'Pilihan bagus untuk pemain yang menyukai permainan solid dan memainkan endgame yang nyaman.',
    ],
    points: [
      'Hitam: struktur bidak sehat, gajah c8 aktif.',
      'Putih: sedikit ruang lebih; coba serangan bidak (h4-h5) untuk mengusir gajah.',
      'Pelajari ide: gajah keluar dulu, baru ...e6.',
    ],
    demo: {
      intro: 'Garis klasik Caro-Kann.',
      steps: [
        { san: 'e4', note: 'Pusat.', hint: ['e4'] },
        { san: 'c6', note: 'Menyiapkan ...d5 dengan dukungan bidak c.', hint: ['c6', 'd5'] },
        { san: 'd4', note: 'Pusat penuh.', hint: ['d4'] },
        { san: 'd5', note: 'Hitam menantang e4.', hint: ['d5'] },
        { san: 'Nc3', note: 'Menjaga e4.', hint: ['c3', 'e4'] },
        { san: 'dxe4', note: 'Hitam menukar bidak pusat.', hint: ['e4'] },
        { san: 'Nxe4', note: 'Putih mendapat pusat dan perkembangan.', hint: ['e4'] },
        { san: 'Bf5', note: 'Gajah keluar sebelum ...e6: inti Caro-Kann.', hint: ['f5'] },
        { san: 'Ng3', note: 'Putih mengusir gajah.', hint: ['g3', 'f5'] },
        { san: 'Bg6', note: 'Gajah tetap aktif di diagonal b1-h7.', hint: ['g6'] },
        { san: 'h4', note: 'Putih mengancam h5 untuk mengusir gajah lagi.', hint: ['h4', 'h5'] },
        { san: 'h6', note: 'Hitam memberi gajah kotak mundur (h7) dan mencegah Ng5.', hint: ['h6'] },
        { san: 'Nf3', note: 'Putih mengembangkan.', hint: ['f3'] },
        { san: 'Nd7', note: 'Hitam solid: akan memainkan ...Ngf6, ...e6, ...Be7. Posisi seimbang.', hint: ['d7'] },
      ],
    },
  },
  {
    id: 'queens-gambit',
    category: 'opening',
    title: "Queen's Gambit",
    summary: '1.d4 d5 2.c4: perebutan pusat dengan bidak sayap.',
    body: [
      "Queen's Gambit (1.d4 d5 2.c4) bukan gambit sejati: bila Hitam menerima bidak (2...dxc4), Putih biasanya bisa mengambilnya kembali. Tujuan Putih adalah menarik bidak d Hitam menjauh dari pusat.",
      'Hitam memiliki dua pendekatan utama: menolak (Declined, 2...e6) yang kokoh, atau menerima (Accepted, 2...dxc4) yang lebih terbuka. Setelah Declined, struktur khasnya adalah Carlsbad, yang muncul dari Exchange Variation (cxd5 exd5): Putih memainkan serangan minoritas (b4-b5) terhadap bidak c Hitam.',
      'Opening ini sangat kaya posisi dan sering dipilih oleh pemain strategis. Mudah dipelajari lewat rencana: kembangkan kuda, gajah, dan rokade; jangan terburu-buru memainkan e4.',
    ],
    points: [
      'Putih: tekan d5 dengan c4, lanjut Nc3, Bg5 atau Nf3.',
      'Hitam: ...e6 dan ...Nf6, bila perlu ...c5 atau ...dxc4 untuk membebaskan diri.',
      'Pelajari struktur Carlsbad: Putih menyerang bidak c dengan serangan minoritas.',
    ],
    demo: {
      intro: "Queen's Gambit Declined.",
      steps: [
        { san: 'd4', note: 'Pusat dengan bidak ratu.', hint: ['d4'] },
        { san: 'd5', note: 'Balasan simetris.', hint: ['d5'] },
        { san: 'c4', note: 'Gambit: Putih menyerang d5 dengan bidak sayap.', hint: ['c4', 'd5'] },
        { san: 'e6', note: 'Hitam menolak dan menjaga d5. Solid, tetapi gajah c8 terkunci.', hint: ['e6', 'd5'] },
        { san: 'Nc3', note: 'Menambah tekanan pada d5.', hint: ['c3', 'd5'] },
        { san: 'Nf6', note: 'Hitam mengembangkan dan menjaga d5.', hint: ['f6'] },
        { san: 'Bg5', note: 'Menekan Nf6, penjaga d5.', hint: ['g5', 'f6'] },
        { san: 'Be7', note: 'Memecah pin dan menyiapkan rokade.', hint: ['e7'] },
        { san: 'e3', note: 'Putih membuka gajah f1 dan menjaga pusat.', hint: ['e3'] },
        { san: 'O-O', note: 'Hitam rokade.', hint: ['g8', 'f8'] },
        { san: 'Nf3', note: 'Putih menyelesaikan perkembangan kuda.', hint: ['f3'] },
        { san: 'h6', note: 'Hitam bertanya pada gajah.', hint: ['h6', 'g5'] },
        { san: 'Bh4', note: 'Gajah tetap menekan Nf6.', hint: ['h4', 'f6'] },
        { san: 'b6', note: 'Tartakower: Hitam menyiapkan ...Bb7 dan ...Ne4 untuk menyederhanakan posisi.', hint: ['b6', 'b7'] },
      ],
    },
  },
  {
    id: 'london',
    category: 'opening',
    title: 'London System',
    summary: 'Sistem bangun-sendiri untuk Putih: Bf4, e3, Nf3, c3.',
    body: [
      'London System adalah susunan (sistem) yang bisa dimainkan Putih hampir tanpa peduli balasan Hitam: d4, Bf4, e3, Nf3, c3, Nbd2, Bd3 (atau Be2), lalu rokade. Teori yang harus dihafal jauh lebih sedikit.',
      'Gajah bertugas di f4 sebelum e3 menutupnya, yang menjadi gagasan utama: gajah "buruk" dikeluarkan lebih dahulu. Struktur kokoh, rencana sederhana, dan serangan di sayap raja sering muncul.',
      'Kelemahannya: karena sangat fleksibel, Hitam bisa langsung membalas dengan sistem sendiri (misalnya ...c5 dan ...Qb6). Pelajari bagaimana menghadapi tekanan pada b2 dan d4.',
    ],
    points: [
      'Susunan Putih: d4, Bf4, e3, Nf3, c3, Nbd2, Bd3, O-O.',
      'Gagasan: gajah f4 keluar sebelum e3.',
      'Hati-hati pada ...Qb6 dan ...c5 dari Hitam.',
    ],
    demo: {
      intro: 'London System melawan setup Hitam yang klasik.',
      steps: [
        { san: 'd4', note: 'Pusat.', hint: ['d4'] },
        { san: 'd5', note: 'Balasan simetris.', hint: ['d5'] },
        { san: 'Bf4', note: 'Gajah keluar sebelum e3: ciri khas London.', hint: ['f4'] },
        { san: 'Nf6', note: 'Hitam mengembangkan.', hint: ['f6'] },
        { san: 'e3', note: 'Menjaga d4 dan membuka gajah f1.', hint: ['e3'] },
        { san: 'e6', note: 'Hitam solid.', hint: ['e6'] },
        { san: 'Nf3', note: 'Perkembangan kuda raja.', hint: ['f3'] },
        { san: 'c5', note: 'Hitam menantang d4.', hint: ['c5', 'd4'] },
        { san: 'c3', note: 'Putih memperkuat d4 dengan bidak.', hint: ['c3', 'd4'] },
        { san: 'Nc6', note: 'Hitam menambah tekanan pada d4.', hint: ['c6', 'd4'] },
        { san: 'Nbd2', note: 'Kuda kedua keluar tanpa menutupi gajah c1 yang sudah di f4.', hint: ['d2'] },
        { san: 'Bd6', note: 'Hitam menawarkan penukaran gajah.', hint: ['d6', 'f4'] },
        { san: 'Bg3', note: 'Putih menghindari penukaran yang merusak bidak, dan gajah tetap aktif di g3.', hint: ['g3'] },
        { san: 'O-O', note: 'Posisi khas London. Putih lanjutkan dengan Bd3 dan rokade, Hitam dengan ...Qe7 atau ...Qb6.', hint: ['g8', 'f8'] },
      ],
    },
  },
  {
    id: 'kings-indian',
    category: 'opening',
    title: "King's Indian Defense",
    summary: 'Hitam membiarkan Putih menguasai pusat, lalu menyerangnya.',
    body: [
      "King's Indian (1.d4 Nf6 2.c4 g6) adalah pertahanan 'hypermodern': Hitam tidak menduduki pusat dengan bidak, tetapi mengontrolnya dari jauh dengan gajah g7 dan kuda, lalu menyerang pusat Putih pada saat yang tepat (…e5 atau …c5).",
      'Putih mendapat ruang pusat yang besar (bidak c4, d4, e4). Hitam rokade pendek, memutar kuda ke arah kingside, dan bermain ...f5 untuk serangan bidak ke arah raja Putih. Hasilnya sering rokade yang saling menyerang di dua sayap.',
      'Opening ini berisiko tinggi: bila Hitam terlambat, posisi bisa terjepit. Tetapi imbalannya adalah serangan balik yang kuat.',
    ],
    points: [
      'Hitam: gajah g7 (fianchetto), rokade pendek, ...e5 atau ...c5.',
      'Putih: ruang pusat, serangan di sayap ratu (c5, b4).',
      'Perlombaan: Putih menyerang di queenside, Hitam di kingside.',
    ],
    demo: {
      intro: "King's Indian Defense klasik.",
      steps: [
        { san: 'd4', note: 'Pusat.', hint: ['d4'] },
        { san: 'Nf6', note: 'Kuda mengontrol e4 dan d5 tanpa menduduki pusat.', hint: ['f6', 'e4', 'd5'] },
        { san: 'c4', note: 'Putih memperluas ruang di pusat.', hint: ['c4'] },
        { san: 'g6', note: 'Menyiapkan gajah g7 (fianchetto).', hint: ['g6', 'g7'] },
        { san: 'Nc3', note: 'Putih mengembangkan.', hint: ['c3'] },
        { san: 'Bg7', note: 'Gajah menekan diagonal besar a1-h8 menuju pusat dan Putih.', hint: ['g7', 'd4'] },
        { san: 'e4', note: 'Putih mendapat pusat penuh: bidak c4, d4, e4.', hint: ['e4', 'd4', 'c4'] },
        { san: 'd6', note: 'Hitam menyiapkan ...e5 atau ...c5 untuk menyerang pusat.', hint: ['d6'] },
        { san: 'Nf3', note: 'Putih menyelesaikan perkembangan kuda raja.', hint: ['f3'] },
        { san: 'O-O', note: 'Hitam rokade.', hint: ['g8', 'f8'] },
        { san: 'Be2', note: 'Putih menyiapkan rokade.', hint: ['e2'] },
        { san: 'e5', note: 'Inilah saatnya: Hitam menantang pusat Putih dengan ...e5. Lanjutan khas: O-O Nc6, d5 Ne7, lalu serangan bidak ...f5 ke arah raja Putih.', hint: ['e5', 'd4'] },
      ],
    },
  },
  {
    id: 'jebakan-opening',
    category: 'opening',
    title: 'Jebakan opening yang harus dikenali',
    summary: 'Scholar\'s Mate dan Legal\'s Mate: cara menang cepat dan cara menghindarinya.',
    body: [
      "Scholar's Mate adalah serangan 4 langkah yang menargetkan f7 dengan ratu dan gajah. Mudah dihentikan: jaga f7 atau serang ratu lebih dulu (…Nc6, …Nf6 saat ratu belum menyerang, atau …g6).",
      "Legal's Mate menjebak lawan yang menggigit umpan: Putih mengorbankan ratu untuk skakmat dengan dua kuda dan satu gajah. Pelajarannya: jangan serakah memakan ratu yang tampak gratis tanpa menghitung dulu, dan jangan mengabaikan ancaman terhadap e5 dan f7.",
      'Mengenali pola ini membantumu menang cepat saat lawan ceroboh, dan terhindar dari kekalahan cepat saat kamu yang ceroboh.',
    ],
    points: [
      'Awasi f7 (dan f2): hanya dijaga raja di awal permainan.',
      'Jangan keluarkan ratu terlalu dini; ia mudah diserang.',
      'Jika lawan menawarkan ratu gratis, cari tahu apakah ada skakmat.',
    ],
    demo: {
      intro: "Legal's Mate: Putih mengorbankan ratu untuk skakmat dengan kuda.",
      expectMate: true,
      steps: [
        { san: 'e4', note: 'Pusat.', hint: ['e4'] },
        { san: 'e5', note: 'Pusat.', hint: ['e5'] },
        { san: 'Nf3', note: 'Menyerang e5.', hint: ['f3', 'e5'] },
        { san: 'd6', note: 'Menjaga e5 dengan cara pasif.', hint: ['d6'] },
        { san: 'Bc4', note: 'Gajah menekan f7.', hint: ['c4', 'f7'] },
        { san: 'Bg4', note: 'Hitam menekan Nf3 (kuda yang menyerang e5) dengan memin kuda itu ke ratu. Tampak wajar, tetapi berbahaya.', hint: ['g4', 'f3'] },
        { san: 'Nc3', note: 'Putih mengembangkan dan menyiapkan jebakan.', hint: ['c3'] },
        { san: 'g6', note: 'Hitam lengah: tidak waspada pada ancaman di e5 dan f7.', hint: ['g6'] },
        { san: 'Nxe5', note: 'Pengorbanan ratu! Kuda memakan e5; Nf3 yang pinned bukan masalah karena hal ini membuka Bg4 untuk memakan ratu.', hint: ['e5', 'g4'] },
        { san: 'Bxd1', note: 'Hitam serakah dan memakan ratu.', hint: ['d1'] },
        { san: 'Bxf7+', note: 'Skak! Raja terpaksa pindah ke e7.', hint: ['f7', 'e8'] },
        { san: 'Ke7', note: 'Raja tidak punya pilihan lain.', hint: ['e7'] },
        { san: 'Nd5#', note: "Skakmat! Dua kuda dan satu gajah menjerat raja: kotak pelarian ditutup oleh kuda e5 dan gajah f7.", hint: ['d5', 'e7', 'f7', 'e5'] },
      ],
    },
  },

  /* --------------------------------------------------------------- TAKTIK */
  {
    id: 'cek-tiga',
    category: 'taktik',
    title: 'Skak, tangkap, ancam: pemeriksaan taktis',
    summary: 'Kebiasaan 3 pertanyaan sebelum setiap langkah.',
    body: [
      'Sebagian besar kesalahan di level pemula adalah kesalahan taktis. Biasakan memeriksa tiga hal sebelum langkah: Skak (apakah ada skak untukku dan lawan?), Tangkap (bidak apa yang bisa ditangkap, termasuk bidak yang tidak terjaga?), Ancam (apa yang diancam lawan, dan apa yang bisa kuancam?).',
      'Sebelum melangkah, tanya: "Setelah langkah ini, apa yang diserang lawan?" dan "Apakah ada bidakku yang tidak terjaga?" Dua pertanyaan ini mencegah mayoritas bidak yang hilang percuma.',
      'Pola taktik berikutnya (garpu, pin, skewer, serangan tersingkap) hanya muncul saat kamu terbiasa mencari skak dan penangkapan. Latihan pola dan latihan menghitung adalah dua hal berbeda: keduanya harus dilatih.',
    ],
    points: [
      'Sebelum melangkah: apa yang diserang lawan setelah langkahku?',
      'Bidak tidak terjaga adalah target termudah.',
      'Cari langkah paksaan (skak, tangkap, ancam) lebih dulu: lawanmu bebas memilih jawaban hanya bila tidak ada paksaan.',
    ],
  },
  {
    id: 'garpu',
    category: 'taktik',
    title: 'Garpu (fork)',
    summary: 'Satu bidak menyerang dua target sekaligus.',
    body: [
      'Garpu terjadi saat satu bidak menyerang dua (atau lebih) bidak lawan di saat yang sama, dan lawan hanya bisa menyelamatkan satu. Kuda adalah ahli garpu karena lompatannya tidak bisa dihalangi dan menyerang dalam pola khusus.',
      'Garpu paling kuat adalah garpu dengan skak: raja wajib bergerak, sehingga target lain tidak bisa diselamatkan. Garpu kuda pada raja dan benteng atau ratu sering menentukan hasil partai.',
      'Cara mencegah: perhatikan kotak yang bisa dijangkau kuda lawan dua langkah ke depan, terutama kotak yang menyerang raja dan bidak berharga sekaligus.',
    ],
    points: [
      'Kuda sering melakukan garpu pada raja + benteng atau ratu.',
      'Bidak juga bisa garpu: satu bidak menyerang dua buah ringan secara diagonal.',
      'Pastikan kotak garpu tidak bisa dimakan raja lawan (misalnya didukung bidak atau buah lain).',
    ],
    demo: {
      fen: 'r3k3/8/1P6/1N6/8/8/8/4K3 w - - 0 1',
      intro: 'Kuda Putih b5 dan bidak b6 melawan raja dan benteng Hitam. Apa yang bisa dilakukan?',
      hint: ['b5', 'e8', 'a8'],
      steps: [
        { san: 'Nc7+', note: 'Garpu! Kuda mengancam raja e8 dan benteng a8 sekaligus. Bidak b6 menjaga kuda sehingga raja tidak bisa memakannya.', hint: ['c7', 'e8', 'a8'] },
        { san: 'Kf7', note: 'Raja wajib bergerak dari skak.', hint: ['f7'] },
        { san: 'Nxa8', note: 'Benteng jatuh. Garpu memenangkan material tanpa pengorbanan.', hint: ['a8'] },
      ],
    },
  },
  {
    id: 'pin',
    category: 'taktik',
    title: 'Pin (skak tusuk)',
    summary: 'Bidak tidak bisa bergerak karena akan membuka bidak berharga di belakangnya.',
    body: [
      'Pin terjadi saat bidak lawan tidak bisa (atau tidak boleh) bergerak karena di belakangnya ada bidak yang lebih berharga. Pin mutlak: bidak di depan raja, tidak boleh bergerak sama sekali. Pin relatif: bidak di depan ratu atau benteng, boleh bergerak tetapi akan kehilangan material.',
      'Bidak yang terpin mudah diserang: ia tidak bisa lari. Strateginya, tambah penyerang pada bidak yang terpin sampai penjaganya tak cukup.',
      'Pin dilakukan gajah, benteng, atau ratu (bidak yang bergerak lurus atau diagonal panjang). Memecah pin: gerakkan bidak di belakang, blokir, atau serang bidak yang memin.',
    ],
    points: [
      'Bidak yang terpin adalah target: tambah penyerang.',
      'Sebelum melangkah, periksa apakah ada bidakmu yang terpin dan tidak sadar.',
      'Mencegah pin: rokade lebih dulu, atau jaga bidak yang bisa dipin dengan bidak lain.',
    ],
    demo: {
      fen: '4k3/4n3/8/8/1B6/8/4R3/4K3 w - - 0 1',
      intro: 'Kuda e7 terpin pada raja e8 oleh benteng e2 (kolom e). Gajah b4 juga mengincar e7.',
      hint: ['e2', 'e7', 'e8', 'b4'],
      steps: [
        { san: 'Bxe7', note: 'Kuda yang terpin hanya dijaga raja, padahal diserang dua kali (gajah dan benteng). Raja tidak bisa memakan kembali: gajah e7 dijaga benteng e2. Putih menang satu kuda.', hint: ['e7', 'e2'] },
      ],
    },
  },
  {
    id: 'skewer',
    category: 'taktik',
    title: 'Skewer (tusuk-sate)',
    summary: 'Kebalikan dari pin: bidak berharga di depan dipaksa pindah, bidak di belakang jatuh.',
    body: [
      'Skewer menyerang bidak berharga (sering raja atau ratu) dan memaksanya pindah, sehingga bidak di belakangnya, di garis yang sama, bisa dimakan. Ini kebalikan dari pin: di pin, bidak berharga ada di belakang; di skewer, ia ada di depan.',
      'Skewer paling klasik: benteng atau gajah memberi skak pada raja yang ratunya berada di belakangnya, di kolom atau diagonal yang sama. Raja harus bergerak, lalu ratu dimakan.',
      'Cara menghindari: jangan menaruh raja dan ratu pada garis yang sama pada kolom, baris, atau diagonal yang bisa diserang benteng atau gajah lawan.',
    ],
    points: [
      'Skewer sering dilakukan dengan skak pada raja.',
      'Waspadai raja dan ratu pada kolom atau diagonal yang sama.',
      'Benteng dan gajah adalah pelaku utama.',
    ],
    demo: {
      fen: '4q3/8/8/4k3/8/8/8/R5K1 w - - 0 1',
      intro: 'Raja dan ratu Hitam berada di kolom e (raja di depan, ratu di belakang). Benteng Putih di a1.',
      hint: ['e5', 'e8', 'a1'],
      steps: [
        { san: 'Re1+', note: 'Skak sepanjang kolom e. Raja berada di depan, ratu tepat di belakangnya.', hint: ['e1', 'e5', 'e8'] },
        { san: 'Kd5', note: 'Raja harus meninggalkan kolom e (ratu tidak bisa menghalangi dari belakang).', hint: ['d5'] },
        { san: 'Rxe8', note: 'Ratu tidak terlindungi: Putih memenangkan ratu dengan benteng.', hint: ['e8'] },
      ],
    },
  },
  {
    id: 'tersingkap',
    category: 'taktik',
    title: 'Serangan tersingkap (discovered attack)',
    summary: 'Gerakkan satu bidak, bidak di belakangnya mulai menyerang.',
    body: [
      'Serangan tersingkap terjadi saat bidak yang bergerak membuka garis serang bidak di belakangnya (benteng, gajah, atau ratu). Bidak yang bergerak punya "gerakan gratis" karena lawan harus menjawab ancaman yang tersingkap.',
      'Bentuk paling berbahaya adalah skak tersingkap: bidak yang bergerak bisa menyerang apa saja (misalnya memakan ratu) sementara lawan harus menjawab skak, dan tidak sempat mengambil kembali.',
      'Skak ganda (double check) lebih kuat lagi: kedua bidak memberi skak, sehingga satu-satunya jawaban adalah memindahkan raja.',
    ],
    points: [
      'Cari bidakmu yang berada di depan benteng atau gajah dan raja lawan di belakang.',
      'Bidak yang bergerak bisa mengancam sesuatu yang berharga sambil membuka skak.',
      'Skak ganda memaksa raja bergerak, tidak bisa ditangkis dengan blokir atau penangkapan.',
    ],
    demo: {
      fen: '4k3/8/8/2q5/4N3/8/4R3/4K3 w - - 0 1',
      intro: 'Kuda e4 berada di depan benteng e2; raja Hitam di e8 di ujung kolom yang sama. Ratu Hitam di c5 diserang kuda.',
      hint: ['e4', 'e2', 'e8', 'c5'],
      steps: [
        { san: 'Nxc5+', note: 'Kuda memakan ratu sekaligus membuka kolom e: benteng e2 memberi skak. Raja harus bergerak, ratu tidak bisa diselamatkan.', hint: ['c5', 'e2', 'e8'] },
        { san: 'Kf7', note: 'Raja menghindar. Putih menang ratu.', hint: ['f7'] },
      ],
    },
  },
  {
    id: 'mat-lorong',
    category: 'taktik',
    title: 'Mat lorong (back rank)',
    summary: 'Raja terkurung oleh bidaknya sendiri di baris terakhir.',
    body: [
      'Raja yang sudah rokade dengan tiga bidak tidak bergerak di depannya tidak punya jalan keluar; satu serangan benteng atau ratu di baris terakhir bisa berarti skakmat. Ini adalah tema taktik paling umum di semua level.',
      'Pencegahan: beri raja "jendela" (luft) dengan memajukan satu bidak (h3 atau h6), atau jaga baris terakhir dengan benteng.',
      'Peluang: bila lawan memiliki raja terkurung, periksa apakah benteng atau ratu bisa mencapai baris terakhir, misalnya lewat penukaran atau pengorbanan yang mengusir penjaga.',
    ],
    points: [
      'Beri raja luft (h3/h6) sebelum terlambat.',
      'Benteng penjaga baris pertama jangan dipindahkan sembarangan.',
      'Hati-hati pada penukaran yang menghilangkan penjaga baris terakhir.',
    ],
    demo: {
      fen: '6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1',
      intro: 'Raja Hitam terkurung oleh tiga bidaknya sendiri. Benteng Putih di kolom d.',
      hint: ['g8', 'f7', 'g7', 'h7', 'd1'],
      expectMate: true,
      steps: [
        { san: 'Rd8#', note: 'Skakmat! Benteng memberi skak di baris kedelapan; raja tidak bisa lari karena f7, g7, dan h7 ditempati bidaknya sendiri.', hint: ['d8', 'g8'] },
      ],
    },
  },

  /* ------------------------------------------------------------- STRATEGI */
  {
    id: 'rencana',
    category: 'strategi',
    title: 'Cara menilai posisi dan memilih rencana',
    summary: 'Daftar periksa Steinitz: material, raja, aktivitas, struktur bidak.',
    body: [
      'Saat tidak ada taktik, kamu butuh rencana. Mulai dengan menilai posisi: (1) material: siapa yang unggul? (2) keamanan raja: raja siapa lebih terbuka? (3) aktivitas bidak: bidak siapa lebih aktif, siapa lebih pasif? (4) struktur bidak: apa kekuatan dan kelemahannya? (5) kontrol pusat dan ruang.',
      'Rencana yang baik selalu berhubungan dengan kelemahan lawan: serang bidak lemah, kuasai kolom terbuka, tempatkan kuda di outpost, atau buka garis menuju raja lawan. Tanpa rencana, langkahmu cenderung acak.',
      'Tanyakan juga: "Bidak mana yang paling buruk posisinya?" dan carilah cara memperbaikinya. Pemain kuat sering menang bukan dengan taktik, tetapi dengan memperbaiki posisi bidak terburuknya secara bertahap sambil menghalangi rencana lawan (profilaksis).',
    ],
    points: [
      'Perbaiki bidak terburukmu.',
      'Tanya: "Apa yang diinginkan lawan?" dan hentikan itu lebih dulu.',
      'Jika unggul, sederhanakan; jika kalah, cari komplikasi.',
      'Jangan membuka posisi bila lawanmu lebih siap di sana.',
    ],
  },
  {
    id: 'pusat',
    category: 'strategi',
    title: 'Pusat dan ruang',
    summary: 'Pusat memberi bidak ringan ruang; ruang adalah keunggulan jangka panjang.',
    body: [
      'Pemilik pusat lebih leluasa memindahkan bidak ke dua sayap dengan cepat. Ruang (bidak yang lebih maju) membatasi gerak bidak lawan, sehingga mereka saling menghalangi.',
      'Tetapi pusat besar juga bisa menjadi target. Pertahanan "hypermodern" (King\'s Indian, Grünfeld) sengaja membiarkan Putih menduduki pusat lalu menyerangnya. Karena itu, pusat dinilai dari seberapa kuat ia bisa dipertahankan, bukan sekadar seberapa besar.',
      'Aturan sederhana: serangan di sayap hanya berhasil bila pusat tertutup atau stabil; bila pusat terbuka, lawan bisa membalas lewat pusat dan raja yang belum rokade menjadi berbahaya. Singkatnya: "balas serangan di sayap dengan serangan di pusat".',
    ],
    points: [
      'Ruang lebih besar = bidak lebih leluasa; lawan lebih terbatas.',
      'Pusat besar harus dijaga, bukan hanya dibangun.',
      'Balas serangan di sayap dengan serangan di pusat.',
    ],
  },
  {
    id: 'struktur-bidak',
    category: 'strategi',
    title: 'Struktur bidak: kekuatan dan kelemahan',
    summary: 'Bidak tidak bisa mundur: setiap dorongan memengaruhi seluruh permainan.',
    body: [
      'Bidak adalah satu-satunya buah catur yang tidak bisa mundur, sehingga struktur bidak menentukan karakter permainan. Kelemahan struktural: bidak terisolasi (tidak ada bidak teman di kolom tetangga), bidak ganda (dua bidak di satu kolom), dan bidak terbelakang (tidak bisa maju aman dan tidak ada yang menjaganya).',
      'Kekuatan struktural: bidak lewat (tidak ada bidak lawan di kolom yang sama atau tetangga di depannya) dan rantai bidak yang saling melindungi. Bidak lewat yang aman adalah kekuatan terbesar di endgame; "bidak lewat harus didorong."',
      'Bidak terisolasi tidak selalu buruk: ia memberi aktivitas bidak ringan, tetapi harus dijaga bidak ringan dan menjadi target di endgame. Bidak ganda biasanya lemah karena tidak bisa saling melindungi dan sulit membentuk bidak lewat.',
    ],
    points: [
      'Isolani: bidak tak punya teman di kolom sebelah, sulit dijaga.',
      'Bidak ganda: kelemahan, tetapi kadang memberi kolom terbuka untuk benteng.',
      'Bidak lewat: dorong bila dilindungi, blokir bila milik lawan (dengan kuda).',
    ],
    demo: {
      fen: '4k3/ppp2ppp/8/3P4/8/8/PP3PPP/4K3 w - - 0 1',
      intro: 'Bidak d5 Putih terisolasi: tidak ada bidak Putih di kolom c maupun e.',
      hint: ['d5', 'c2', 'c3', 'e2', 'e3'],
      steps: [
        { note: 'Bidak d5 tidak bisa dijaga bidak lain; hanya buah ringan dan benteng yang bisa membelanya. Hitam bisa menyerangnya dengan ...c6, dan kotak di depannya (d6) menjadi pos blokade yang nyaman bagi kuda Hitam. Di endgame, isolani sering menjadi kelemahan.', hint: ['d5', 'd6', 'c6'] },
      ],
    },
  },
  {
    id: 'outpost',
    category: 'strategi',
    title: 'Outpost: pos aman bagi kuda',
    summary: 'Kotak yang tidak bisa diserang bidak lawan.',
    body: [
      'Outpost adalah kotak di wilayah lawan yang tidak bisa diserang bidak lawan lagi, biasanya didukung bidak sendiri. Kuda yang duduk di outpost bisa sangat kuat karena tidak bisa diusir.',
      'Kuda paling baik di outpost karena jangkauannya pendek, sehingga lebih baik dekat dengan sasaran. Kuda di d5 (atau e5, c5) yang didukung bidak e4 (atau f4) sering lebih kuat daripada gajah.',
      'Cara mencari outpost: lihat kolom tetangga lawan tempat bidaknya sudah maju atau hilang. Kotak yang tidak bisa diserang bidak lawan adalah calon outpost.',
    ],
    points: [
      'Outpost didukung bidak sendiri dan tidak bisa diserang bidak lawan.',
      'Kuda di outpost bisa sangat dominan.',
      'Jangan membiarkan lawan menduduki outpost di wilayahmu tanpa perlawanan.',
    ],
    demo: {
      fen: '4k3/pp3ppp/8/3N4/4P3/8/PP3PPP/4K3 w - - 0 1',
      intro: 'Kuda Putih di d5 didukung bidak e4. Hitam tidak punya bidak di kolom c atau e.',
      hint: ['d5', 'e4', 'c6', 'e6'],
      steps: [
        { note: 'Kuda d5 tidak bisa diusir bidak: tidak ada bidak Hitam di kolom c (…c6) atau e (…e6) yang bisa menyerangnya. Dari sana ia mengincar b6, c7, e7, dan f6, dan hanya bisa disingkirkan lewat penukaran dengan buah ringan Hitam.', hint: ['d5', 'e7', 'c7', 'b6', 'f6'] },
      ],
    },
  },
  {
    id: 'kolom-terbuka',
    category: 'strategi',
    title: 'Kolom terbuka dan baris ketujuh',
    summary: 'Benteng butuh jalur terbuka; baris ketujuh adalah sasaran emas.',
    body: [
      'Benteng kuat di kolom terbuka (tanpa bidak) atau semi-terbuka (tanpa bidakmu sendiri). Tempatkan benteng di sana, lalu masuk ke wilayah lawan. Satu benteng di kolom terbuka sering kehilangan arti bila lawan bisa menukarnya; dua benteng yang saling mendukung jauh lebih kuat.',
      'Baris ketujuh (baris kedua lawan) adalah tempat di mana bidak lawan masih di barisan awal dan raja sering terjebak. Benteng di baris ketujuh menyerang banyak bidak sekaligus dan menahan raja di baris terakhir.',
      'Benteng di baris ketujuh sering dianggap setara dengan keunggulan satu bidak (ini pedoman, bukan hukum). Hubungkan dua benteng di sana dan sering menang atau setidaknya remis permanen lewat skak abadi.',
    ],
    points: [
      'Benteng ke kolom terbuka, lalu ke baris ketujuh.',
      'Dua benteng yang terhubung lebih kuat daripada dua yang terpisah.',
      'Jangan menyerahkan satu-satunya kolom terbuka tanpa kompensasi.',
    ],
    demo: {
      fen: '6k1/pp3ppp/8/8/8/8/PP3PPP/3R2K1 w - - 0 1',
      intro: 'Benteng Putih menguasai kolom d yang terbuka. Hitam tidak punya benteng.',
      hint: ['d1', 'd7', 'b7', 'f7'],
      steps: [
        { san: 'Rd7', note: 'Benteng masuk ke baris ketujuh. Ia menyerang b7 (tidak terjaga) dan f7 (dijaga raja).', hint: ['d7', 'b7', 'f7'] },
        { san: 'b6', note: 'Hitam menyelamatkan b7, tetapi kini bidak a7 yang tidak terjaga ikut terbuka bagi benteng.', hint: ['b6', 'a7'] },
        { san: 'Rxa7', note: 'Putih memakan bidak dan benteng tetap mendominasi baris ketujuh sambil menjepit raja.', hint: ['a7'] },
      ],
    },
  },
  {
    id: 'pasangan-gajah',
    category: 'strategi',
    title: 'Pasangan gajah dan gajah baik/buruk',
    summary: 'Dua gajah saling melengkapi; gajah dinilai dari bidaknya.',
    body: [
      'Pasangan gajah (bishop pair): memiliki kedua gajah (satu di kotak terang, satu di kotak gelap) adalah keunggulan kecil tetapi nyata, terutama di posisi terbuka. Dua gajah mengontrol semua kotak dan menyerang dari jarak jauh.',
      'Gajah "baik" adalah gajah yang bidak-bidak sendirinya tidak berada di warna kotak yang sama (gerakannya bebas). Gajah "buruk" terhalang bidak sendiri di warna kotak yang sama. Tukar gajah buruk bila bisa, atau keluarkan sebelum menutupnya (inti London System).',
      'Gajah lebih baik daripada kuda di posisi terbuka dengan bidak di dua sayap; kuda lebih baik di posisi tertutup dan butuh outpost. Kombinasi gajah dan benteng lebih unggul di endgame dengan bidak di dua sayap.',
    ],
    points: [
      'Pasangan gajah: jangan mudah menyerahkannya tanpa kompensasi.',
      'Gajah buruk: tukar atau keluarkan lebih dulu.',
      'Posisi terbuka menguntungkan gajah; posisi tertutup menguntungkan kuda.',
    ],
  },

  /* -------------------------------------------------------------- ENDGAME */
  {
    id: 'endgame-prinsip',
    category: 'endgame',
    title: 'Prinsip endgame',
    summary: 'Raja jadi bidak aktif, bidak lewat harus didorong.',
    body: [
      'Di endgame, raja bukan lagi bidak yang harus disembunyikan: ia adalah bidak kuat yang ikut menyerang dan membela. Bawa raja ke pusat secepatnya begitu ratu ditukar.',
      'Bidak lewat harus didorong: bidak lewat memaksa lawan menahannya, mengikat bidak lawan. Letakkan benteng di belakang bidak lewat (aturan Tarrasch), milikmu sendiri maupun lawan, agar benteng makin kuat saat bidak maju.',
      'Hitung dengan tepat: endgame adalah soal tempo (siapa mendahului siapa). Penting: aturan kotak, oposisi, dan kotak kunci menjawab pertanyaan "apakah raja sempat menangkap bidak itu?"',
    ],
    points: [
      'Aktifkan raja begitu ratu sudah ditukar.',
      'Benteng di belakang bidak lewat, bukan di depannya.',
      'Kuasai kolom atau baris sebelum lawan melakukannya.',
      'Dua bidak lewat yang terhubung sangat kuat.',
    ],
  },
  {
    id: 'oposisi',
    category: 'endgame',
    title: 'Oposisi: raja dan bidak melawan raja',
    summary: 'Siapa yang "tidak boleh melangkah" kalah: kunci semua endgame bidak.',
    body: [
      'Oposisi: dua raja berhadapan di kolom, baris, atau diagonal dengan satu kotak kosong di antaranya. Pemain yang harus melangkah dalam posisi itu melepaskan oposisi dan harus memberi jalan kepada rajanya lawan. Konsep ini lahir dari zugzwang: kewajiban bergerak yang merugikan.',
      'Dalam raja dan bidak melawan raja, raja pemilik bidak harus berada di depan bidaknya. Dengan raja di kotak kunci (dua baris di depan bidak), bidak selalu bisa dipromosikan; bila raja pembela berhasil merebut oposisi atau masuk ke kotak kunci lebih dulu, hasilnya umumnya remis.',
      'Latihan sederhana ini adalah dasar semua endgame bidak, sehingga layak dihafal. Sebagian besar kemenangan endgame bidak berasal dari menguasai oposisi di momen yang tepat.',
    ],
    points: [
      'Raja di depan bidak, bukan di belakangnya.',
      'Dapatkan oposisi saat lawan yang harus melangkah.',
      'Kotak kunci bidak di baris 2 sampai 4: tiga kotak dua baris di depannya (mis. bidak e4: d6, e6, f6).',
    ],
    demo: {
      fen: '4k3/8/4K3/4P3/8/8/8/8 w - - 0 1',
      intro: 'Demo kotak kunci: raja Putih sudah di e6 (di depan bidak e5), dua baris di depan bidak. Raja Hitam e8 berhadapan dengannya, tetapi karena raja Putih sudah di kotak kunci, Putih tetap menang.',
      hint: ['e6', 'e8', 'e5'],
      steps: [
        { san: 'Kd6', note: 'Putih bergeser agar bisa maju. Raja Hitam tidak bisa lolos ke e7 atau d7 yang diserang.', hint: ['d6'] },
        { san: 'Kd8', note: 'Hitam mempertahankan posisi dekat kotak promosi.', hint: ['d8'] },
        { san: 'e6', note: 'Bidak maju dengan dukungan raja d6. Raja Hitam tidak bisa menyerang e6.', hint: ['e6'] },
        { san: 'Ke8', note: 'Hitam mencoba oposisi lagi.', hint: ['e8'] },
        { san: 'e7', note: 'Bidak maju dan dijaga raja d6; Hitam tidak bisa makan.', hint: ['e7'] },
        { san: 'Kf7', note: 'Raja Hitam menyerang bidak e7.', hint: ['f7', 'e7'] },
        { san: 'Kd7', note: 'Raja Putih menjaga e7 dan e8: bidak akan promosi di e8. Putih menang.', hint: ['d7', 'e8'] },
      ],
    },
  },
  {
    id: 'aturan-kotak',
    category: 'endgame',
    title: 'Aturan kotak (rule of the square)',
    summary: 'Hitung apakah raja sempat mengejar bidak lewat.',
    body: [
      'Jika tidak ada bidak lain yang menghalangi, kamu bisa tahu apakah raja bisa menghentikan bidak lewat tanpa menghitung langkah satu per satu. Bayangkan kotak yang berisi bidak di salah satu sudutnya dan sisinya selebar jumlah langkah bidak menuju promosi ditambah satu kotak (mis. bidak a5 butuh 3 langkah, jadi kotaknya a5 sampai d5 dan a8 sampai d8). Bila raja pembela berada di dalam kotak itu (saat gilirannya), ia bisa menangkap bidak.',
      'Bila raja berada di luar kotak, bidak lolos dan menjadi ratu. Jangan lupa bidak yang masih di baris kedua boleh maju dua kotak, sehingga kotaknya dihitung dari baris ketiga.',
      'Aturan ini cepat, praktis, dan sering menentukan apakah kamu harus bertukar menuju endgame bidak atau tidak.',
    ],
    points: [
      'Hitung jarak bidak ke baris promosi, lalu bayangkan kotaknya.',
      'Yang berjalan lebih dulu ikut menentukan hasil: periksa siapa jalan.',
      'Bidak di baris kedua dihitung dari baris ketiga.',
    ],
    demo: {
      fen: '8/8/8/5k2/P7/8/8/K7 w - - 0 1',
      intro: 'Bidak a4 butuh empat langkah ke a8. Raja Hitam di f5 tampak dekat, tetapi apakah ia di dalam kotak?',
      hint: ['a4', 'a8', 'e4', 'e8', 'f5'],
      steps: [
        { san: 'a5', note: 'Bidak maju. Kotak bidak sekarang: dari a5 ke d5 dan d8. Raja f5 di luar kotak (kolom f).', hint: ['a5', 'd5', 'd8'] },
        { san: 'Ke6', note: 'Raja berlari, tetapi masih di luar kotak.', hint: ['e6'] },
        { san: 'a6', note: 'Bidak maju lagi.', hint: ['a6'] },
        { san: 'Kd7', note: 'Raja mencoba mengejar.', hint: ['d7'] },
        { san: 'a7', note: 'Bidak sudah satu langkah dari promosi.', hint: ['a7'] },
        { san: 'Kc7', note: 'Raja sudah terlambat: ia tidak bisa memakan a7 maupun menghalangi a8.', hint: ['c7'] },
        { san: 'a8=Q', note: 'Bidak berubah menjadi ratu. Kesimpulan: raja di luar kotak berarti bidak lolos.', hint: ['a8'] },
      ],
    },
  },
  {
    id: 'mat-ratu',
    category: 'endgame',
    title: 'Mat dengan raja dan ratu',
    summary: 'Teknik paling dasar yang harus bisa dilakukan tanpa pat.',
    body: [
      'Raja dan ratu melawan raja adalah kemenangan paksa. Caranya: gunakan ratu untuk mengurung raja lawan di tepi papan dengan jarak lompatan kuda dari raja lawan (satu kotak jauhnya secara "L", sehingga ia tidak bisa mendekat), lalu dekatkan raja sendiri untuk mendukung ratu.',
      'Saat raja lawan terkurung di tepi dan rajamu sudah dekat, ratu memberi skak yang dilindungi rajamu: skakmat. Bahaya terbesar adalah pat: jangan membuat langkah yang mengambil seluruh kotak raja lawan bila ia tidak sedang skak.',
      'Setiap langkah, tanya: "Apakah lawan masih punya langkah legal?" Bila jawabannya tidak dan tidak sedang skak, ubah langkahmu.',
    ],
    points: [
      'Kurung raja lawan dengan ratu di jarak kuda.',
      'Dekatkan raja sendiri sebelum memberi skakmat.',
      'Selalu periksa pat sebelum langkah.',
    ],
    demo: {
      fen: '7k/8/5K2/8/8/8/8/6Q1 w - - 0 1',
      intro: 'Raja Putih di f6 sudah dekat; ratu di g1. Hitam di h8.',
      hint: ['f6', 'g1', 'h8'],
      expectMate: true,
      steps: [
        { san: 'Qg7#', note: 'Skakmat! Ratu g7 dijaga raja f6; g8 dan h7 ditutup ratu. Raja Hitam tidak punya kotak bebas dan tidak bisa memakan ratu yang dijaga.', hint: ['g7', 'g8', 'h7'] },
      ],
    },
  },
  {
    id: 'mat-benteng',
    category: 'endgame',
    title: 'Mat dengan raja dan benteng',
    summary: 'Gunakan oposisi dan benteng untuk mendorong raja lawan ke tepi.',
    body: [
      'Dengan raja dan benteng melawan raja, kemenangan juga paksa, tetapi butuh lebih banyak langkah daripada dengan ratu. Strateginya: gunakan benteng untuk memotong raja lawan dari bagian papan, dekatkan rajamu, ambil oposisi, lalu beri skak benteng di tepi.',
      'Pola akhirnya: raja di kotak yang menjaga ruang di depan raja lawan (di kolom sebelah kotak raja lawan, sehingga kotak-kotak pelariannya tertutup), dan benteng memberi skak di baris atau kolom tepi. Raja lawan tidak punya kotak lari karena semua dijaga raja atau benteng.',
      'Latihan ini terlihat sederhana, tetapi sering menentukan partai saat kamu hanya punya benteng lebih. Latih sampai bisa dilakukan tanpa berpikir.',
    ],
    points: [
      'Benteng memotong; raja mendekat; oposisi memaksa raja mundur.',
      'Beri skak benteng hanya bila raja sendiri sudah menutup kotak pelarian.',
      'Hindari pat saat raja lawan terkurung di sudut.',
    ],
    demo: {
      fen: '7k/8/6K1/8/8/8/8/R7 w - - 0 1',
      intro: 'Raja Putih g6 menguasai g7 dan h7. Raja Hitam di h8. Benteng a1.',
      hint: ['g6', 'h8', 'a1'],
      expectMate: true,
      steps: [
        { san: 'Ra8#', note: 'Skakmat! Benteng memberi skak di baris kedelapan; kotak g7 dan h7 dijaga raja g6, g8 dijaga benteng.', hint: ['a8', 'g8', 'g7', 'h7'] },
      ],
    },
  },

  /* ------------------------------------------------------------- POLA MAT */
  {
    id: 'mat-tangga',
    category: 'mat',
    title: 'Mat tangga (dua benteng)',
    summary: 'Dua benteng bergantian memotong dan memberi skak: mudah dan pasti.',
    body: [
      'Dua benteng bisa mengurung raja lawan baris demi baris, seperti anak tangga: satu benteng memotong satu baris, benteng kedua memberi skak di baris berikutnya, lalu bergantian sampai raja terkurung di tepi.',
      'Pola ini mudah dan pasti. Syarat penting: raja lawan tidak boleh bisa memakan salah satu benteng, dan jangan membuat pat.',
      'Gagasan ini juga berlaku pada ratu dan benteng, dan itulah mengapa dua benteng yang terhubung dianggap sangat kuat di endgame.',
    ],
    points: [
      'Satu benteng memotong, satu memberi skak.',
      'Jaga jarak agar raja lawan tidak bisa memakan benteng.',
      'Gunakan baris atau kolom tepi sebagai tembok.',
    ],
    demo: {
      fen: '6k1/8/8/8/8/8/R7/1R4K1 w - - 0 1',
      intro: 'Dua benteng Putih melawan raja Hitam di baris kedelapan.',
      hint: ['a2', 'b1', 'g8'],
      expectMate: true,
      steps: [
        { san: 'Ra7', note: 'Benteng pertama memotong baris ketujuh: raja Hitam terkurung di baris kedelapan.', hint: ['a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7'] },
        { san: 'Kh8', note: 'Raja Hitam hanya bisa bergerak di baris kedelapan.', hint: ['h8'] },
        { san: 'Rb8#', note: 'Benteng kedua memberi skak di baris kedelapan; baris ketujuh dikontrol benteng pertama. Skakmat.', hint: ['b8', 'h8'] },
      ],
    },
  },
  {
    id: 'scholar-mate',
    category: 'mat',
    title: "Scholar's Mate",
    summary: 'Skakmat 4 langkah pada f7. Mengenali dan menghentikannya.',
    body: [
      "Scholar's Mate adalah skakmat tercepat yang masih realistis: ratu dan gajah menyerang f7 yang hanya dijaga raja. Mudah dihentikan, tetapi sering berhasil di level pemula.",
      'Pertahanan: setelah 2.Bc4, jangan abaikan f7. Setelah Qh5, jangan bermain ...Nf6 yang diikuti Qxf7# tanpa cek lebih dulu. Cara aman: ...Nc6 dan ...g6 (menyerang ratu), atau ...Qe7.',
      'Bila kamu melakukannya, ingat bahwa lawan yang waspada akan membalas dengan serangan balik terhadap ratumu yang keluar terlalu dini.',
    ],
    points: [
      'Titik lemah awal: f7 (Hitam) dan f2 (Putih).',
      'Jaga f7 dengan ratu (…Qe7), kuda (…Nh6), atau usir ratu dengan …g6 sebelum Putih menyerangnya dua kali.',
      'Ratu yang keluar terlalu dini bisa diserang dan kehilangan tempo.',
    ],
    demo: {
      intro: 'Contoh Scholar\'s Mate bila Hitam lengah.',
      expectMate: true,
      steps: [
        { san: 'e4', note: 'Membuka jalur ratu dan gajah.', hint: ['e4'] },
        { san: 'e5', note: 'Balasan wajar.', hint: ['e5'] },
        { san: 'Bc4', note: 'Gajah menargetkan f7.', hint: ['c4', 'f7'] },
        { san: 'Nc6', note: 'Hitam mengembangkan kuda, tetapi belum menjaga f7.', hint: ['c6'] },
        { san: 'Qh5', note: 'Ratu dan gajah kini menyerang f7 dua kali (dan ratu menyerang e5).', hint: ['h5', 'f7'] },
        { san: 'Nf6', note: 'Hitam salah: kuda menyerang ratu h5 tetapi melupakan f7, yang kini diserang dua kali. Jawaban aman: ...g6 (mengusir ratu) atau ...Qe7.', hint: ['f6'] },
        { san: 'Qxf7#', note: 'Skakmat! f7 dijaga gajah c4 sehingga raja tidak bisa memakan ratu, dan tidak ada kotak pelarian.', hint: ['f7', 'e8'] },
      ],
    },
  },
];

export interface GlossaryEntry {
  term: string;
  en?: string;
  def: string;
}

export const GLOSSARY: GlossaryEntry[] = [
  { term: 'Skak', en: 'Check', def: 'Raja sedang diserang dan harus keluar dari serangan itu pada langkah berikutnya.' },
  { term: 'Skakmat', en: 'Checkmate', def: 'Raja diserang dan tidak ada cara lolos. Pemain yang melakukannya menang.' },
  { term: 'Pat', en: 'Stalemate', def: 'Pemain yang jalan tidak punya langkah legal tetapi rajanya tidak sedang skak. Hasilnya remis.' },
  { term: 'Remis', en: 'Draw', def: 'Partai seri: kesepakatan, pengulangan tiga kali, aturan 50 langkah, pat, atau material tidak cukup.' },
  { term: 'Rokade', en: 'Castling', def: 'Langkah khusus raja dan benteng sekaligus untuk mengamankan raja dan mengaktifkan benteng.' },
  { term: 'En passant', en: 'En passant', def: 'Pemakanan khusus bidak: bidak yang maju dua kotak dan melewati bidak lawan di kolom tetangga bisa dimakan seolah maju satu kotak, hanya pada langkah berikutnya.' },
  { term: 'Promosi', en: 'Promotion', def: 'Bidak yang mencapai baris terakhir berubah menjadi ratu, benteng, gajah, atau kuda.' },
  { term: 'Gambit', en: 'Gambit', def: 'Pengorbanan bidak di opening demi perkembangan, pusat, atau inisiatif.' },
  { term: 'Tempo', en: 'Tempo', def: 'Satu langkah. Kehilangan tempo berarti membuang satu langkah; memenangkan tempo berarti memaksa lawan membuang satu langkah.' },
  { term: 'Inisiatif', en: 'Initiative', def: 'Kemampuan memaksa lawan menjawab ancamanmu sehingga ia tidak sempat menjalankan rencananya.' },
  { term: 'Pengembangan', en: 'Development', def: 'Memindahkan bidak ringan dari barisan awal ke kotak aktif.' },
  { term: 'Pusat', en: 'Center', def: 'Empat kotak tengah (d4, e4, d5, e5), serta kotak sekitarnya. Menguasainya memberi ruang gerak.' },
  { term: 'Kolom', en: 'File', def: 'Garis vertikal papan, diberi huruf a sampai h.' },
  { term: 'Baris', en: 'Rank', def: 'Garis horizontal papan, diberi angka 1 sampai 8.' },
  { term: 'Kolom terbuka', en: 'Open file', def: 'Kolom tanpa bidak. Tempat ideal bagi benteng dan ratu.' },
  { term: 'Kolom semi-terbuka', en: 'Half-open file', def: 'Kolom yang tidak berisi bidak salah satu pihak; pihak itu bisa menekan bidak lawan di kolom tersebut.' },
  { term: 'Baris ketujuh', en: 'Seventh rank', def: 'Baris kedua lawan. Benteng di sana menyerang bidak yang belum bergerak dan menjepit raja.' },
  { term: 'Garpu', en: 'Fork', def: 'Satu bidak menyerang dua target atau lebih sekaligus.' },
  { term: 'Pin', en: 'Pin', def: 'Bidak tidak bisa (atau tidak boleh) bergerak karena membuka bidak yang lebih berharga di belakangnya.' },
  { term: 'Skewer', en: 'Skewer', def: 'Menyerang bidak berharga di depan sehingga ia pindah dan bidak di belakangnya bisa dimakan.' },
  { term: 'Serangan tersingkap', en: 'Discovered attack', def: 'Bidak yang bergerak membuka garis serang bidak lain di belakangnya.' },
  { term: 'Skak ganda', en: 'Double check', def: 'Dua bidak memberi skak sekaligus; satu-satunya jawaban adalah memindahkan raja.' },
  { term: 'Mat lorong', en: 'Back-rank mate', def: 'Skakmat di baris terakhir pada raja yang terkurung bidaknya sendiri.' },
  { term: 'Luft', en: 'Luft', def: 'Kotak pelarian yang disediakan untuk raja (misalnya dengan menggerakkan bidak h).' },
  { term: 'Zugzwang', en: 'Zugzwang', def: 'Posisi di mana setiap langkah pemain yang jalan memperburuk posisinya; ia lebih baik bila boleh melewatkan giliran.' },
  { term: 'Oposisi', en: 'Opposition', def: 'Dua raja berhadapan dengan satu kotak di antaranya; pihak yang tidak harus melangkah memegang oposisi.' },
  { term: 'Kotak kunci', en: 'Key square', def: 'Kotak yang bila diduduki raja menjamin bidak bisa dipromosikan.' },
  { term: 'Bidak lewat', en: 'Passed pawn', def: 'Bidak tanpa bidak lawan di kolom yang sama atau kolom tetangga di depannya.' },
  { term: 'Bidak terisolasi', en: 'Isolated pawn', def: 'Bidak tanpa bidak teman di kolom tetangga.' },
  { term: 'Bidak ganda', en: 'Doubled pawns', def: 'Dua bidak sewarna di kolom yang sama.' },
  { term: 'Bidak terbelakang', en: 'Backward pawn', def: 'Bidak yang tertinggal dari bidak tetangga dan tidak bisa maju dengan aman.' },
  { term: 'Rantai bidak', en: 'Pawn chain', def: 'Barisan bidak yang saling melindungi secara diagonal.' },
  { term: 'Outpost', en: 'Outpost', def: 'Kotak di wilayah lawan yang tidak bisa diserang bidak lawan; tempat ideal bagi kuda.' },
  { term: 'Pasangan gajah', en: 'Bishop pair', def: 'Memiliki kedua gajah (satu kotak terang, satu kotak gelap).' },
  { term: 'Fianchetto', en: 'Fianchetto', def: 'Mengembangkan gajah ke b2/g2 atau b7/g7 setelah memajukan bidak b atau g.' },
  { term: 'Kualitas', en: 'The exchange', def: 'Selisih nilai benteng dan bidak ringan. Memenangkan kualitas berarti memakan benteng dengan bidak ringan.' },
  { term: 'Profilaksis', en: 'Prophylaxis', def: 'Langkah untuk mencegah rencana atau ancaman lawan sebelum terjadi.' },
  { term: 'Kompensasi', en: 'Compensation', def: 'Keunggulan posisi (inisiatif, serangan, pasangan gajah) yang mengganti material yang dikorbankan.' },
  { term: 'Serangan minoritas', en: 'Minority attack', def: 'Mendorong bidak (mis. b4-b5) melawan lebih banyak bidak lawan untuk menciptakan kelemahan, khas struktur Carlsbad.' },
  { term: 'Tukar-menukar', en: 'Exchange / Trade', def: 'Menukar bidak yang bernilai setara. Berguna saat unggul material.' },
  { term: 'Zwischenzug', en: 'Intermezzo', def: 'Langkah sela yang mengganggu urutan yang diharapkan, biasanya dengan skak atau ancaman.' },
  { term: 'Hypermodern', en: 'Hypermodern', def: 'Gaya bermain yang mengontrol pusat dari jauh, lalu menyerangnya, bukan menduduki dengan bidak.' },
  { term: 'Tempo hilang', en: 'Loss of tempo', def: 'Memindahkan bidak yang sama berulang atau mundur sehingga lawan mendapat langkah gratis.' },
  { term: 'Pengorbanan', en: 'Sacrifice', def: 'Menyerahkan material secara sadar untuk keuntungan posisi atau serangan.' },
  { term: 'Eval / Evaluasi', en: 'Evaluation', def: 'Penilaian posisi, biasanya dalam satuan bidak (+1.0 berarti unggul satu bidak).' },
];
