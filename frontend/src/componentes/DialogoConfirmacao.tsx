import { Botao } from './Botao';
import { useEffect, useRef } from 'react';
export function DialogoConfirmacao({
  titulo,
  descricao,
  confirmar,
  cancelar,
  rotuloCancelar = 'Continuar na demonstração',
  rotuloConfirmar = 'Encerrar e limpar cenário',
}: {
  titulo: string;
  descricao: string;
  confirmar: () => void;
  cancelar: () => void;
  rotuloCancelar?: string;
  rotuloConfirmar?: string;
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
      onKeyDown={(e) => {
        if (e.key !== 'Tab') return;
        const controles = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')];
        const primeiro = controles[0];
        const ultimo = controles[controles.length - 1];
        if (e.shiftKey && document.activeElement === primeiro) {
          e.preventDefault(); ultimo?.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault(); primeiro?.focus();
        }
      }}
      onCancel={(e) => {
        e.preventDefault();
        cancelar();
      }}
    >
      <h2 id="titulo-confirmacao">{titulo}</h2>
      <p id="descricao-confirmacao">{descricao}</p>
      <div className="acoes-dialogo">
        <Botao autoFocus variante="secundario" onClick={cancelar}>
          {rotuloCancelar}
        </Botao>
        <Botao variante="destrutivo" onClick={confirmar}>
          {rotuloConfirmar}
        </Botao>
      </div>
    </dialog>
  );
}
