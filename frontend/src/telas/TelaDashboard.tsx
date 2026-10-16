import { ArrowRight, Plus, Sparkles, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import type { BaseDemonstracao } from '../tipos';
import {
  CabecalhoPagina,
  Indicador,
  SeloSimulado,
  Status,
} from '../componentes/ElementosInterface';
import { dentroPeriodo, moeda, resumir, dataCurta } from '../utilitarios/valoresFinanceiros';
export function TelaDashboard({ base, nome = 'Maria' }: { base: BaseDemonstracao; nome?: string }) {
  const [periodo, setPeriodo] = useState('30');
  const inicio = periodo === '1' ? '2026-10-09' : periodo === '7' ? '2026-10-03' : '2026-09-10';
  const operacoes = base.operacoes.filter((o) => dentroPeriodo(o.data, inicio, '2026-10-09'));
  const despesas = base.despesas.filter((d) => dentroPeriodo(d.data, inicio, '2026-10-09'));
  const r = resumir(operacoes, despesas);
  const partes = [
    { nome: 'Tributo separado', valor: r.tributo, classe: 'tributo' },
    { nome: 'Taxas', valor: r.taxa, classe: 'taxa' },
    { nome: 'Valor líquido', valor: r.liquido, classe: 'liquido' },
  ];
  // O gráfico cobre o mesmo intervalo dos indicadores, inclusive dias sem movimento.
  const quantidadeDias = Number(periodo);
  const dias = Array.from({ length: quantidadeDias }, (_, i) => {
    const data = new Date('2026-10-09T12:00:00Z');
    data.setUTCDate(data.getUTCDate() - quantidadeDias + 1 + i);
    return data.toISOString().slice(0, 10);
  });
  const tamanhoGrupo = quantidadeDias > 7 ? 6 : 1;
  const series = dias
    .filter((_, i) => i % tamanhoGrupo === 0)
    .map((d, i) => {
      const ultimo = dias[Math.min(dias.length - 1, i * tamanhoGrupo + tamanhoGrupo - 1)];
      return {
        data: d,
        rotulo: d === ultimo ? dataCurta(d) : `${dataCurta(d)}–${dataCurta(ultimo)}`,
        valor: resumir(
          operacoes.filter((o) => dentroPeriodo(o.data, d, ultimo)),
          [],
        ).liquido,
      };
    });
  const max = Math.max(1, ...series.map((s) => s.valor));
  return (
    <>
      <CabecalhoPagina
        titulo={`Olá, ${nome}`}
        descricao="Acompanhe o split de cada operação e o caixa líquido."
        acao={
          <div className="seletor-periodo" role="group" aria-label="Período">
            {[
              ['1', 'Hoje'],
              ['7', '7 dias'],
              ['30', '30 dias'],
            ].map(([v, t]) => (
              <button key={v} onClick={() => setPeriodo(v)} aria-pressed={periodo === v}>
                {t}
              </button>
            ))}
          </div>
        }
      />
      <p className="contexto-dados">
        <span className="ponto-amarelo" />
        DADOS DEMONSTRATIVOS <span>Referência: 09 de outubro de 2026</span>
      </p>
      <section aria-labelledby="titulo-split">
        <div className="titulo-secao">
          <div>
            <h2 id="titulo-split">Núcleo de Split Payment</h2>
            <p>Separação, roteamento e registro das operações</p>
          </div>
          <SeloSimulado />
        </div>
        <div className="grade-indicadores">
          <Indicador
            titulo="TOTAL BRUTO"
            valor={r.bruto}
            detalhe={`${r.quantidade} operações concluídas no período`}
            tom="azul"
          />
          <Indicador
            titulo="TRIBUTO SEPARADO"
            valor={r.tributo}
            detalhe="Regra demonstrativa · 10%"
            tom="amarelo"
          />
          <Indicador titulo="TAXAS" valor={r.taxa} detalhe="Processamento demonstrativo · 2%" />
          <Indicador
            titulo="VALOR LÍQUIDO"
            valor={r.liquido}
            detalhe="Entradas após o split concluído"
            tom="verde"
          />
        </div>
      </section>
      <div className="grade-dupla">
        <section className="painel">
          <div className="titulo-painel">
            <h2>Composição do bruto</h2>
            <SeloSimulado />
          </div>
          <div
            role="img"
            className="barra-composicao"
            aria-label="Distribuição dos valores concluídos"
          >
            {partes.map((p) => (
              <span
                key={p.nome}
                className={p.classe}
                style={{ width: `${r.bruto ? (p.valor / r.bruto) * 100 : 0}%` }}
              />
            ))}
          </div>
          <div className="legenda-composicao">
            {partes.map((p) => (
              <div key={p.nome}>
                <span>
                  <i className={p.classe} />
                  {p.nome}
                </span>
                <strong>{r.bruto ? ((p.valor / r.bruto) * 100).toFixed(0) : 0}%</strong>
              </div>
            ))}
          </div>
          <p className="nota bloco">
            Valores fictícios para demonstração. Não há recolhimento de tributos nem transferência
            de dinheiro.
          </p>
        </section>
        <section className="painel">
          <div className="titulo-painel">
            <div>
              <h2>Últimas operações</h2>
              <p>Bruto → líquido após split</p>
            </div>
            <a href="#/operacoes" className="link">
              Ver todas <ArrowRight size={14} />
            </a>
          </div>
          <div className="ultimas-operacoes">
            {operacoes.slice(0, 3).map((o) => (
              <a href={`#/operacoes/${o.id}`} key={o.id}>
                <div>
                  <strong>{o.id}</strong>
                  <small>
                    {dataCurta(o.data)} · {o.meio}
                  </small>
                </div>
                <div className="numero">
                  <small>Bruto {moeda(o.bruto)}</small>
                  <strong>{moeda(o.liquido)}</strong>
                </div>
                <Status valor={o.status} />
              </a>
            ))}
          </div>
        </section>
      </div>
      <div className="titulo-secao">
        <div>
          <h2>Planner financeiro</h2>
          <p>Caixa realizado · saldo inicial demonstrativo de R$ 0,00</p>
        </div>
        <a href="#/fluxo-caixa" className="link">
          Ver fluxo de caixa <ArrowRight size={15} />
        </a>
      </div>
      <div className="grade-indicadores tres">
        <Indicador
          titulo="SALDO DO PERÍODO"
          valor={r.saldo}
          detalhe="Entradas líquidas menos despesas"
        />
        <Indicador
          titulo="ENTRADAS LÍQUIDAS"
          valor={r.liquido}
          detalhe="Somente operações concluídas"
        />
        <Indicador
          titulo="DESPESAS PAGAS"
          valor={r.saidas}
          detalhe="Saídas registradas no período"
        />
      </div>
      <div className="grade-dupla grafico-analise">
        <section className="painel">
          <div className="titulo-painel">
            <div>
              <h2>Vendas líquidas por período</h2>
              <p>Entradas confirmadas · {dataCurta(inicio)} a 09 de outubro</p>
            </div>
            <TrendingUp size={20} className="texto-verde" />
          </div>
          <div
            className="grafico-barras"
            role="img"
            aria-label={series.map((s) => `${s.rotulo}: ${moeda(s.valor)}`).join('; ')}
          >
            {series.map((s) => (
              <div className="coluna-grafico" key={s.data}>
                <span className="valor-coluna">{moeda(s.valor)}</span>
                <div className="trilho-coluna">
                  <div style={{ height: `${Math.max(s.valor ? 3 : 0, (s.valor / max) * 100)}%` }} />
                </div>
                <small>{s.rotulo}</small>
              </div>
            ))}
          </div>
          <details className="dados-grafico">
            <summary>Ver valores do gráfico em tabela</summary>
            <div className="tabela-rolavel" tabIndex={0} role="region" aria-label="Entradas líquidas por intervalo">
            <table>
              <caption className="somente-leitor">Entradas líquidas por intervalo</caption>
              <thead>
                <tr>
                  <th>Intervalo</th>
                  <th className="numero">Entradas</th>
                </tr>
              </thead>
              <tbody>
                {series.map((s) => (
                  <tr key={s.data}>
                    <td>{s.rotulo}</td>
                    <td className="numero">{moeda(s.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </details>
        </section>
        <section className="painel painel-ia">
          <div className="titulo-painel">
            <h2>
              <Sparkles size={18} /> Análise inteligente
            </h2>
            <span className="mini-selo">EXEMPLO</span>
          </div>
          <h3>Seu caixa, com mais clareza.</h3>
          <p>
            As {r.quantidade} operações concluídas geraram <strong>{moeda(r.liquido)}</strong> em
            entradas líquidas neste período.
          </p>
          <p>
            Após as despesas registradas, o resultado é de <strong>{moeda(r.saldo)}</strong>.
            Operações pendentes ou com falha não entram neste saldo demonstrativo.
          </p>
          <a className="link" href="#/analise">
            Entender os números <ArrowRight size={15} />
          </a>
          <small>Explicação demonstrativa. A IA não altera valores.</small>
        </section>
      </div>
      <section className="acoes-rapidas">
        <h2>AÇÕES RÁPIDAS</h2>
        <div>
          <a href="#/venda-demonstrativa">
            <Plus size={19} />
            Registrar venda demo
          </a>
          <a href="#/despesas">
            <Plus size={19} />
            Registrar despesa
          </a>
          <a href="#/simulacao">
            %<span>Simular impacto</span>
          </a>
          <a href="#/fluxo-caixa">
            <TrendingUp size={19} />
            Ver fluxo de caixa
          </a>
        </div>
      </section>
    </>
  );
}
