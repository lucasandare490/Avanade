import { Botao } from './Botao';
import { useEffect, useRef } from 'react';
export function DialogoConfirmacao({
  titulo,
  descricao,
  confirmar,
  cancelar,
}: {
  titulo: string;
  descricao: string;
  confirmar: () => void;
  cancelar: () => void;
}) {
  const dialogo = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null;
    const atual = dialogo.current;
    atual?.showModal();
    return () => {
      atual?.close();
      anterior?.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialogo}
      className="dialogo-confirmacao"
      aria-labelledby="titulo-confirmacao"
      aria-describedby="descricao-confirmacao"
      onCancel={(e) => {
        e.preventDefault();
        cancelar();
      }}
    >
      <h2 id="titulo-confirmacao">{titulo}</h2>
      <p id="descricao-confirmacao">{descricao}</p>
      <div className="acoes-dialogo">
        <Botao autoFocus variante="secundario" onClick={cancelar}>
          Continuar na demonstração
        </Botao>
        <Botao variante="destrutivo" onClick={confirmar}>
          Encerrar e limpar cenário
        </Botao>
      </div>
    </dialog>
  );
}
