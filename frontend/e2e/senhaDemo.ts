import { readFileSync } from 'node:fs';

/**
 * Senha das contas de demonstração do servidor local. Lida só quando um teste a usa,
 * para que listar os testes (por exemplo, no CI) não dependa do arquivo local.
 */
export function senhaDemo(): string {
  return process.env.DEMO_PASSWORD || readFileSync('../backend/.local/demo-password', 'utf8').trim();
}
