import { FalhaTransporte } from '../servicos/transporteApi';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Smartphone } from 'lucide-react';
import { Aviso, CabecalhoPagina, SeloSimulado } from '../componentes/ElementosInterface';
import type { MeioPagamento, NovaVenda, ResultadoVenda } from '../tipos';
import { lerCentavos, moeda } from '../utilitarios/valoresFinanceiros';
export function TelaVendaDemonstrativa({
  registrar,
  recuperar,
  pendente = false,
  demonstrativo = true,
  informarTentativa,
}: {
  demonstrativo?: boolean;
  registrar: (v: NovaVenda) => Promise<ResultadoVenda>;
  recuperar?: () => Promise<ResultadoVenda>;
  pendente?: boolean;
  informarTentativa?: (ativa: boolean) => void;
}) {
  const [valor, setValor] = useState('150,00'),
    [meio, setMeio] = useState<MeioPagamento>('PIX'),
    [cenario, setCenario] = useState<NovaVenda['cenario']>('sucesso'),
    [revisar, setRevisar] = useState(pendente),
    [ocupado, setOcupado] = useState(false),
    [respostaDesconhecida, setRespostaDesconhecida] = useState(pendente),
    [erro, setErro] = useState('');
  const chave = useRef(crypto.randomUUID()),
    bloqueio = useRef(false);
  useEffect(() => {
    if (!respostaDesconhecida && !ocupado) return;
    const avisar = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', avisar);
    return () => window.removeEventListener('beforeunload', avisar);
  }, [respostaDesconhecida, ocupado]);
  useEffect(() => {
    informarTentativa?.(ocupado || respostaDesconhecida);
  }, [ocupado, respostaDesconhecida, informarTentativa]);
  function preparar(e: FormEvent) {
    e.preventDefault();
    if (lerCentavos(valor) === null) {
      setErro('Informe um valor positivo até R$ 1.000.000,00, sem ponto de milhar.');
      return;
    }
    setErro('');
    setRevisar(true);
  }
  async function confirmar() {
    if (bloqueio.current) return;
    bloqueio.current = true;
    setOcupado(true);
    setErro('');
    try {
      const o =
        respostaDesconhecida && recuperar
          ? await recuperar()
          : await registrar({
              chave: chave.current,
              bruto: lerCentavos(valor)!,
              meio,
              cenario,
            });
      setRevisar(false);
      setRespostaDesconhecida(false);
      setValor('150,00');
      chave.current = crypto.randomUUID();
      location.hash = 'tipo' in o ? `/vendas/${o.id}` : `/operacoes/${o.id}`;
    } catch (e) {
      setRespostaDesconhecida(
        pendente ||
          cenario === 'resposta-perdida' ||
          (e instanceof FalhaTransporte && (e.codigo === 0 || e.codigo >= 500)),
      );
      setErro(e instanceof Error ? e.message : 'Não foi possível confirmar.');
    } finally {
      bloqueio.current = false;
      setOcupado(false);
    }
  }
  return (
    <>
      <CabecalhoPagina
        titulo={demonstrativo ? 'Nova venda demonstrativa' : 'Nova venda'}
        descricao="Explore o fluxo de venda e acompanhe a separação das parcelas."
        acao={demonstrativo ? <SeloSimulado /> : undefined}
      />
      <Aviso>
        {demonstrativo
          ? 'Demonstração web do fluxo POS, sem movimentação real.'
          : 'Vendas persistidas no servidor de demonstração. Pagamentos e tributos são simulados, sem movimentação real.'}
      </Aviso>
      <section className="painel formulario-venda">
        <div className="icone-destaque">
          <Smartphone />
        </div>
        <h2>{revisar ? 'Confira a venda' : 'Registrar uma venda'}</h2>
        {!revisar ? (
          <form onSubmit={preparar} className="formulario-vertical">
            <label className="campo">
              <span>Valor da venda (R$)</span>
              <input
                className="entrada-valor"
                inputMode="decimal"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                required
                aria-invalid={Boolean(erro)}
                aria-describedby={erro ? 'erro-venda' : undefined}
              />
            </label>
            <label className="campo">
              <span>{demonstrativo ? 'Meio de pagamento simulado' : 'Meio de pagamento'}</span>
              <select value={meio} onChange={(e) => setMeio(e.target.value as MeioPagamento)}>
                <option>PIX</option>
                <option>Débito</option>
                <option>Crédito</option>
              </select>
            </label>
            {demonstrativo && (
              <label className="campo">
                <span>Cenário de demonstração</span>
                <select
                  value={cenario}
                  onChange={(e) => setCenario(e.target.value as NovaVenda['cenario'])}
                >
                  <option value="sucesso">Pagamento e split concluídos</option>
                  <option value="falha">Falha parcial, com possibilidade de retomada</option>
                  <option value="recusa">Pagamento recusado, sem criar operação</option>
                  <option value="resposta-perdida">Resposta perdida após confirmação</option>
                </select>
              </label>
            )}
            {demonstrativo && (
              <p className="nota">
                Regra fictícia: tributo 10% e taxa 2%. Nenhum dinheiro será movimentado.
              </p>
            )}
            <button className="botao primario">Revisar venda</button>
          </form>
        ) : (
          <div className="formulario-vertical">
            {respostaDesconhecida && recuperar ? (
              <p role="status">
                Existe uma tentativa sem confirmação. Recupere os dados enviados antes de iniciar
                outra venda.
              </p>
            ) : (
              <strong className="valor-revisao">{moeda(lerCentavos(valor)!)}</strong>
            )}
            <p>
              {meio} ·{' '}
              {!demonstrativo
                ? 'Valores e estado confirmados pelo serviço'
                : cenario === 'sucesso'
                  ? 'Sucesso simulado'
                  : cenario === 'falha'
                    ? 'Falha parcial simulada'
                    : cenario === 'recusa'
                      ? 'Recusa simulada'
                      : 'Resposta perdida após confirmação'}
            </p>
            <button className="botao primario" disabled={ocupado} onClick={confirmar}>
              {ocupado
                ? 'Consultando tentativa…'
                : respostaDesconhecida
                  ? 'Consultar a mesma tentativa'
                  : demonstrativo
                    ? 'Confirmar venda simulada'
                    : 'Confirmar venda'}
            </button>
            <button
              className="botao secundario"
              disabled={ocupado || respostaDesconhecida}
              onClick={() => {
                setRevisar(false);
                chave.current = crypto.randomUUID();
                setErro('');
              }}
            >
              Voltar e editar
            </button>
          </div>
        )}
        {erro && (
          <p className="erro" id="erro-venda" role="alert">
            {erro}
          </p>
        )}
      </section>
    </>
  );
}
