import type { ServicoPlanner } from '../tipos';
import { useConsultaRemota } from '../utilitarios/useConsultaRemota';
export function PainelExplicacaoSplit({ id, servico }: { id: string; servico: ServicoPlanner }) {
  const consulta = useConsultaRemota(id, (sinal) => servico.explicarSplit!(id, sinal));
  return (
    <section className="painel">
      <h2>Entenda este split</h2>
      {consulta.carregando ? (
        <p role="status">Preparando explicação…</p>
      ) : consulta.erro ? (
        <>
          <p role="alert">A explicação está indisponível. Os dados da operação continuam acima.</p>
          <button className="botao secundario" onClick={consulta.recarregar}>
            Tentar explicação novamente
          </button>
        </>
      ) : (
        consulta.dados && (
          <>
            <p>{consulta.dados.texto}</p>
            {consulta.dados.limitacoes.map((item, i) => (
              <p className="nota" key={i}>
                {item}
              </p>
            ))}
          </>
        )
      )}
    </section>
  );
}
