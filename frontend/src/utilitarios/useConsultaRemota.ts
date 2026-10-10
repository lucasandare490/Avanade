import { useEffect, useRef, useState } from 'react';
/** Evita misturar uma resposta antiga com filtros novos. Nada é persistido. */
export function useConsultaRemota<T>(chave: string, consultar: (sinal: AbortSignal) => Promise<T>) {
  const consultarRef = useRef(consultar);
  consultarRef.current = consultar;
  const [estado, definir] = useState<{
    chave: string;
    dados: T | null;
    erro: string;
    carregando: boolean;
  }>({ chave, dados: null, erro: '', carregando: true });
  const [versao, repetir] = useState(0);
  useEffect(() => {
    const controle = new AbortController();
    let ativo = true;
    definir({ chave, dados: null, erro: '', carregando: true });
    consultarRef
      .current(controle.signal)
      .then((dados) => {
        if (ativo) definir({ chave, dados, erro: '', carregando: false });
      })
      .catch((erro) => {
        if (ativo && !controle.signal.aborted)
          definir({
            chave,
            dados: null,
            erro: erro instanceof Error ? erro.message : 'Não foi possível consultar os dados.',
            carregando: false,
          });
      });
    return () => {
      ativo = false;
      controle.abort();
    };
  }, [chave, versao]);
  return {
    ...(estado.chave === chave ? estado : { chave, dados: null, erro: '', carregando: true }),
    recarregar: () => repetir((v) => v + 1),
  };
}
