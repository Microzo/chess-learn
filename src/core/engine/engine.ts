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

  private search(fen: string, limit: SearchLimit, skill: number): Promise<EngineLine> {
    return this.enqueue(async () => {
      this.setSkill(skill);
      const turn = (fen.split(' ')[1] ?? 'w') as 'w' | 'b';
      let evaluation: Evaluation = { cp: 0, mate: null };
      let pv: string[] = [];
      let depth = 0;

      const done = new Promise<string>((resolve) => {
        this.lineHandler = (line) => {
          if (line.startsWith('info') && line.includes(' score ') && !line.includes('lowerbound') && !line.includes('upperbound')) {
            const d = /\bdepth (\d+)/.exec(line);
            const cp = /\bscore cp (-?\d+)/.exec(line);
            const mate = /\bscore mate (-?\d+)/.exec(line);
            const p = / pv (.+)$/.exec(line);
            if (d) depth = Number(d[1]);
            // Skor UCI dari sudut pandang pihak yang jalan -> ubah ke sudut pandang putih
            const sign = turn === 'w' ? 1 : -1;
            if (cp) evaluation = { cp: sign * Number(cp[1]), mate: null };
            else if (mate) evaluation = { cp: null, mate: sign * Number(mate[1]) };
            if (p) pv = p[1]!.trim().split(/\s+/);
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
      return { eval: evaluation, bestMoveUci: best, pv, depth };
    });
  }

  /** Analisa dengan kekuatan penuh. */
  analyse(fen: string, limit: SearchLimit = { depth: 12 }): Promise<EngineLine> {
    return this.search(fen, limit, 20);
  }

  /** Langkah bot dengan kekuatan terbatas (Skill Level 0..20). */
  botMove(fen: string, skill: number, movetime: number): Promise<string> {
    return this.search(fen, { movetime }, skill).then((r) => r.bestMoveUci);
  }

  terminate() {
    this.worker.terminate();
  }
}
