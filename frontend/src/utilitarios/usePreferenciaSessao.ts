import { useState } from 'react';

// Guarda somente preferências de consulta, nunca operações, senhas ou tokens.
export function usePreferenciaSessao(chave: string, inicial: string) {
  const [valor, definir] = useState(() => {
    try {
      return sessionStorage.getItem(`planner:filtro:${chave}`) ?? inicial;
    } catch {
      return inicial;
    }
  });
  function atualizar(proximo: string) {
    definir(proximo);
    try {
      sessionStorage.setItem(`planner:filtro:${chave}`, proximo);
    } catch {
      /* Navegação funciona mesmo com armazenamento bloqueado. */
    }
  }
  return [valor, atualizar] as const;
}
export function limparPreferenciasSessao() {
  try {
    Object.keys(sessionStorage)
      .filter((chave) => chave.startsWith('planner:filtro:'))
      .forEach((chave) => sessionStorage.removeItem(chave));
  } catch {
    /* Sem armazenamento disponível. */
  }
}
