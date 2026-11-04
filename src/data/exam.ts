import type { ExamLevel } from '../core/storage/progress';

/**
 * Bank soal ujian per level. Soal pilihan ganda (dua bahasa) ditambah soal papan yang diambil dari puzzle.
 * Tes memastikan jawaban dalam jangkauan, tiap soal punya 4 pilihan, dan pelajaran tujuan ulasan ada.
 */
export type Pair = readonly [en: string, id: string];
export type Topic = 'basics' | 'openings' | 'tactics' | 'strategy' | 'endgames';

export interface McQuestion {
  id: string;
  level: ExamLevel;
  topic: Topic;
  /** pelajaran yang ditautkan untuk ulasan */
  lesson: string;
  q: Pair;
  options: readonly [Pair, Pair, Pair, Pair];
  answer: 0 | 1 | 2 | 3;
  why: Pair;
}

export const TOPIC_LABEL: Record<Topic, Pair> = {
  basics: ['Basics', 'Dasar'],
  openings: ['Openings', 'Opening'],
  tactics: ['Tactics', 'Taktik'],
  strategy: ['Strategy', 'Strategi'],
  endgames: ['Endgames', 'Endgame'],
};

export const LEVEL_LABEL: Record<ExamLevel, Pair> = {
  beginner: ['Beginner', 'Pemula'],
  intermediate: ['Intermediate', 'Menengah'],
  advanced: ['Advanced', 'Lanjut'],
};

/** Puzzle papan tiap level (langkah pertama dinilai). */
export const BOARD_QUESTIONS: Record<ExamLevel, string[]> = {
  beginner: ['skakmat-1-ratu', 'skakmat-1-benteng', 'mat-lorong-1', 'fools-mate'],
  intermediate: ['scholar', 'mat-tangga-2', 'garpu-kuda', 'pin-kuda'],
  advanced: ['mat-pengap', 'skewer-benteng', 'tersingkap-ratu', 'legal-mate'],
};

export const MC_PER_EXAM = 6;

