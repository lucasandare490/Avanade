import { useState, type FormEvent } from 'react';
import { Calculator } from 'lucide-react';
import { Aviso, CabecalhoPagina, Indicador, SeloSimulado } from '../componentes/ElementosInterface';
import { calcularExemplo, lerCentavos } from '../utilitarios/valoresFinanceiros';
export function TelaSimulacao() {
  const [valor, setValor] = useState('150,00'),
    [incluirTaxa, setIncluirTaxa] = useState(true),
    [erro, setErro] = useState(''),
    [resultado, setResultado] = useState<ReturnType<typeof calcularExemplo> | null>(null);
  function calcular(e: FormEvent) {
    e.preventDefault();
    const centavos = lerCentavos(valor);
    if (centavos === null) {
      setErro('Informe um valor positivo, sem separador de milhar. Exemplo: 150,00.');
      return;
    }
    setErro('');
    setResultado(calcularExemplo(centavos, 1000, incluirTaxa ? 200 : 0));
  }
  return (
    <>
      <CabecalhoPagina
        titulo="Simulação Split"
        descricao="Entenda o impacto das parcelas antes de registrar uma operação."
        acao={<SeloSimulado />}
      />
      <div className="grade-dupla">
        <section className="painel">
          <h2>
            <Calculator size={19} />
            Simular composição
          </h2>
          <p>Um exemplo para entender os números. Sem criar vendas ou movimentações.</p>
          <form onSubmit={calcular} className="formulario-vertical">
            <label className="campo">
              <span>Valor bruto (R$)</span>
              <input
                inputMode="decimal"
                required
                value={valor}
                onChange={(e) => {
                  setValor(e.target.value);
                  setResultado(null);
                }}
                aria-invalid={Boolean(erro)}
                aria-describedby={erro ? 'erro-simulacao' : undefined}
              />
            </label>
            <div className="regra-demo">
              <span>Tributo demonstrativo</span>
              <strong>10%</strong>
            </div>
            <label className="check">
              <input
                type="checkbox"
                checked={incluirTaxa}
                onChange={(e) => {
                  setIncluirTaxa(e.target.checked);
                  setResultado(null);
                }}
              />
              Incluir taxa demonstrativa de 2%
            </label>
            {erro && (
              <p className="erro" id="erro-simulacao" role="alert">
                {erro}
              </p>
            )}
            <button className="botao primario">Calcular simulação</button>
          </form>
        </section>
        <section className="painel">
          <h2>Como ler o resultado</h2>
          <ol className="lista-explicacao">
            <li>
              <strong>Bruto</strong>
              <p>É o valor total informado para o cenário.</p>
            </li>
            <li>
              <strong>Tributo e taxa</strong>
              <p>Parcelas separadas com os percentuais fictícios deste exemplo.</p>
            </li>
            <li>
              <strong>Líquido</strong>
              <p>O que resta após as parcelas incluídas na simulação.</p>
            </li>
          </ol>
          <Aviso>
            Os percentuais não são alíquotas oficiais. A simulação não substitui apuração fiscal.
          </Aviso>
        </section>
      </div>
      {resultado && (
        <section aria-live="polite">
          <div className="titulo-secao">
            <h2>Resultado da simulação</h2>
            <span>{incluirTaxa ? 'Com taxa de 2%' : 'Sem taxa de pagamento'}</span>
          </div>
          <div className="grade-indicadores">
            <Indicador
              titulo="BRUTO"
              valor={resultado.bruto}
              detalhe="Valor informado"
              tom="azul"
            />
            <Indicador
              titulo="TRIBUTO"
              valor={resultado.tributo}
              detalhe="Exemplo de 10%"
              tom="amarelo"
            />
            <Indicador
              titulo="TAXA"
              valor={resultado.taxa}
              detalhe={incluirTaxa ? 'Exemplo de 2%' : 'Não incluída'}
            />
            <Indicador
              titulo="LÍQUIDO"
              valor={resultado.liquido}
              detalhe="Não incluído no caixa"
              tom="verde"
            />
          </div>
        </section>
      )}
    </>
  );
}
