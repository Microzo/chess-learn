/** Terjemahan Inggris puzzle (kunci = id puzzle). Tes memastikan setiap id punya terjemahan. */
export interface PuzzleText {
  theme: string;
  title: string;
  hint: string;
  explanation: string;
}

export const PUZZLES_EN: Record<string, PuzzleText> = {
  'skakmat-1-ratu': {
    theme: 'Checkmate',
    title: 'Checkmate with the queen',
    hint: 'The queen must give check from a square protected by your king.',
    explanation: 'Qg7# : the queen is protected by the king on f6, the squares g8 and h7 are covered, so the Black king can neither run nor capture the queen.',
  },
  'skakmat-1-benteng': {
    theme: 'Checkmate',
    title: 'Checkmate with the rook',
    hint: 'The White king already guards g7 and h7. All that is left is a check on the eighth rank.',
    explanation: 'Ra8# : the rook checks along the eighth rank, the king on g6 guards g7 and h7, so there is no escape square.',
  },
  'mat-lorong-1': {
    theme: 'Back-rank mate',
    title: "The king trapped by its own pawns",
    hint: 'The Black king has no luft. Look for a check on the back rank.',
    explanation: "Rd8# : the three Black pawns block the king's own escape squares. Always give your king luft (h3 or h6) before it is too late.",
  },
  'mat-pengap': {
    theme: 'Checkmate',
    title: 'Smothered mate',
    hint: 'The Black king is surrounded by its own pieces. Only a knight jump can attack it.',
    explanation: 'Nf7# : the king on h8 is hemmed in by its own rook on g8 and the pawns on g7 and h7; the knight gives check and cannot be captured.',
  },
  scholar: {
    theme: 'Checkmate',
    title: "Scholar's Mate",
    hint: "Black's weak point early in the game is f7.",
    explanation: 'Qxf7# : f7 is attacked by the queen and the bishop and defended only by the king. The bishop on c4 protects the queen, so the king cannot capture it.',
  },
  'fools-mate': {
    theme: 'Checkmate',
    title: "Fool's Mate",
    hint: "The diagonal to White's king is wide open.",
    explanation: 'Qh4# : White opened the e1-h4 diagonal with f3 and g4. The fastest checkmate in chess: only two moves by Black.',
  },
  'mat-tangga-2': {
    theme: 'Checkmate',
    title: 'Ladder mate with two rooks',
    hint: 'Confine the king to the eighth rank with one rook, then check with the other.',
    explanation: 'Ra7 cuts off the seventh rank so the king is confined to the eighth; Rb8# then gives a check that cannot be avoided.',
  },
  'garpu-kuda': {
    theme: 'Fork',
    title: 'Knight fork',
    hint: 'Find the square that attacks the king and the rook at the same time.',
    explanation: 'Nf7+ attacks the king on d8 and the rook on h8 at once. The king has to move, then the knight captures the rook.',
  },
  'skewer-benteng': {
    theme: 'Skewer',
    title: 'Skewering the king and queen',
    hint: "The Black king and queen are on the same file.",
    explanation: 'Re1+ forces the king to move and the queen behind it falls: Rxe8.',
  },
  'tersingkap-ratu': {
    theme: 'Discovered attack',
    title: 'A discovered check wins the queen',
    hint: 'The knight stands in front of your rook. What happens if it leaves while capturing something?',
    explanation: 'Nxc5+ captures the queen and opens the e-file at the same time: the rook gives check. Black has no time to save the queen.',
  },
  'pin-kuda': {
    theme: 'Pin',
    title: 'The pinned knight',
    hint: 'The knight on e7 cannot move, and it is attacked twice but defended only once.',
    explanation: 'The knight on e7 is pinned to the king by the rook. Rxe7+ (or Bxe7) wins it: the king cannot recapture because e7 is protected by another White piece.',
  },
  'legal-mate': {
    theme: 'Opening trap',
    title: "Legal's Mate",
    hint: 'Sacrifice your queen. If Black takes it, you have checkmate with minor pieces.',
    explanation: "Nxe5! offers the queen. If Black greedily plays Bxd1, then Bxf7+ Ke7 Nd5# is checkmate with two knights and a bishop. If Black declines the bait (…dxe5), White is still fine, because this trap only works against an opponent who is tempted.",
  },
};
