import { useEffect, useState } from 'react';
export function AvisoConexao() {
  const [offline, definir] = useState(!navigator.onLine);
  useEffect(() => {
    const atualizar = () => definir(!navigator.onLine);
    window.addEventListener('online', atualizar);
    window.addEventListener('offline', atualizar);
    return () => {
      window.removeEventListener('online', atualizar);
      window.removeEventListener('offline', atualizar);
    };
  }, []);
  return offline ? (
    <p className="aviso" role="status">
      Você está sem conexão. O cenário já carregado continua disponível nesta página. Nenhuma
      operação será enviada ou sincronizada com um servidor.
    </p>
  ) : null;
}
