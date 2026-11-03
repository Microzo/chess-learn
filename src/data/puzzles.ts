/**
 * Latihan taktik. Pemain menemukan langkah pertama (dan lanjutan) dari sisi yang jalan.
 * Setiap puzzle divalidasi tests/puzzles (legal, SAN kanonik, mat bila `mate`) dan diperiksa dengan Stockfish.
 */

export interface Puzzle {
  id: string;
  theme: string;
  title: string;
  /** langkah dari posisi awal sebelum puzzle dimulai (alternatif dari `fen`) */
  setup?: string[];
  fen?: string;
  /** urutan langkah SAN: indeks genap = pemain, ganjil = balasan lawan */
  solution: string[];
  /** langkah pertama lain yang juga benar (puzzle langsung selesai) */
  alts?: string[];
  hint: string;
  explanation: string;
}

export const PUZZLES: Puzzle[] = [
  {
    id: 'skakmat-1-ratu',
    theme: 'Skakmat',
    title: 'Skakmat dengan ratu',
    fen: '7k/8/5K2/8/8/8/8/6Q1 w - - 0 1',
    solution: ['Qg7#'],
    hint: 'Ratu harus memberi skak di kotak yang dijaga rajamu.',
    explanation: 'Qg7# : ratu dijaga raja f6, kotak g8 dan h7 tertutup, sehingga raja Hitam tidak bisa lari maupun memakan ratu.',
  },
  {
    id: 'skakmat-1-benteng',
    theme: 'Skakmat',
    title: 'Skakmat dengan benteng',
    fen: '7k/8/6K1/8/8/8/8/R7 w - - 0 1',
    solution: ['Ra8#'],
    hint: 'Raja Putih sudah menjaga g7 dan h7. Tinggal skak di baris kedelapan.',
    explanation: 'Ra8# : benteng memberi skak di baris kedelapan, raja g6 menjaga g7 dan h7, sehingga tidak ada kotak lari.',
  },
  {
    id: 'mat-lorong-1',
    theme: 'Mat lorong',
    title: 'Raja terkurung bidaknya sendiri',
    fen: '6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1',
    solution: ['Rd8#'],
    hint: 'Raja Hitam tidak punya luft. Cari skak di baris terakhir.',
    explanation: 'Rd8# : tiga bidak Hitam menutup kotak pelarian raja sendiri. Selalu beri raja luft (h3 atau h6) sebelum terlambat.',
  },
  {
    id: 'mat-pengap',
    theme: 'Skakmat',
    title: 'Mat pengap (smothered mate)',
    fen: '6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1',
    solution: ['Nf7#'],
    hint: 'Raja Hitam dikelilingi buahnya sendiri. Satu-satunya yang bisa menyerangnya adalah lompatan kuda.',
    explanation: 'Nf7# : raja h8 terkepung benteng g8 dan bidak g7, h7 miliknya sendiri; kuda memberi skak dan tidak bisa dimakan.',
  },
  {
    id: 'scholar',
    theme: 'Skakmat',
    title: "Scholar's Mate",
    setup: ['e4', 'e5', 'Bc4', 'Nc6', 'Qh5', 'Nf6'],
    solution: ['Qxf7#'],
    hint: 'Titik lemah Hitam di awal permainan adalah f7.',
    explanation: 'Qxf7# : f7 diserang ratu dan gajah, dan hanya dijaga raja. Gajah c4 melindungi ratu sehingga raja tidak bisa memakannya.',
  },
  {
    id: 'fools-mate',
    theme: 'Skakmat',
    title: "Fool's Mate",
    setup: ['f3', 'e5', 'g4'],
    solution: ['Qh4#'],
    hint: 'Diagonal menuju raja Putih terbuka lebar.',
    explanation: 'Qh4# : Putih membuka diagonal e1-h4 dengan f3 dan g4. Skakmat tercepat dalam catur: hanya dua langkah Hitam.',
  },
  {
    id: 'mat-tangga-2',
    theme: 'Skakmat',
    title: 'Mat tangga dengan dua benteng',
    fen: '6k1/8/8/8/8/8/R7/1R4K1 w - - 0 1',
    solution: ['Ra7', 'Kh8', 'Rb8#'],
    hint: 'Kurung raja di baris kedelapan dengan satu benteng, lalu skak dengan benteng lain.',
    explanation: 'Ra7 memotong baris ketujuh sehingga raja terkurung di baris kedelapan; Rb8# lalu memberi skak yang tidak bisa dihindari.',
  },
  {
    id: 'garpu-kuda',
    theme: 'Garpu',
    title: 'Garpu kuda',
    fen: '3k3r/8/8/6N1/8/8/PPP5/4K3 w - - 0 1',
    solution: ['Nf7+', 'Ke7', 'Nxh8'],
    hint: 'Cari kotak yang menyerang raja dan benteng sekaligus.',
    explanation: 'Nf7+ menyerang raja d8 dan benteng h8 sekaligus. Raja harus bergerak, lalu kuda memakan benteng.',
  },
  {
    id: 'skewer-benteng',
    theme: 'Skewer',
    title: 'Tusuk-sate raja dan ratu',
    fen: '4q3/8/8/4k3/8/8/8/R5K1 w - - 0 1',
    solution: ['Re1+', 'Kf6', 'Rxe8'],
    hint: 'Raja dan ratu Hitam berada di kolom yang sama.',
    explanation: 'Re1+ memaksa raja pindah, dan ratu yang berada di belakangnya jatuh: Rxe8.',
  },
  {
    id: 'tersingkap-ratu',
    theme: 'Serangan tersingkap',
    title: 'Skak tersingkap memenangkan ratu',
    fen: '4k3/8/8/2q5/4N3/8/4R3/4K3 w - - 0 1',
    solution: ['Nxc5+', 'Kd8'],
    hint: 'Kuda berdiri di depan bentengmu. Apa yang terjadi bila ia pergi sambil memakan sesuatu?',
    explanation: 'Nxc5+ memakan ratu sekaligus membuka kolom e: benteng memberi skak. Hitam tidak sempat menyelamatkan ratunya.',
  },
  {
    id: 'pin-kuda',
    theme: 'Pin',
    title: 'Kuda yang terpin',
    fen: '4k3/4n3/8/8/1B6/8/4R3/4K3 w - - 0 1',
    solution: ['Rxe7+'],
    alts: ['Bxe7'],
    hint: 'Kuda e7 tidak bisa bergerak, dan ia diserang dua kali tetapi hanya dijaga satu kali.',
    explanation: 'Kuda e7 terpin pada raja oleh benteng. Rxe7+ (atau Bxe7) memakainya: raja tidak bisa memakan balik karena e7 dijaga buah Putih lainnya.',
  },
  {
    id: 'legal-mate',
    theme: 'Jebakan opening',
    title: "Legal's Mate",
    setup: ['e4', 'e5', 'Nf3', 'd6', 'Bc4', 'Bg4', 'Nc3', 'g6'],
    solution: ['Nxe5', 'Bxd1', 'Bxf7+', 'Ke7', 'Nd5#'],
    hint: 'Korbankan ratumu. Kalau Hitam memakannya, kamu punya skakmat dengan buah ringan.',
    explanation: 'Nxe5! mengumpan ratu. Bila Hitam serakah dengan Bxd1, maka Bxf7+ Ke7 Nd5# memberi skakmat dengan dua kuda dan satu gajah. Bila Hitam menolak umpan (…dxe5), Putih tetap baik, karena itu jebakan ini hanya ampuh melawan lawan yang tergoda.',
  },
];
