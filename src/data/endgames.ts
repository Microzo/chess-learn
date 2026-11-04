/**
 * Latihan endgame melawan bot terkuat. Pemain memegang `player`; sasaran: menang (`win`) atau
 * bertahan sampai remis (`draw`). Tes memvalidasi FEN dan bahwa pemain yang mulai sesuai sisi.
 */
export interface EndgameDrill {
  id: string;
  fen: string;
  player: 'w' | 'b';
  goal: 'win' | 'draw';
  level: 'beginner' | 'intermediate' | 'advanced';
  /** pelajaran yang berkaitan */
  lesson: string;
  title: [en: string, id: string];
  task: [en: string, id: string];
  hint: [en: string, id: string];
}

export const ENDGAMES: EndgameDrill[] = [
  {
    id: 'kq-k', fen: '8/8/8/3k4/8/8/8/KQ6 w - - 0 1', player: 'w', goal: 'win', level: 'beginner', lesson: 'mat-ratu',
    title: ['King and queen vs king', 'Raja dan ratu vs raja'],
    task: ['Checkmate the Black king. Avoid stalemate!', 'Skakmat raja Hitam. Hindari pat!'],
    hint: ['Confine the king with the queen a knight\'s jump away, then bring your king closer.', 'Kurung raja dengan ratu sejauh lompatan kuda, lalu dekatkan rajamu.'],
  },
  {
    id: 'kr-k', fen: '8/8/8/3k4/8/8/8/KR6 w - - 0 1', player: 'w', goal: 'win', level: 'beginner', lesson: 'mat-benteng',
    title: ['King and rook vs king', 'Raja dan benteng vs raja'],
    task: ['Checkmate the Black king with king and rook.', 'Skakmat raja Hitam dengan raja dan benteng.'],
    hint: ['Cut the king off with the rook, bring your king up, take the opposition, then check on the edge.', 'Potong raja dengan benteng, dekatkan rajamu, ambil oposisi, lalu skak di tepi.'],
  },
  {
    id: 'two-rooks', fen: '8/8/8/4k3/8/8/8/KRR5 w - - 0 1', player: 'w', goal: 'win', level: 'beginner', lesson: 'mat-tangga',
    title: ['Ladder mate with two rooks', 'Mat tangga dengan dua benteng'],
    task: ['Drive the king to the edge with the two rooks and checkmate.', 'Dorong raja ke tepi dengan dua benteng lalu skakmat.'],
    hint: ['One rook cuts off a rank, the other gives check; alternate.', 'Satu benteng memotong satu baris, yang lain memberi skak; bergantian.'],
  },
  {
    id: 'kp-opposition', fen: '4k3/8/4K3/4P3/8/8/8/8 w - - 0 1', player: 'w', goal: 'win', level: 'intermediate', lesson: 'oposisi',
    title: ['King and pawn: the key square', 'Raja dan bidak: kotak kunci'],
    task: ['Promote the pawn and win. Keep your king in front of it.', 'Promosikan bidak dan menanglah. Jaga rajamu di depan bidak.'],
    hint: ['Use the opposition and step aside only when it helps the pawn advance.', 'Pakai oposisi dan bergeser hanya bila itu membantu bidak maju.'],
  },
  {
    id: 'square-rule', fen: '8/8/8/5k2/P7/8/8/K7 w - - 0 1', player: 'w', goal: 'win', level: 'intermediate', lesson: 'aturan-kotak',
    title: ['Race to promote', 'Balapan promosi'],
    task: ['Push the passed pawn. The Black king is outside its square.', 'Dorong bidak lewat. Raja Hitam berada di luar kotaknya.'],
    hint: ['Just push the pawn: count the squares and the king cannot catch it.', 'Cukup dorong bidak: hitung kotaknya, raja tidak akan sempat.'],
  },
  {
    id: 'lucena', fen: '1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1', player: 'w', goal: 'win', level: 'advanced', lesson: 'lucena',
    title: ['The Lucena position', 'Posisi Lucena'],
    task: ['Win with rook and pawn against a rook.', 'Menang dengan benteng dan bidak melawan benteng.'],
    hint: ['Cut off the enemy king and shield your king from side checks, then promote.', 'Potong raja lawan dan lindungi rajamu dari skak samping, lalu promosikan.'],
  },
  {
    id: 'philidor', fen: '4k3/8/r7/3PK3/8/8/8/3R4 b - - 0 1', player: 'b', goal: 'draw', level: 'advanced', lesson: 'philidor',
    title: ['Philidor defence', 'Pertahanan Philidor'],
    task: ['You are Black. Hold the draw against the stronger side.', 'Kamu Hitam. Pertahankan remis melawan pihak yang lebih kuat.'],
    hint: ['Keep the rook on the sixth rank; when the pawn advances, check from behind.', 'Benteng tetap di baris keenam; saat bidak maju, skak dari belakang.'],
  },
];
