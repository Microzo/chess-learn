import type { LessonText } from './lessons.en';

/** Terjemahan Inggris pelajaran (bagian D: taktik dan strategi). */
export const LESSONS_D: Record<string, LessonText> = {
  'cek-tiga': {
    title: 'Check, capture, threat: a tactical scan',
    summary: 'A habit of 3 questions before every move.',
    body: [
      'Most mistakes at beginner level are tactical mistakes. Get used to checking three things before you move: Checks (are there checks for me and for my opponent?), Captures (which pieces can be captured, including unprotected ones?), Threats (what is my opponent threatening, and what can I threaten?).',
      'Before moving, ask: "After this move, what does my opponent attack?" and "Do I have any unprotected pieces?" These two questions prevent most pieces from being lost for nothing.',
      'The next tactical patterns (forks, pins, skewers, discovered attacks) only show up once you are used to looking for checks and captures. Pattern training and calculation training are two different things: you need to practise both.',
    ],
    points: [
      'Before moving: what does my opponent attack after my move?',
      'An unprotected piece is the easiest target.',
      'Look at forcing moves (checks, captures, threats) first: your opponent is free to choose a reply only when there is no force.',
    ],
  },
  garpu: {
    title: 'Fork',
    summary: 'One piece attacks two targets at once.',
    body: [
      'A fork happens when one piece attacks two (or more) enemy pieces at the same time, and the opponent can save only one. The knight is the fork specialist because its jump cannot be blocked and it attacks in a special pattern.',
      'The strongest fork is a fork with check: the king must move, so the other target cannot be saved. A knight fork of the king and a rook or queen often decides the game.',
      "Before forking, check two things: the forking square cannot be captured, and the forking piece (especially a knight) is not trapped right after taking the target. To prevent your opponent's forks: watch the squares an enemy knight can reach in two moves, especially squares that attack the king and a valuable piece at once.",
    ],
    points: [
      'Knights often fork the king + a rook or the queen.',
      'Pawns can fork too: one pawn attacks two minor pieces diagonally.',
      "Make sure the forking square cannot be captured by the enemy king (for example it is supported by a pawn or another piece).",
    ],
    demo: {
      intro: "White's knight is on g5. Black's king on d8 and rook on h8 are both a knight's jump away from f7.",
      notes: [
        'A fork! From f7 the knight attacks the d8 king and the h8 rook at once, and no Black piece can capture it. The engine rates this as the best move (an advantage of about +9).',
        'The king has to move. It does attack the f7 knight, but it is White to move now.',
        'The rook falls. The knight is in the corner, but it still has a way out (g6), so this material win really holds.',
      ],
    },
  },
  pin: {
    title: 'Pin',
    summary: 'A piece cannot move because it would expose a more valuable piece behind it.',
    body: [
      'A pin happens when an enemy piece cannot (or should not) move because a more valuable piece stands behind it. An absolute pin: the piece is in front of the king and may not move at all. A relative pin: the piece is in front of the queen or a rook; it may move, but material will be lost.',
      'A pinned piece is easy to attack: it cannot run away. The strategy is to add attackers to the pinned piece until its defenders are not enough.',
      'Pins are made by bishops, rooks and queens (pieces that move in straight lines or long diagonals). Breaking a pin: move the piece behind, block, or attack the pinning piece.',
    ],
    points: [
      'A pinned piece is a target: add attackers.',
      'Before moving, check whether one of your pieces is pinned without you noticing.',
      'Preventing pins: castle first, or protect pieces that can be pinned with other pieces.',
    ],
    demo: {
      intro: 'The e7 knight is pinned to the e8 king by the rook on e2 (the e-file). The b4 bishop also eyes e7.',
      notes: [
        'The pinned knight is defended only by the king, yet it is attacked twice (by the bishop and the rook). The king cannot recapture: the bishop on e7 is protected by the e2 rook. White wins a knight.',
      ],
    },
  },
  skewer: {
    title: 'Skewer',
    summary: 'The opposite of a pin: the valuable piece in front is forced to move, and the piece behind falls.',
    body: [
      'A skewer attacks a valuable piece (often the king or queen) and forces it to move, so the piece behind it, on the same line, can be captured. It is the opposite of a pin: in a pin the valuable piece is behind; in a skewer it is in front.',
      'The classic skewer: a rook or bishop gives check to a king that has its queen behind it, on the same file or diagonal. The king must move, then the queen is captured.',
      'How to avoid it: do not put your king and queen on the same line (file, rank or diagonal) that an enemy rook or bishop can attack.',
    ],
    points: [
      'Skewers are often made with a check on the king.',
      'Beware of the king and queen on the same file or diagonal.',
      'Rooks and bishops are the main culprits.',
    ],
    demo: {
      intro: "Black's king and queen are on the e-file (king in front, queen behind). White's rook is on a1.",
      notes: [
        'Check along the e-file. The king is in front, the queen right behind it.',
        'The king has to leave the e-file (the queen cannot block from behind).',
        'The queen is unprotected: White wins the queen with the rook.',
      ],
    },
  },
  tersingkap: {
    title: 'Discovered attack',
    summary: 'Move one piece, and the piece behind it starts attacking.',
    body: [
      'A discovered attack happens when the moving piece opens the line of attack of the piece behind it (a rook, bishop or queen). The moving piece gets a "free move" because the opponent has to answer the discovered threat.',
      'The most dangerous form is a discovered check: the moving piece can attack anything (for example capture a queen) while the opponent has to answer the check and has no time to recapture.',
      'A double check is stronger still: both pieces give check, so the only answer is to move the king.',
    ],
    points: [
      "Look for your piece standing in front of a rook or bishop, with the enemy king behind.",
      'The moving piece can threaten something valuable while opening a check.',
      'A double check forces the king to move; it cannot be answered by blocking or capturing.',
    ],
    demo: {
      intro: "The e4 knight stands in front of the e2 rook; Black's king on e8 is at the end of the same file. Black's queen on c5 is attacked by the knight.",
      notes: [
        'The knight captures the queen and opens the e-file at the same time: the e2 rook gives check. The king has to move, and the queen cannot be saved.',
        'The king steps aside. White wins the queen.',
      ],
    },
  },
  'mat-lorong': {
    title: 'Back-rank mate',
    summary: "The king is boxed in by its own pawns on the last rank.",
    body: [
      'A castled king with three pawns that have not moved in front of it has no way out; one rook or queen attack on the back rank can mean checkmate. It is the most common tactical theme at every level.',
      'Prevention: give the king a "window" (luft) by advancing one pawn (h3 or h6), or guard the back rank with a rook.',
      'Opportunity: when the opponent has a boxed-in king, check whether a rook or queen can reach the back rank, for example through a trade or a sacrifice that removes the defender.',
    ],
    points: [
      'Give the king luft (h3/h6) before it is too late.',
      'Do not move the rook guarding the first rank carelessly.',
      'Be careful with trades that remove the back-rank defender.',
    ],
    demo: {
      intro: "Black's king is boxed in by its own three pawns. White's rook is on the d-file.",
      notes: [
        'Checkmate! The rook gives check on the eighth rank; the king cannot run because f7, g7 and h7 are occupied by its own pawns.',
      ],
    },
  },
  rencana: {
    title: 'Judging a position and choosing a plan',
    summary: "Steinitz's checklist: material, king, activity, pawn structure.",
    body: [
      'When there is no tactic, you need a plan. Start by evaluating the position: (1) material: who is ahead? (2) king safety: whose king is more exposed? (3) piece activity: whose pieces are more active, whose are passive? (4) pawn structure: what are its strengths and weaknesses? (5) control of the centre and space.',
      "A good plan always relates to the opponent's weaknesses: attack weak pawns, take open files, place a knight on an outpost, or open lines to the enemy king. Without a plan, your moves tend to be random.",
      'Also ask: "Which of my pieces is placed worst?" and look for ways to improve it. Strong players often win not with tactics but by gradually improving their worst piece while stopping the opponent\'s plans (prophylaxis).',
    ],
    points: [
      'Improve your worst piece.',
      'Ask: "What does my opponent want?" and stop that first.',
      'If ahead, simplify; if behind, look for complications.',
      'Do not open the position if your opponent is better prepared there.',
    ],
  },
  pusat: {
    title: 'The centre and space',
    summary: 'The centre gives minor pieces room; space is a long-term advantage.',
    body: [
      "The owner of the centre can move pieces to either wing quickly. Space (more advanced pawns) restricts the opponent's pieces so that they get in each other's way.",
      'But a big centre can also become a target. The "hypermodern" defences (King\'s Indian, Grünfeld) deliberately let White occupy the centre and then attack it. So a centre is judged by how well it can be maintained, not just by how big it is.',
      'A simple rule: an attack on the wing only works if the centre is closed or stable; if the centre is open, the opponent can counter through the centre and an uncastled king becomes dangerous. In short: "answer a wing attack with a counter in the centre".',
    ],
    points: [
      'More space = pieces have more room; the opponent is more cramped.',
      'A big centre has to be maintained, not just built.',
      'Answer a wing attack with a counter in the centre.',
    ],
  },
  'struktur-bidak': {
    title: 'Pawn structure: strengths and weaknesses',
    summary: 'Pawns cannot go backwards: every push affects the whole game.',
    body: [
      'Pawns are the only pieces that cannot move backwards, so the pawn structure determines the character of the game. Structural weaknesses: an isolated pawn (no friendly pawn on the neighbouring files), doubled pawns (two pawns on one file) and a backward pawn (it cannot safely advance and nothing defends it).',
      'Structural strengths: a passed pawn (no enemy pawn on the same or neighbouring files ahead of it) and pawn chains that protect each other. A safe passed pawn is the greatest strength in the endgame; "passed pawns must be pushed."',
      'An isolated pawn is not always bad: it gives the minor pieces activity, but it has to be defended by pieces and becomes a target in the endgame. Doubled pawns are usually weak because they cannot protect each other and find it hard to form a passed pawn.',
    ],
    points: [
      "Isolani: a pawn with no friends on the next files, hard to defend.",
      'Doubled pawns: a weakness, but they sometimes give a rook an open file.',
      "Passed pawn: push it if it is protected, blockade it if it is the opponent's (with a knight).",
    ],
    demo: {
      intro: "White's d5 pawn is isolated: there is no White pawn on the c-file or the e-file.",
      notes: [
        "The d5 pawn cannot be defended by another pawn; only pieces and rooks can defend it. Black can attack it with ...c6, and the square in front of it (d6) becomes a comfortable blockade post for a Black knight. In the endgame the isolani is often a weakness.",
      ],
    },
  },
  outpost: {
    title: 'Outposts: safe posts for knights',
    summary: 'A square that enemy pawns cannot attack.',
    body: [
      "An outpost is a square in enemy territory that enemy pawns can no longer attack, usually supported by your own pawn. A knight sitting on an outpost can be very strong because it cannot be chased away.",
      'Knights are best on outposts because their range is short, so they are better off close to their targets. A knight on d5 (or e5, c5) supported by an e4 (or f4) pawn is often stronger than a bishop.',
      "How to find an outpost: look at the neighbouring files of the opponent where their pawns have advanced or disappeared. A square that no enemy pawn can attack is a candidate outpost.",
    ],
    points: [
      'An outpost is supported by your own pawn and cannot be attacked by enemy pawns.',
      'A knight on an outpost can be very dominant.',
      "Do not let the opponent occupy an outpost in your territory without a fight.",
    ],
    demo: {
      intro: "White's knight on d5 is supported by the e4 pawn. Black has no pawns on the c-file or e-file.",
      notes: [
        "The d5 knight cannot be chased away by a pawn: there is no Black pawn on the c-file (...c6) or the e-file (...e6) that could attack it. From there it eyes b6, c7, e7 and f6, and it can only be removed by a trade for a Black minor piece.",
      ],
    },
  },
  'kolom-terbuka': {
    title: 'Open files and the seventh rank',
    summary: 'Rooks need open lines; the seventh rank is the golden target.',
    body: [
      "A rook is strong on an open file (no pawns) or a semi-open file (none of your own pawns). Place the rook there, then enter enemy territory. A single rook on an open file often loses its meaning if the opponent can trade it; two rooks supporting each other are far stronger.",
      "The seventh rank (the opponent's second rank) is where the opponent's pawns are still on their starting squares and the king is often trapped. A rook on the seventh attacks many pawns at once and holds the king on the back rank.",
      'A rook on the seventh is often considered worth about a pawn (a guideline, not a law). Connect two rooks there and you often win, or at least get a permanent draw by perpetual check.',
    ],
    points: [
      'Rook to the open file, then to the seventh rank.',
      'Two connected rooks are stronger than two separate ones.',
      'Do not give up the only open file without compensation.',
    ],
    demo: {
      intro: 'One rook each. White controls the open d-file and can enter the seventh rank.',
      notes: [
        'The rook enters the seventh rank and attacks b7 (and f7, which is defended by the king). The engine picks this as the best move.',
        "Black defends passively: the rook is tied to defending b7 and the king defends f7. White's advantage is only about +0.3, so this is real pressure, not an automatic win. A rook on the seventh is still hard to dislodge.",
      ],
    },
  },
  'pasangan-gajah': {
    title: 'The bishop pair and good/bad bishops',
    summary: 'Two bishops complement each other; a bishop is judged by its pawns.',
    body: [
      'The bishop pair: having both bishops (one on light squares, one on dark squares) is a small but real advantage, especially in open positions. Two bishops control all the squares and attack from a distance.',
      'A "good" bishop is one whose own pawns are not on the same colour of squares (its movement is free). A "bad" bishop is blocked by its own pawns on the same colour. Trade the bad bishop if you can, or bring it out before closing it in (the heart of the London System).',
      "A bishop is better than a knight in open positions with pawns on both wings; a knight is better in closed positions and needs an outpost. A bishop and rook combination is superior in endgames with pawns on both wings.",
    ],
    points: [
      'The bishop pair: do not give it up easily without compensation.',
      'A bad bishop: trade it or bring it out first.',
      'Open positions favour bishops; closed positions favour knights.',
    ],
  },
};
