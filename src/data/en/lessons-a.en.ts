import type { LessonText } from './lessons.en';

/** Terjemahan Inggris pelajaran (bagian A: dasar dan opening awal). Jumlah catatan demo harus sama dengan jumlah langkah. */
export const LESSONS_A: Record<string, LessonText> = {
  'prinsip-opening': {
    title: 'The three golden opening principles',
    summary: 'Control the centre, develop your pieces, make your king safe.',
    body: [
      'Almost every good opening follows three simple ideas: control the centre of the board (e4, d4, e5, d5), develop your minor pieces (knights and bishops) as quickly as possible, then castle so the king is safe and the rooks are connected.',
      'Pawns in the centre give you space and make your knights and bishops more active. Minor pieces that are still on the back rank are useless; every opening move should bring a new piece to an active square.',
      'What to avoid: moving the same piece twice for no reason, bringing the queen out too early (it is easily chased away, losing tempo), and making too many wing-pawn moves before the minor pieces are out.',
    ],
    points: [
      'Centre first: e4/d4 (or e5/d5 for Black).',
      'Knights before bishops, and both before wing-pawn moves.',
      'Castle, usually within the first 10 moves.',
      'Do not grab edge pawns with the queen if it leaves your development behind.',
    ],
    demo: {
      intro: 'Let us look at the Italian Game (Giuoco Pianissimo): a clean example of all three principles.',
      notes: [
        'White takes the centre and opens lines for the queen and bishop.',
        'Black answers in the same way: centre and lines for the bishop and queen.',
        'The knight comes out while attacking the e5 pawn. It develops a piece and creates a threat at the same time.',
        'Black defends e5 while developing the knight.',
        'The bishop heads for an active diagonal and pressures the weak point f7 (defended only by the king).',
        "Black balances things: the bishop also goes to an active diagonal and pressures f2.",
        'White prepares d4 to take the full centre.',
        'Black attacks e4 with the second knight. All the minor pieces are out.',
        'White calmly defends e4 and opens the way for the c1 bishop.',
        'Black defends e5 with a pawn, opening the c8 bishop.',
        'White castles: the king is safe and the h1 rook moves to f1 and joins the game.',
        'Black castles too. Both sides have developed, taken the centre and secured their kings.',
      ],
    },
  },
  'nilai-bidak': {
    title: 'Piece values and material',
    summary: 'Pawn 1, knight 3, bishop 3, rook 5, queen 9.',
    body: [
      'Standard values: pawn = 1, knight = 3, bishop = 3, rook = 5, queen = 9. These numbers are a rough guide for weighing trades, not absolute laws.',
      'A bishop and a knight are about equal, but the bishop is slightly stronger in open positions and the knight in closed ones. Two bishops (the bishop pair) are usually worth a little more than 6 because they complement each other on both colours of squares.',
      'Trading a rook (5) for a knight or bishop (3) is called winning or losing "the exchange": the difference is about two points. But position can beat material: a dangerous attack, a strong passed pawn or a trapped king is often more important than a one-pawn difference.',
    ],
    points: [
      'Calculate before you trade: what has changed once all the exchanges are over?',
      'When ahead in material, simplify by trading pieces.',
      'When behind, avoid trades and look for complications.',
      'The king has no trading value, but in the endgame it is as active as a minor piece.',
    ],
  },
  rokade: {
    title: 'Castling and king safety',
    summary: 'One move that makes the king safe and activates a rook.',
    body: [
      'Castling is the only move in which two pieces move at once. The king jumps two squares towards a rook, then the rook jumps to the other side of the king. Short castling (O-O) is more common because the king shelters behind the f, g and h pawns.',
      'Conditions for castling: the king and the rook involved have never moved, there are no pieces between them, the king is not in check, and the king does not pass through or land on a square attacked by the opponent.',
      'A king that castles too late often becomes a target in the middle when the e- or d-file opens. The principle: before opening the centre with pawn trades, make sure your king is safe.',
    ],
    points: [
      'O-O: short castling (kingside). O-O-O: long castling (queenside).',
      'After castling, do not rush to push the pawns in front of the king (f, g, h).',
      'Castling on opposite sides triggers a race of pawn attacks.',
    ],
    demo: {
      intro: 'The kings and rooks are ready (the other pieces are only pawns on the second rank). Look at both kinds of castling for both colours.',
      notes: [
        "White's short castling: the king goes to g1 and the h1 rook to f1.",
        "Black's long castling: the king goes to c8 and the a8 rook to d8.",
      ],
    },
  },
  notasi: {
    title: 'Algebraic notation',
    summary: 'How to read and write chess moves.',
    body: [
      "Files (columns) are labelled a to h from left to right from White's side, and ranks (rows) are numbered 1 to 8 from White's side. Every square has a unique name, for example e4 or g8.",
      'Pieces are written with letters: K king, Q queen, R rook, B bishop, N knight. Pawns have no letter. Example: Nf3 means the knight goes to f3, e4 means a pawn goes to e4.',
      'Extra symbols: x for a capture (Nxe5, exd5), + for check, # for checkmate, = for promotion (e8=Q), O-O and O-O-O for castling. When two identical pieces can go to the same square, add the file or rank they come from: Nbd2, R1e2.',
    ],
    points: [
      'Numbering: 1.e4 e5 means move 1: White plays e4, Black plays e5.',
      'Black moves are marked with three dots: 1...e5.',
      'PGN is the standard text format for storing games (you can import it in the Replay menu).',
    ],
  },
  'menang-seri': {
    title: 'Checkmate, stalemate and draws',
    summary: 'How a game ends, and the stalemate trap.',
    body: [
      'Checkmate: the king is attacked (check) and there is no way out: it cannot move, capture the attacker or block. It is the only way to win by position (apart from the opponent resigning or running out of time).',
      'Stalemate: the player to move has no legal move, but the king is not in check. The result is a draw, not a win. This is a classic mistake when ahead: being so eager to box in the enemy king that no squares are left.',
      'A draw can also come from agreement, threefold repetition, the 50-move rule (no pawn move or capture), and insufficient material to checkmate (for example king against king, or king and one minor piece against king).',
    ],
    points: [
      'Before the decisive move, check: does the opponent still have one legal move?',
      'King and queen, or king and rook, are enough for checkmate; king and a single knight or bishop are not.',
      'When behind in material, stalemate and repetition are lifesavers.',
    ],
    demo: {
      intro: 'White has a queen and a king, Black has only a king. It is Black to move.',
      notes: [
        'The king on h8 is not attacked, but g8, g7 and h7 are all covered by the queen on f7 and the king on g6. There is no legal move: this is STALEMATE and the result is a draw. Compare: with the queen on g7 (protected by the king on g6), the same king is in check with no escape square, and that is checkmate.',
      ],
    },
  },
  italian: {
    title: 'Italian Game',
    summary: '1.e4 e5 2.Nf3 Nc6 3.Bc4: a classic, beginner-friendly opening.',
    body: [
      'The Italian Game is one of the oldest and best-tested openings. White develops the bishop to c4, pressures f7 and prepares quick castling. The typical plan: c3 followed by d4 to take the full centre.',
      'The quiet variation (Giuoco Pianissimo) plays d3 and builds up slowly. Sharp variations play d4 at once, or the Evans Gambit (4.b4) to open the game with tempo.',
      'For Black, 3...Bc5 and 3...Nf6 are the main answers. Watch out for traps around f7 and e5, especially when White has a bishop on c4 and a knight on g5.',
    ],
    points: [
      "White's ideas: the c4 bishop pressures f7, c3 + d4 for the centre.",
      "Black's ideas: ...d6 and ...O-O, or ...d5 to release the centre.",
      'A good first opening to learn: the plan is clear and easy to remember.',
    ],
    demo: {
      intro: 'The main line of the Giuoco Pianissimo, up to castling.',
      notes: [
        'The centre and a path for the bishop.',
        'A symmetrical reply.',
        'Attacks e5 while developing the knight.',
        'Defends e5.',
        'The bishop goes to the a2-g8 diagonal, eyeing f7.',
        'Black replies with an active bishop that eyes f2.',
        'The idea of d4: the c3 pawn supports the d4 push to come.',
        'Attacks e4.',
        'A quiet way to defend e4 and open the c1 bishop.',
        'Reinforces e5.',
        'White castles; a balanced positional game.',
        'Black castles too. Typical continuations: Re1, a4, h3 and Nbd2-f1-g3.',
      ],
    },
  },
  'ruy-lopez': {
    title: 'Ruy Lopez (Spanish)',
    summary: '1.e4 e5 2.Nf3 Nc6 3.Bb5: long-term pressure on e5.',
    body: [
      "The Ruy Lopez has been a main weapon of elite players since the sixteenth century. The bishop on b5 pressures the c6 knight, the defender of the e5 pawn. The threat is not immediate, but it creates long-term pressure.",
      'After 3...a6 4.Ba4 Nf6 5.O-O Be7, White plays Re1 and Bb3, then c3 and d4. Black answers with ...b5, ...d6 and ...O-O. The position is rich in strategy: who controls the centre, who has the open files.',
      'The Closed (with the Marshall Attack as its sharp branch), the Open and the Berlin are the main choices for Black. These lines are very deep, so learn the ideas first before memorising moves.',
    ],
    points: [
      "White's ideas: pressure on e5, then c3 + d4.",
      "Black's ideas: ...a6 and ...b5 to drive the bishop away, ...d6 and ...O-O.",
      'The position is slow and strategic: good for training positional understanding.',
    ],
    demo: {
      intro: 'A Closed Ruy Lopez line.',
      notes: [
        'The centre.',
        'The centre.',
        'Attacks e5.',
        'Defends e5.',
        'The bishop pressures c6, the defender of e5. The idea: target the c6 knight to increase the pressure on e5 (not a direct threat).',
        'Asks the bishop: do you want to trade or retreat?',
        'Keeps the pressure; trading on c6 is another variation.',
        'Black develops while attacking e4.',
        'White castles and leaves e4 for the time being. If ...Nxe4, White plays d4 or Re1 with pressure on the e-file (the Open Ruy Lopez).',
        'Reinforces and prepares castling.',
        'Defends e4 with the rook.',
        'Drives the bishop to b3.',
        'The bishop goes to the active a2-g8 diagonal.',
        'Supports e5 and opens the c8 bishop.',
        'Prepares d4.',
        'The typical Closed Ruy Lopez position. Typical continuations: h3, d4, Nbd2.',
      ],
    },
  },
  sicilian: {
    title: 'Sicilian Defence (Najdorf)',
    summary: '1.e4 c5: the most popular and sharpest defence for Black.',
    body: [
      "The Sicilian (1...c5) is an asymmetrical answer to 1.e4. Black does not copy White but attacks the centre from the wing and creates imbalance from the very start.",
      "In the Open Sicilian, White plays d4 and trades that pawn for Black's c-pawn. White gets space and the initiative; Black gets a semi-open c-file and counterplay on the queenside. The Najdorf variation (5...a6) is the most flexible: a6 stops a White knight or bishop from going to b5 and prepares ...e5 or ...b5.",
      "The result is often a sharp game with castling on opposite sides: White attacks the king on the kingside, Black attacks on the queenside. It is very deep, but worth studying if you like sharp play.",
    ],
    points: [
      'Black: a semi-open c-file and counterplay on the queenside.',
      'White: more space and an attack on the kingside (Be3, f3, Qd2, g4).',
      'Black needs theoretical knowledge; White can choose an Anti-Sicilian (the Alapin 2.c3) for a calmer game.',
    ],
    demo: {
      intro: 'The Open Sicilian up to the Najdorf.',
      notes: [
        'White opens with the king pawn.',
        'The Sicilian: Black does not follow symmetry. The c-pawn attacks d4 and later opens the c-file.',
        'Prepares d4.',
        'Defends e5 and opens the c8 bishop.',
        'White opens the centre: a trade of the d-pawn for the c-pawn.',
        'Black trades.',
        'The knight is active in the centre. White has more space, Black has the c-file.',
        'Attacks e4.',
        'Defends e4 while developing.',
        'The Najdorf: a6 stops Nb5/Bb5 and prepares ...e5 or ...b5. Flexible and sharp.',
      ],
    },
  },
  french: {
    title: 'French Defence',
    summary: '1.e4 e6 2.d4 d5: solid, with counterplay on the queenside.',
    body: [
      "The French is a solid defence: Black builds an e6-d5 pawn chain and challenges White's centre. Its main weakness is the c8 bishop, locked in behind the e6 and d5 pawns.",
      "Black usually attacks the base of White's chain with ...c5 and targets d4. White gets space, especially after 3.e5 (the Advance), but that e5 pawn can become a target.",
      'A lesson in pawn structure: a pawn chain is attacked at its base (d4 for White, e6 for Black), not at its tip.',
    ],
    points: [
      'Black: ...c5 attacks d4, ...f6 attacks e5.',
      'White: space on the kingside, and an attack there; the d4-e5 chain.',
      "Black's problem: the 'bad' c8 bishop. Find ways to bring it out (...b6, ...Ba6) or trade it.",
    ],
    demo: {
      intro: 'The classical French: 3.Nc3 Nf6 4.Bg5.',
      notes: [
        'The centre.',
        'Black prepares d5; a solid but slightly passive position.',
        'White takes the full centre.',
        "Black challenges e4. Black's pawn chain: e6-d5.",
        'Defends e4 with a knight and develops.',
        'Attacks e4 again.',
        "The bishop pressures the f6 knight, a defender of Black's centre.",
        'Breaks the pin and prepares castling.',
        'White pushes e5 and chases the f6 knight away.',
        "The knight retreats to d7; Black will attack the base of White's chain with ...c5.",
        'White trades the pressuring bishop.',
        "Black completes the trade. Black's plan: ...c5, ...Nc6, ...f6.",
      ],
    },
  },
};
