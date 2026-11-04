import type { LessonText } from './lessons.en';

/** Terjemahan Inggris pelajaran (bagian E: endgame dan pola skakmat). */
export const LESSONS_E: Record<string, LessonText> = {
  'endgame-prinsip': {
    title: 'Endgame principles',
    summary: 'The king becomes an active piece, passed pawns must be pushed.',
    body: [
      'In the endgame the king is no longer a piece to hide: it is a strong piece that attacks and defends. Bring the king to the centre as soon as the queens are traded.',
      "Passed pawns must be pushed: a passed pawn forces the opponent to stop it, tying down enemy pieces. Put the rook behind a passed pawn (the Tarrasch rule), yours or your opponent's, so the rook gets stronger as the pawn advances.",
      'Calculate precisely: the endgame is about tempo (who gets there first). Important: the rule of the square, the opposition and key squares answer the question "can the king catch that pawn in time?"',
    ],
    points: [
      'Activate the king as soon as the queens are traded.',
      'Rook behind the passed pawn, not in front of it.',
      'Take the file or rank before your opponent does.',
      'Two connected passed pawns are very strong.',
    ],
  },
  oposisi: {
    title: 'Opposition: king and pawn against king',
    summary: 'The side that "must move" loses: the key to every pawn endgame.',
    body: [
      'Opposition: two kings face each other on a file, rank or diagonal with one empty square between them. The player who has to move in that position gives up the opposition and must give way to the enemy king. The concept comes from zugzwang: the obligation to move that harms you.',
      'In king and pawn against king, the king of the pawn\'s owner must be in front of the pawn. With the king on a key square (two ranks ahead of the pawn), the pawn can always be promoted; if the defending king manages to take the opposition or reach the key square first, the result is generally a draw.',
      'This simple exercise is the foundation of all pawn endgames, so it is worth memorising. Most wins in pawn endgames come from taking the opposition at the right moment.',
    ],
    points: [
      'King in front of the pawn, not behind it.',
      'Take the opposition when it is the opponent who has to move.',
      "A pawn's key squares are the three squares two ranks ahead of it (e.g. for an e4 pawn: d6, e6, f6).",
    ],
    demo: {
      intro: "Key-square demo: the White king is already on e6 (in front of the e5 pawn), two ranks ahead of the pawn. The Black king on e8 faces it, but because the White king is already on a key square, White still wins.",
      notes: [
        "White shifts so it can advance. The Black king cannot escape to e7 or d7, which are attacked.",
        'Black holds a position near the promotion square.',
        "The pawn advances with the support of the d6 king. The Black king cannot attack e6.",
        'Black tries the opposition again.',
        'The pawn advances and is protected by the d6 king; Black cannot capture it.',
        'The Black king attacks the e7 pawn.',
        'The White king guards e7 and e8: the pawn will promote on e8. White wins.',
      ],
    },
  },
  'aturan-kotak': {
    title: 'The rule of the square',
    summary: 'Calculate whether the king can catch a passed pawn in time.',
    body: [
      'If no other pieces are in the way, you can tell whether a king can stop a passed pawn without counting move by move. Imagine a square with the pawn in one corner and sides as wide as the number of moves the pawn needs to promote (e.g. an a5 pawn needs 3 moves, so the square runs from a5 to d5 and from a8 to d8). If the defending king is inside that square (on its turn), it can catch the pawn.',
      'If the king is outside the square, the pawn gets through and becomes a queen. Do not forget that a pawn still on its second rank may advance two squares, so its square is counted from the third rank.',
      'This rule is quick, practical, and often decides whether you should trade down into a pawn endgame or not.',
    ],
    points: [
      'Count the pawn\'s distance to the promotion rank, then imagine its square.',
      'Whose turn it is also affects the result: check who is to move.',
      'A pawn on its second rank is counted from the third rank.',
    ],
    demo: {
      intro: 'The a4 pawn needs four moves to reach a8. The Black king on f5 looks close, but is it inside the square?',
      notes: [
        'The pawn advances. Its square is now a5 to d5 and d8. The f5 king is outside the square (the f-file).',
        'The king runs, but is still outside the square.',
        'The pawn advances again.',
        'The king tries to chase.',
        'The pawn is one step from promotion.',
        'The king is too late: it can neither capture a7 nor block a8.',
        'The pawn becomes a queen. Conclusion: a king outside the square means the pawn gets through.',
      ],
    },
  },
  'mat-ratu': {
    title: 'Mate with king and queen',
    summary: 'The most basic technique, which you must be able to do without stalemating.',
    body: [
      "King and queen against king is a forced win. The method: use the queen to confine the enemy king to the edge of the board, a knight's jump away from it (so it cannot approach), then bring your own king up to support the queen.",
      "When the enemy king is boxed in at the edge and your king is close, the queen gives a check protected by your king: checkmate. The biggest danger is stalemate: do not make a move that takes away all of the enemy king's squares if it is not in check.",
      'Every move, ask: "Does my opponent still have a legal move?" If the answer is no and it is not check, change your move.',
    ],
    points: [
      "Confine the enemy king with the queen at a knight's distance.",
      'Bring your own king close before delivering mate.',
      'Always check for stalemate before moving.',
    ],
    demo: {
      intro: "The White king on f6 is already close; the queen is on g1. Black is on h8.",
      notes: [
        'Checkmate! The g7 queen is protected by the f6 king; g8 and h7 are covered by the queen. The Black king has no free square and cannot capture a protected queen.',
      ],
    },
  },
  'mat-benteng': {
    title: 'Mate with king and rook',
    summary: 'Use the opposition and the rook to push the enemy king to the edge.',
    body: [
      'With king and rook against king the win is also forced, but it takes more moves than with the queen. The strategy: use the rook to cut the enemy king off from part of the board, bring your king up, take the opposition, then give a rook check on the edge.',
      "The final pattern: your king stands on the square that guards the space in front of the enemy king (on the neighbouring file, so its escape squares are covered), and the rook gives check on the edge rank or file. The enemy king has no escape square because they are all guarded by the king or the rook.",
      'This exercise looks simple, but it often decides a game when you are only a rook up. Practise until you can do it without thinking.',
    ],
    points: [
      'The rook cuts off; the king approaches; the opposition forces the king back.',
      'Give the rook check only once your own king already covers the escape squares.',
      'Avoid stalemate when the enemy king is boxed into the corner.',
    ],
    demo: {
      intro: 'The White king on g6 controls g7 and h7. The Black king is on h8. The rook is on a1.',
      notes: [
        'Checkmate! The rook gives check on the eighth rank; the squares g7 and h7 are guarded by the g6 king, and g8 by the rook.',
      ],
    },
  },
  lucena: {
    title: 'The Lucena position',
    summary: 'Rook and pawn on the seventh against a rook: a winning method you must master.',
    body: [
      "The Lucena position arises in rook-and-pawn endgames: White has a pawn on the seventh rank with the king in front of the pawn (on the promotion square), while the Black king is cut off one or more files from the pawn. It is a forced win for White, but the technique must be precise. Note: this applies to pawns other than rook pawns (a- and h-file); with a rook pawn the result is usually a draw.",
      "The main idea: the rook is used to cut off the enemy king and to shield your own king from checks, so the king can step out in front of the pawn and the pawn can be promoted. Many games that look drawn are actually won if this position can be reached.",
      'The demo below is one winning path chosen by the engine (an advantage of about +13). There are many ways to win; understand the idea: cut off the enemy king, shield your king from side checks, then promote.',
    ],
    points: [
      'Conditions: a pawn on the seventh, your king in front of it, the enemy king cut off.',
      'Use the rook to cut off the enemy king and stop side checks.',
      'Practise this position; it often decides between a win and a draw in rook endgames.',
    ],
    demo: {
      intro: "The White king on b8 is in front of the b7 pawn. The Black king on d8 is cut off on the d-file, and the Black rook on a2 is ready to give side checks.",
      notes: [
        'A check that cuts the Black king off from the pawn (the d-file).',
        'The Black king steps aside from the d-file.',
        'The rook keeps cutting off the Black king while shifting to the fourth rank.',
        'Black tries to find a side check.',
        'The rook keeps cutting off on the d-file.',
        'The Black king chases the rook.',
        'The rook moves to the a-file to shield the White king from checks there.',
        'Black defends on the sixth rank.',
        "The king stays on the back rank, now shielded from side checks by the a5 rook.",
        'Black gives check, but the White rook guards the a-file.',
        "White captures Black's rook with check.",
        'The Black king cannot stop the pawn.',
        'The pawn promotes. White has a queen and a rook against a king: a win.',
      ],
    },
  },
  philidor: {
    title: 'The Philidor position: how to defend',
    summary: 'A rook on the sixth rank holds the enemy king and pawn to a draw.',
    body: [
      "Against a rook and pawn with only a rook, the best defence is the Philidor position: place the rook on the sixth rank (the third rank from the defender's side) to stop the enemy king from advancing, with the defending king in front of the pawn.",
      "When the pawn advances to the sixth rank, the defending rook immediately goes to the back rank and checks from behind. The enemy king cannot hide from those checks, and the result is a draw.",
      "The engine rates the demo position below as nearly equal (−0.2 from the point of view of the defending Black), meaning a draw is very likely to be reached. Learn this position as a safety net when you are a pawn down in a rook endgame.",
    ],
    points: [
      "Rook on the sixth rank, the defending king near the pawn's promotion square.",
      'When the pawn advances to the sixth rank, move the rook to the back rank and check from behind.',
      'As long as the pawn has not reached the sixth rank, the defending rook stays on the sixth rank.',
    ],
    demo: {
      intro: 'White has a d5 pawn and a king on e5; Black has only a rook and a king. Black to move.',
      notes: [
        'The rook stays on the sixth rank, stopping the White king from safely stepping to e6 or d6.',
        'White looks for a way through, for example with a rook check.',
        'The Black king stays in front of the pawn, on the d-file.',
        'White gives check.',
        'The Black king attacks the unprotected rook and forces White back.',
        'The rook moves to keep the attack. The engine rates this position as balanced: a draw.',
      ],
    },
  },
  'mat-tangga': {
    title: 'Ladder mate (two rooks)',
    summary: 'Two rooks alternately cut off and give check: easy and certain.',
    body: [
      'Two rooks can confine the enemy king rank by rank, like the steps of a ladder: one rook cuts off a rank, the second rook gives check on the next rank, then they alternate until the king is trapped at the edge.',
      'This pattern is easy and certain. An important condition: the enemy king must not be able to capture either rook, and do not stalemate.',
      'The idea also applies to a queen and a rook, which is why two connected rooks are considered so strong in the endgame.',
    ],
    points: [
      'One rook cuts off, one gives check.',
      'Keep your distance so the enemy king cannot capture a rook.',
      'Use the edge rank or file as a wall.',
    ],
    demo: {
      intro: 'Two White rooks against the Black king on the eighth rank.',
      notes: [
        'The first rook cuts off the seventh rank: the Black king is confined to the eighth rank.',
        'The Black king can only move along the eighth rank.',
        'The second rook gives check on the eighth rank; the seventh rank is controlled by the first rook. Checkmate.',
      ],
    },
  },
  'scholar-mate': {
    title: "Scholar's Mate",
    summary: 'A 4-move checkmate on f7. Recognising and stopping it.',
    body: [
      "Scholar's Mate is the fastest checkmate that is still realistic: the queen and bishop attack f7, which is defended only by the king. It is easy to stop, but often works at beginner level.",
      'Defence: after 2.Bc4, do not ignore f7. After Qh5, do not play ...Nf6 followed by Qxf7# without checking first. Safe ways: ...Nc6 and ...g6 (attacking the queen), or ...Qe7.',
      'If you play it yourself, remember that an alert opponent will reply with a counter-attack against your prematurely developed queen.',
    ],
    points: [
      'Early weak points: f7 (Black) and f2 (White).',
      'Protect f7 with the queen (...Qe7), a knight (...Nh6), or drive the queen away with ...g6 before White attacks it twice.',
      'A queen that comes out too early can be attacked and loses tempo.',
    ],
    demo: {
      intro: "An example of Scholar's Mate when Black is careless.",
      notes: [
        'Opens lines for the queen and bishop.',
        'A natural reply.',
        'The bishop targets f7.',
        'Black develops a knight, but does not yet protect f7.',
        'The queen and bishop now attack f7 twice (and the queen attacks e5).',
        'Black errs: the knight attacks the h5 queen but forgets f7, which is now attacked twice. Safe answers: ...g6 (driving the queen away) or ...Qe7.',
        'Checkmate! f7 is protected by the c4 bishop so the king cannot capture the queen, and there is no escape square.',
      ],
    },
  },
};