export const MC_QUESTIONS: McQuestion[] = [
  // ------------------------------------------------------------ Pemula
  {
    id: 'b-values', level: 'beginner', topic: 'basics', lesson: 'nilai-bidak',
    q: ['In the standard scale, how many points is a rook worth?', 'Dalam skala standar, berapa nilai sebuah benteng?'],
    options: [['3', '3'], ['5', '5'], ['7', '7'], ['9', '9']], answer: 1,
    why: ['Pawn 1, knight 3, bishop 3, rook 5, queen 9.', 'Bidak 1, kuda 3, gajah 3, benteng 5, ratu 9.'],
  },
  {
    id: 'b-castling', level: 'beginner', topic: 'basics', lesson: 'rokade',
    q: ['Which of these is NOT a condition for castling?', 'Mana yang BUKAN syarat rokade?'],
    options: [
      ['The king has not moved', 'Raja belum pernah bergerak'],
      ['The rook has not moved', 'Benteng belum pernah bergerak'],
      ['The queen has been traded', 'Ratu sudah ditukar'],
      ['The king is not in check', 'Raja tidak sedang skak'],
    ], answer: 2,
    why: ['Castling needs an unmoved king and rook, free squares between them, and a king that is not in check or passing through attacked squares. The queen is irrelevant.', 'Rokade butuh raja dan benteng yang belum bergerak, petak kosong di antaranya, dan raja tidak skak atau melewati petak yang diserang. Ratu tidak berpengaruh.'],
  },
  {
    id: 'b-notation', level: 'beginner', topic: 'basics', lesson: 'notasi',
    q: ['What does the move "Nf3" mean?', 'Apa arti langkah "Nf3"?'],
    options: [
      ['A knight moves to f3', 'Kuda pindah ke f3'],
      ['A pawn moves to f3', 'Bidak pindah ke f3'],
      ['A bishop captures on f3', 'Gajah makan di f3'],
      ['The king castles', 'Raja rokade'],
    ], answer: 0,
    why: ['N is the knight (K is the king). Pawns have no letter.', 'N adalah kuda (K untuk raja). Bidak tidak diberi huruf.'],
  },
  {
    id: 'b-stalemate', level: 'beginner', topic: 'basics', lesson: 'menang-seri',
    q: ['The player to move has no legal move and is not in check. What is the result?', 'Pemain yang jalan tidak punya langkah legal dan tidak sedang skak. Hasilnya?'],
    options: [['A win for that player', 'Pemain itu menang'], ['A loss for that player', 'Pemain itu kalah'], ['A draw', 'Remis'], ['The move is skipped', 'Giliran dilewati']], answer: 2,
    why: ['That is stalemate, which is a draw.', 'Itu pat (stalemate), hasilnya remis.'],
  },
  {
    id: 'b-principles', level: 'beginner', topic: 'openings', lesson: 'prinsip-opening',
    q: ['Which is a sound opening principle?', 'Mana prinsip opening yang sehat?'],
    options: [
      ['Bring the queen out early to attack', 'Keluarkan ratu lebih awal untuk menyerang'],
      ['Move the same piece many times', 'Gerakkan bidak yang sama berkali-kali'],
      ['Push all the rook pawns first', 'Dorong semua bidak pinggir dulu'],
      ['Control the centre and develop your minor pieces', 'Kuasai pusat dan kembangkan bidak ringan'],
    ], answer: 3,
    why: ['Centre, development, then castle. An early queen is easily chased away.', 'Pusat, pengembangan, lalu rokade. Ratu yang keluar dini mudah diusir.'],
  },
  {
    id: 'b-fork', level: 'beginner', topic: 'tactics', lesson: 'garpu',
    q: ['What is a fork?', 'Apa itu garpu (fork)?'],
    options: [
      ['One piece attacks two or more targets at once', 'Satu bidak menyerang dua target atau lebih sekaligus'],
      ['Two pieces swap places', 'Dua bidak bertukar tempat'],
      ['A pawn reaches the last rank', 'Bidak mencapai baris terakhir'],
      ['A piece cannot move', 'Bidak tidak bisa bergerak'],
    ], answer: 0,
    why: ['The opponent can save only one of the targets. Knights are the classic forkers.', 'Lawan hanya bisa menyelamatkan satu target. Kuda adalah pelaku garpu klasik.'],
  },
  {
    id: 'b-backrank', level: 'beginner', topic: 'tactics', lesson: 'mat-lorong',
    q: ['How do you best guard against a back-rank mate?', 'Bagaimana cara terbaik mencegah mat lorong?'],
    options: [
      ['Give the king luft with a move such as h3', 'Beri raja luft dengan langkah seperti h3'],
      ['Move the queen to the corner', 'Pindahkan ratu ke sudut'],
      ['Trade all the pawns', 'Tukar semua bidak'],
      ['Never castle', 'Jangan pernah rokade'],
    ], answer: 0,
    why: ['A pawn move gives the king an escape square on the second rank.', 'Satu langkah bidak memberi raja petak pelarian.'],
  },
  {
    id: 'b-mate-symbol', level: 'beginner', topic: 'basics', lesson: 'notasi',
    q: ['What does "#" at the end of a move mean?', 'Apa arti "#" di akhir sebuah langkah?'],
    options: [['Check', 'Skak'], ['Capture', 'Makan'], ['Promotion', 'Promosi'], ['Checkmate', 'Skakmat']], answer: 3,
    why: ['+ is check, # is checkmate, x is a capture, = is promotion.', '+ untuk skak, # untuk skakmat, x untuk makan, = untuk promosi.'],
  },

  // ----------------------------------------------------------- Menengah
  {
    id: 'i-skewer', level: 'intermediate', topic: 'tactics', lesson: 'skewer',
    q: ['In a skewer, where is the more valuable piece?', 'Pada skewer, di mana bidak yang lebih berharga?'],
    options: [['In front, and it must move', 'Di depan, dan harus pindah'], ['Behind, and cannot move', 'Di belakang, dan tidak bisa pindah'], ['On the same file as a pawn', 'Satu kolom dengan bidak'], ['Off the board', 'Di luar papan']], answer: 0,
    why: ['A skewer is the opposite of a pin: the valuable piece in front moves away and the piece behind falls.', 'Skewer kebalikan pin: bidak berharga di depan pindah, lalu bidak di belakangnya jatuh.'],
  },
  {
    id: 'i-italian', level: 'intermediate', topic: 'openings', lesson: 'italian',
    q: ['After 1.e4 e5 2.Nf3 Nc6, which move makes it the Italian Game?', 'Setelah 1.e4 e5 2.Nf3 Nc6, langkah mana yang menjadikannya Italian Game?'],
    options: [['3.Bb5', '3.Bb5'], ['3.Bc4', '3.Bc4'], ['3.d4', '3.d4'], ['3.Nc3', '3.Nc3']], answer: 1,
    why: ['3.Bb5 is the Ruy Lopez, 3.d4 the Scotch. The Italian has the bishop on c4 eyeing f7.', '3.Bb5 adalah Ruy Lopez, 3.d4 Scotch. Italian memakai gajah di c4 yang mengincar f7.'],
  },
  {
    id: 'i-double-check', level: 'intermediate', topic: 'tactics', lesson: 'tersingkap',
    q: ['What is the only way to answer a double check?', 'Apa satu-satunya cara menjawab skak ganda?'],
    options: [['Capture the checking piece', 'Makan bidak yang skak'], ['Block the check', 'Halangi skak'], ['Move the king', 'Pindahkan raja'], ['Castle', 'Rokade']], answer: 2,
    why: ['Two pieces give check at once, so blocking or capturing cannot answer both.', 'Dua bidak memberi skak sekaligus, jadi menghalangi atau memakan tidak bisa menjawab keduanya.'],
  },
  {
    id: 'i-isolated', level: 'intermediate', topic: 'strategy', lesson: 'struktur-bidak',
    q: ['What is an isolated pawn?', 'Apa itu bidak terisolasi?'],
    options: [['A pawn with no friendly pawn on a neighbouring file', 'Bidak tanpa bidak teman di kolom tetangga'], ['A pawn that has reached the 7th rank', 'Bidak yang mencapai baris ketujuh'], ['Two pawns on the same file', 'Dua bidak di kolom yang sama'], ['A pawn on the edge', 'Bidak di tepi papan']], answer: 0,
    why: ['It cannot be defended by pawns, so pieces must guard it.', 'Bidak itu tidak bisa dijaga bidak lain, sehingga harus dijaga buah.'],
  },
  {
    id: 'i-outpost', level: 'intermediate', topic: 'strategy', lesson: 'outpost',
    q: ['What makes a square a good outpost for a knight?', 'Apa yang membuat sebuah petak menjadi outpost yang baik bagi kuda?'],
    options: [['It is in the corner', 'Berada di sudut'], ['It is supported and no enemy pawn can attack it', 'Didukung dan tidak bisa diserang bidak lawan'], ['It is on the edge of the board', 'Di tepi papan'], ['It attacks the opponent\'s king', 'Menyerang raja lawan']], answer: 1,
    why: ['A knight that cannot be chased away by pawns can dominate the position.', 'Kuda yang tidak bisa diusir bidak bisa mendominasi posisi.'],
  },
  {
    id: 'i-qg', level: 'intermediate', topic: 'openings', lesson: 'queens-gambit',
    q: ['Which opening begins 1.d4 d5 2.c4?', 'Opening mana yang dimulai 1.d4 d5 2.c4?'],
    options: [['Sicilian Defence', 'Sicilian Defence'], ['English Opening', 'English Opening'], ['Queen\'s Gambit', 'Queen\'s Gambit'], ['French Defence', 'French Defence']], answer: 2,
    why: ['White offers a wing pawn to pull Black\'s d-pawn away from the centre.', 'Putih menawarkan bidak sayap untuk menarik bidak d Hitam dari pusat.'],
  },
  {
    id: 'i-tarrasch', level: 'intermediate', topic: 'endgames', lesson: 'endgame-prinsip',
    q: ['Where should a rook usually stand relative to a passed pawn?', 'Di mana sebaiknya benteng berdiri terhadap bidak lewat?'],
    options: [['In front of it', 'Di depannya'], ['Behind it', 'Di belakangnya'], ['Next to the king', 'Di samping raja'], ['It does not matter', 'Tidak penting']], answer: 1,
    why: ['The Tarrasch rule: rooks belong behind passed pawns, yours or your opponent\'s.', 'Aturan Tarrasch: benteng di belakang bidak lewat, milikmu maupun lawan.'],
  },
  {
    id: 'i-bishops', level: 'intermediate', topic: 'strategy', lesson: 'pasangan-gajah',
    q: ['In which kind of position are bishops usually stronger than knights?', 'Pada posisi seperti apa gajah biasanya lebih kuat daripada kuda?'],
    options: [['Closed positions', 'Posisi tertutup'], ['Open positions with pawns on both wings', 'Posisi terbuka dengan bidak di dua sayap'], ['When all the pawns are gone', 'Saat semua bidak habis'], ['Only in the opening', 'Hanya di opening']], answer: 1,
    why: ['Long-range bishops thrive on open lines; knights prefer closed positions with outposts.', 'Gajah berjangkauan jauh unggul di garis terbuka; kuda lebih suka posisi tertutup dengan outpost.'],
  },

  // -------------------------------------------------------------- Lanjut
  {
    id: 'a-opposition', level: 'advanced', topic: 'endgames', lesson: 'oposisi',
    q: ['Two kings face each other with one square between them. Who holds the opposition?', 'Dua raja berhadapan dengan satu petak di antaranya. Siapa yang memegang oposisi?'],
    options: [['The side to move', 'Pihak yang harus melangkah'], ['The side that does not have to move', 'Pihak yang tidak harus melangkah'], ['The side with more pawns', 'Pihak dengan bidak lebih banyak'], ['White, always', 'Selalu Putih']], answer: 1,
    why: ['The player who has to move must give way. Opposition comes from zugzwang.', 'Pemain yang harus melangkah harus mengalah. Oposisi lahir dari zugzwang.'],
  },
  {
    id: 'a-square', level: 'advanced', topic: 'endgames', lesson: 'aturan-kotak',
    q: ['What does the rule of the square tell you?', 'Apa yang ditunjukkan aturan kotak?'],
    options: [['Whether a king can catch a passed pawn', 'Apakah raja sempat menangkap bidak lewat'], ['Which side has more space', 'Pihak mana yang punya ruang lebih'], ['How many moves to checkmate', 'Berapa langkah menuju skakmat'], ['Which squares a knight reaches', 'Petak mana yang dijangkau kuda']], answer: 0,
    why: ['If the defending king is inside the pawn\'s square (on its turn), it catches the pawn.', 'Jika raja pembela berada di dalam kotak bidak (saat gilirannya), ia dapat menangkap bidak.'],
  },
  {
    id: 'a-lucena', level: 'advanced', topic: 'endgames', lesson: 'lucena',
    q: ['In the Lucena position, what must the stronger side\'s rook accomplish?', 'Pada posisi Lucena, apa yang harus dicapai benteng pihak yang lebih kuat?'],
    options: [['Cut off the enemy king and shield its own king from side checks', 'Memotong raja lawan dan melindungi rajanya dari skak samping'], ['Sacrifice itself for the pawn', 'Berkorban demi bidak'], ['Stay passively on the first rank', 'Diam pasif di baris pertama'], ['Trade rooks at once', 'Langsung menukar benteng']], answer: 0,
    why: ['Once the king is shielded from checks it can step out and the pawn promotes.', 'Setelah raja terlindung dari skak, ia bisa keluar dan bidak berpromosi.'],
  },
  {
    id: 'a-philidor', level: 'advanced', topic: 'endgames', lesson: 'philidor',
    q: ['In the Philidor defence, where does the defending rook stand until the pawn reaches the sixth rank?', 'Pada pertahanan Philidor, di mana benteng bertahan berdiri sampai bidak mencapai baris keenam?'],
    options: [['On the sixth rank (the third from its own side)', 'Di baris keenam (ketiga dari sisinya)'], ['On the back rank', 'Di baris terakhir'], ['In front of the pawn', 'Di depan bidak'], ['In the corner', 'Di sudut']], answer: 0,
    why: ['It stops the enemy king advancing. When the pawn advances it switches to checks from behind.', 'Ia menahan raja lawan maju. Saat bidak maju, benteng pindah memberi skak dari belakang.'],
  },
  {
    id: 'a-zugzwang', level: 'advanced', topic: 'strategy', lesson: 'oposisi',
    q: ['What is zugzwang?', 'Apa itu zugzwang?'],
    options: [['A forced checkmate in two', 'Skakmat paksa dalam dua langkah'], ['A position where every move worsens the mover\'s position', 'Posisi di mana setiap langkah memperburuk pemain yang jalan'], ['A pawn sacrifice in the opening', 'Pengorbanan bidak di opening'], ['A drawn endgame', 'Endgame seri']], answer: 1,
    why: ['The side to move would prefer to pass but cannot.', 'Pihak yang jalan lebih suka melewatkan giliran, tetapi tidak bisa.'],
  },
  {
    id: 'a-hypermodern', level: 'advanced', topic: 'openings', lesson: 'kings-indian',
    q: ['What is the idea of hypermodern defences such as the King\'s Indian?', 'Apa gagasan pertahanan hypermodern seperti King\'s Indian?'],
    options: [['Occupy the centre with pawns at once', 'Segera menduduki pusat dengan bidak'], ['Avoid the centre completely', 'Menghindari pusat sama sekali'], ['Control the centre from a distance, then attack it', 'Mengontrol pusat dari jauh, lalu menyerangnya'], ['Trade queens early', 'Menukar ratu lebih awal']], answer: 2,
    why: ['Black lets White build a big centre and then undermines it with ...e5 or ...c5.', 'Hitam membiarkan Putih membangun pusat besar lalu menggerogotinya dengan ...e5 atau ...c5.'],
  },
  {
    id: 'a-prophylaxis', level: 'advanced', topic: 'strategy', lesson: 'rencana',
    q: ['What is prophylaxis?', 'Apa itu profilaksis?'],
    options: [['A move that prevents the opponent\'s plan before it happens', 'Langkah yang mencegah rencana lawan sebelum terjadi'], ['A sacrifice for the attack', 'Pengorbanan demi serangan'], ['Trading into an endgame', 'Menukar menuju endgame'], ['Castling on opposite sides', 'Rokade di sisi berlawanan']], answer: 0,
    why: ['Ask "what does my opponent want?" and stop it first.', 'Tanyakan "apa yang diinginkan lawan?" dan hentikan itu lebih dulu.'],
  },
  {
    id: 'a-knight-draw', level: 'advanced', topic: 'basics', lesson: 'menang-seri',
    q: ['King and a single knight against a lone king: what is the result?', 'Raja dan satu kuda melawan raja sendiri: apa hasilnya?'],
    options: [['White wins by force', 'Putih menang paksa'], ['A draw: not enough material to checkmate', 'Remis: material tidak cukup untuk skakmat'], ['It depends on who is to move', 'Tergantung siapa yang jalan'], ['Black wins', 'Hitam menang']], answer: 1,
    why: ['A king with one minor piece cannot force mate, so the game is drawn by insufficient material.', 'Raja dengan satu bidak ringan tidak bisa memaksa mat, jadi partai remis karena material tidak cukup.'],
  },
  {
    id: 'b-short-castle', level: 'beginner', topic: 'basics', lesson: 'rokade',
    q: ['How is short (kingside) castling written?', 'Bagaimana rokade pendek (sisi raja) ditulis?'],
    options: [['O-O-O', 'O-O-O'], ['O-O', 'O-O'], ['0-1', '0-1'], ['Kg1R', 'Kg1R']], answer: 1,
    why: ['O-O is short castling, O-O-O is long castling.', 'O-O adalah rokade pendek, O-O-O rokade panjang.'],
  },
  {
    id: 'b-scan', level: 'beginner', topic: 'tactics', lesson: 'cek-tiga',
    q: ['Which three things should you scan before every move?', 'Tiga hal apa yang diperiksa sebelum setiap langkah?'],
    options: [['Pawns, files, ranks', 'Bidak, kolom, baris'], ['Checks, captures, threats', 'Skak, tangkap, ancam'], ['Time, clock, score', 'Waktu, jam, skor'], ['Queen, king, rook', 'Ratu, raja, benteng']], answer: 1,
    why: ['Most beginner mistakes are tactical: look at checks, captures and threats for both sides.', 'Kebanyakan kesalahan pemula bersifat taktis: periksa skak, tangkap, dan ancaman kedua pihak.'],
  },
  {
    id: 'b-minor-value', level: 'beginner', topic: 'basics', lesson: 'nilai-bidak',
    q: ['A knight and a bishop are each worth about…', 'Kuda dan gajah masing-masing bernilai sekitar…'],
    options: [['1 point', '1 poin'], ['2 points', '2 poin'], ['3 points', '3 poin'], ['5 points', '5 poin']], answer: 2,
    why: ['Both are minor pieces worth about three pawns.', 'Keduanya bidak ringan yang bernilai sekitar tiga bidak.'],
  },
  {
    id: 'b-not-draw', level: 'beginner', topic: 'basics', lesson: 'menang-seri',
    q: ['Which of these does NOT make a game drawn?', 'Mana yang TIDAK membuat partai remis?'],
    options: [['Threefold repetition', 'Pengulangan posisi tiga kali'], ['Stalemate', 'Pat'], ['50 moves without a pawn move or capture', '50 langkah tanpa gerakan bidak atau penangkapan'], ['Losing your queen', 'Kehilangan ratu']], answer: 3,
    why: ['Losing a queen is bad but the game goes on.', 'Kehilangan ratu memang buruk, tetapi partai terus berjalan.'],
  },
  {
    id: 'i-abs-pin', level: 'intermediate', topic: 'tactics', lesson: 'pin',
    q: ['An absolute pin is a pin against which piece?', 'Pin mutlak adalah pin terhadap bidak apa?'],
    options: [['The queen', 'Ratu'], ['A rook', 'Benteng'], ['The king', 'Raja'], ['A pawn', 'Bidak']], answer: 2,
    why: ['The pinned piece may not move at all, because that would put its own king in check.', 'Bidak yang terpin sama sekali tidak boleh bergerak karena akan membuat rajanya skak.'],
  },
  {
    id: 'i-ruy', level: 'intermediate', topic: 'openings', lesson: 'ruy-lopez',
    q: ['Which opening begins 1.e4 e5 2.Nf3 Nc6 3.Bb5?', 'Opening mana yang dimulai 1.e4 e5 2.Nf3 Nc6 3.Bb5?'],
    options: [['Ruy Lopez', 'Ruy Lopez'], ['Italian Game', 'Italian Game'], ['Scotch Game', 'Scotch Game'], ['French Defence', 'French Defence']], answer: 0,
    why: ['The bishop pressures the c6 knight, the defender of e5.', 'Gajah menekan kuda c6, penjaga e5.'],
  },
  {
    id: 'i-wing-centre', level: 'intermediate', topic: 'strategy', lesson: 'pusat',
    q: ['What is the classic answer to an attack on the wing?', 'Apa jawaban klasik terhadap serangan di sayap?'],
    options: [['Resign', 'Menyerah'], ['A counter-attack in the centre', 'Serangan balik di pusat'], ['Trade all the rooks', 'Menukar semua benteng'], ['Move the king to the wing', 'Memindahkan raja ke sayap']], answer: 1,
    why: ['A wing attack works best when the centre is closed; open it to punish it.', 'Serangan sayap paling berhasil bila pusat tertutup; bukalah pusat untuk menghukumnya.'],
  },
  {
    id: 'i-rook-files', level: 'intermediate', topic: 'strategy', lesson: 'kolom-terbuka',
    q: ['Where do rooks usually work best?', 'Di mana benteng biasanya bekerja paling baik?'],
    options: [['Behind their own pawns', 'Di belakang bidak sendiri'], ['On open files and the seventh rank', 'Di kolom terbuka dan baris ketujuh'], ['In the corners', 'Di sudut papan'], ['Next to the king', 'Di samping raja']], answer: 1,
    why: ['Open lines let rooks enter enemy territory; the seventh rank hits many pawns.', 'Garis terbuka membuat benteng masuk ke wilayah lawan; baris ketujuh menyerang banyak bidak.'],
  },
  {
    id: 'a-minority', level: 'advanced', topic: 'strategy', lesson: 'queens-gambit',
    q: ['What is a minority attack?', 'Apa itu serangan minoritas?'],
    options: [['Attacking with fewer pieces than the opponent', 'Menyerang dengan buah lebih sedikit dari lawan'], ['Pushing fewer pawns against more enemy pawns to create weaknesses', 'Mendorong lebih sedikit bidak melawan lebih banyak bidak lawan untuk menciptakan kelemahan'], ['Sacrificing a minor piece', 'Mengorbankan bidak ringan'], ['Attacking on the kingside only', 'Menyerang hanya di sayap raja']], answer: 1,
    why: ['Typical of the Carlsbad structure: White plays b4-b5 against Black\'s c-pawn.', 'Khas struktur Carlsbad: Putih memainkan b4-b5 melawan bidak c Hitam.'],
  },
  {
    id: 'a-bad-bishop', level: 'advanced', topic: 'strategy', lesson: 'pasangan-gajah',
    q: ['What makes a bishop "bad"?', 'Apa yang membuat gajah "buruk"?'],
    options: [['It is blocked by its own pawns on the same colour', 'Terhalang bidak sendiri di warna kotak yang sama'], ['It has been moved twice', 'Sudah digerakkan dua kali'], ['It is on the edge', 'Berada di tepi papan'], ['It is on a light square', 'Berada di kotak terang']], answer: 0,
    why: ['Trade it, or bring it out before closing it in.', 'Tukar, atau keluarkan sebelum terkurung.'],
  },
  {
    id: 'a-najdorf', level: 'advanced', topic: 'openings', lesson: 'sicilian',
    q: ['Which move defines the Najdorf Sicilian?', 'Langkah mana yang mencirikan Najdorf Sicilian?'],
    options: [['5...a6', '5...a6'], ['5...e5', '5...e5'], ['5...g6', '5...g6'], ['5...Nc6', '5...Nc6']], answer: 0,
    why: ['After 1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6: it stops Nb5 and prepares ...e5 or ...b5.', 'Setelah 1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6: mencegah Nb5 dan menyiapkan ...e5 atau ...b5.'],
  },
  {
    id: 'a-saves', level: 'advanced', topic: 'basics', lesson: 'menang-seri',
    q: ['When you are behind in material, which resources can save the game?', 'Saat tertinggal material, sumber daya apa yang bisa menyelamatkan partai?'],
    options: [['Stalemate and repetition', 'Pat dan pengulangan posisi'], ['Trading queens', 'Menukar ratu'], ['Castling', 'Rokade'], ['Promoting a pawn', 'Promosi bidak']], answer: 0,
    why: ['Both lead to a draw even when the opponent has more material.', 'Keduanya berakhir remis meski lawan punya material lebih banyak.'],
  },
];
