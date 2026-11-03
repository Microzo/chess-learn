import type { EngineLine, Evaluation } from '../../types';

export interface SearchLimit {
  depth?: number;
  movetime?: number;
}

/**
 * Pembungkus UCI untuk Stockfish di Web Worker.
 * Semua perintah diserialkan (satu pencarian pada satu waktu).
 */
export class Engine {
  private worker: Worker;
  private lineHandler: ((line: string) => void) | null = null;
  private chain: Promise<unknown> = Promise.resolve();
  readonly ready: Promise<void>;
  private currentSkill = -1;
  private currentMultiPv = 1;

  constructor(url = `${import.meta.env.BASE_URL}engine/stockfish-lite.js`) {
    this.worker = new Worker(url);
    this.worker.onmessage = (e: MessageEvent) => {
      const line = typeof e.data === 'string' ? e.data : String(e.data);
      this.lineHandler?.(line);
    };
    this.ready = this.handshake();
  }

  private send(cmd: string) {
    this.worker.postMessage(cmd);
  }

  private waitFor(pred: (line: string) => boolean): Promise<string> {
    return new Promise((resolve) => {
      this.lineHandler = (line) => {
        if (pred(line)) {
          this.lineHandler = null;
          resolve(line);
        }
      };
    });
  }

  private async handshake() {
    const uciok = this.waitFor((l) => l === 'uciok');
    this.send('uci');
    await uciok;
    const readyok = this.waitFor((l) => l === 'readyok');
    this.send('isready');
    await readyok;
  }

  private enqueue<T>(job: () => Promise<T>): Promise<T> {
    const run = this.chain.then(() => this.ready).then(job);
    this.chain = run.catch(() => undefined);
    return run;
  }

  private setSkill(skill: number) {
    if (skill === this.currentSkill) return;
    this.currentSkill = skill;
    this.send(`setoption name Skill Level value ${skill}`);
  }

  private setMultiPv(n: number) {
    if (n === this.currentMultiPv) return;
    this.currentMultiPv = n;
    this.send(`setoption name MultiPV value ${n}`);
  }

  private search(fen: string, limit: SearchLimit, skill: number, multipv = 1): Promise<EngineLine> {
    return this.enqueue(async () => {
      this.setSkill(skill);
      this.setMultiPv(multipv);
      const turn = (fen.split(' ')[1] ?? 'w') as 'w' | 'b';
      // satu entri per garis MultiPV (indeks 1 = terbaik)
      const lines = new Map<number, { eval: Evaluation; pv: string[] }>();
      let depth = 0;

      const done = new Promise<string>((resolve) => {
        this.lineHandler = (line) => {
          if (line.startsWith('info') && line.includes(' score ') && !line.includes('lowerbound') && !line.includes('upperbound')) {
            const d = /\bdepth (\d+)/.exec(line);
            const cp = /\bscore cp (-?\d+)/.exec(line);
            const mate = /\bscore mate (-?\d+)/.exec(line);
            const p = / pv (.+)$/.exec(line);
            const mp = /\bmultipv (\d+)/.exec(line);
            const idx = mp ? Number(mp[1]) : 1;
            if (d && idx === 1) depth = Number(d[1]);
            // Skor UCI dari sudut pandang pihak yang jalan -> ubah ke sudut pandang putih
            const sign = turn === 'w' ? 1 : -1;
            const prev = lines.get(idx) ?? { eval: { cp: 0, mate: null } as Evaluation, pv: [] as string[] };
            let evaluation = prev.eval;
            if (cp) evaluation = { cp: sign * Number(cp[1]), mate: null };
            else if (mate) evaluation = { cp: null, mate: sign * Number(mate[1]) };
            lines.set(idx, { eval: evaluation, pv: p ? p[1]!.trim().split(/\s+/) : prev.pv });
          } else if (line.startsWith('bestmove')) {
            this.lineHandler = null;
            resolve(line.split(/\s+/)[1] ?? '(none)');
          }
        };
      });

      this.send(`position fen ${fen}`);
      const go = limit.movetime ? `go movetime ${limit.movetime}` : `go depth ${limit.depth ?? 12}`;
      this.send(go);
      const best = await done;
      const first = lines.get(1) ?? { eval: { cp: 0, mate: null } as Evaluation, pv: [] as string[] };
      const second = lines.get(2);
      const secondUci = second?.pv[0];
      return {
        eval: first.eval,
        bestMoveUci: best,
        pv: first.pv,
        depth,
        ...(second && secondUci ? { second: { uci: secondUci, eval: second.eval } } : {}),
      };
    });
  }

  /** Analisa dengan kekuatan penuh. */
  analyse(fen: string, limit: SearchLimit = { depth: 12 }, multipv = 1): Promise<EngineLine> {
    return this.search(fen, limit, 20, multipv);
  }

  /** Langkah bot dengan kekuatan terbatas (Skill Level 0..20). */
  botMove(fen: string, skill: number, movetime: number): Promise<string> {
    return this.search(fen, { movetime }, skill).then((r) => r.bestMoveUci);
  }

  terminate() {
    this.worker.terminate();
  }
}
