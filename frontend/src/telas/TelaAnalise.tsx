import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { BaseDemonstracao } from '../tipos';
import { Aviso, CabecalhoPagina, Estado } from '../componentes/ElementosInterface';
import { dentroPeriodo, moeda, resumir } from '../utilitarios/valoresFinanceiros';
export function TelaAnalise({ base }: { base: BaseDemonstracao }) {
  const [estado, setEstado] = useState('normal');
  const [inicio, setInicio] = useState('2026-10-01'),
    [fim, setFim] = useState('2026-10-09');
  const operacoes = base.operacoes.filter((o) => dentroPeriodo(o.data, inicio, fim));
  const despesas = base.despesas.filter((d) => dentroPeriodo(d.data, inicio, fim));
  const r = resumir(operacoes, despesas);
  return (
    <>
      <CabecalhoPagina
        titulo="Análise com IA"
        descricao="Mais clareza para interpretar os números do seu negócio."
        acao={<span className="mini-selo">EXPLICAÇÃO DEMONSTRATIVA</span>}
      />
      <Aviso>
        Esta versão usa um texto determinístico baseado nos dados locais. Não há conexão com um
        modelo de IA. Os cálculos não são feitos pela IA.
      </Aviso>
      <div className="painel filtros">
        <label className="campo">
          <span>Análise de</span>
          <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
        </label>
        <label className="campo">
          <span>Análise até</span>
          <input type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
        </label>
      </div>
      <section className="painel">
        <div className="titulo-painel">
          <h2>
            <Sparkles size={20} />
            Resumo do cenário
          </h2>
          <label className="campo">
            <span>Visualizar estado</span>
            <select value={estado} onChange={(e) => setEstado(e.target.value)}>
              <option value="normal">Explicação disponível</option>
              <option value="carregando">Carregamento demonstrativo</option>
              <option value="timeout">Tempo de espera excedido</option>
              <option value="erro">Serviço indisponível</option>
              <option value="vazio">Dados insuficientes</option>
            </select>
          </label>
        </div>
        {inicio > fim ? (
          <Estado
            titulo="Confira o período"
            descricao="A data final deve ser igual ou posterior à inicial."
          />
        ) : estado === 'carregando' ? (
          <Estado titulo="Preparando explicação demonstrativa" carregando />
        ) : estado === 'erro' || estado === 'timeout' ? (
          <Estado
            titulo="Não foi possível obter a explicação"
            descricao="Suas operações e valores continuam disponíveis."
            acao={
              <button className="botao secundario" onClick={() => setEstado('normal')}>
                Tentar novamente no cenário
              </button>
            }
          />
        ) : estado === 'vazio' || operacoes.length === 0 ? (
          <Estado
            titulo="Ainda não há dados suficientes"
            descricao="Uma explicação precisa de operações e período identificados."
          />
        ) : (
          <div className="texto-analise">
            <h3>Das vendas ao dinheiro disponível</h3>
            <p>
              As {r.quantidade} operações concluídas somam <strong>{moeda(r.bruto)}</strong> de
              valor bruto. Nesse conjunto, foram separados <strong>{moeda(r.tributo)}</strong> de
              tributo demonstrativo e <strong>{moeda(r.taxa)}</strong> de taxas.
            </p>
            <p>
              As entradas líquidas são de <strong>{moeda(r.liquido)}</strong>. Com{' '}
              <strong>{moeda(r.saidas)}</strong> em despesas pagas e saldo inicial de zero, o saldo
              demonstrativo é de <strong>{moeda(r.saldo)}</strong>.
            </p>
            <h3>O que ainda precisa de atenção</h3>
            <p>
              {operacoes.filter((o) => o.status !== 'concluida').length} operações não estão
              concluídas. Seus valores líquidos não foram incluídos no caixa.
            </p>
            <p>
              Não há previsão de caixa ou comparação de crescimento neste cenário. Essas análises
              precisam de premissas e períodos compatíveis.
            </p>
            <a className="botao secundario" href="#/fluxo-caixa">
              Conferir movimentações
            </a>
          </div>
        )}
      </section>
    </>
  );
}
