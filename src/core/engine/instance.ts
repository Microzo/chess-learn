import { Analyzer } from '../analysis/analyzer';
import { Engine } from './engine';

let engine: Engine | null = null;
let analyzer: Analyzer | null = null;

/** Satu engine dipakai bersama seluruh aplikasi (hemat memori di HP). */
export function getEngine(): Engine {
  engine ??= new Engine();
  return engine;
}

export function getAnalyzer(): Analyzer {
  analyzer ??= new Analyzer(getEngine());
  return analyzer;
}

/** Tunggu engine siap; gagal jika lebih dari `ms`. */
export async function engineReady(ms = 20000): Promise<void> {
  await Promise.race([
    getEngine().ready,
    new Promise<never>((_, rej) => setTimeout(() => rej(new Error('Engine tidak merespons')), ms)),
  ]);
}
