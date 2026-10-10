import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Inbox,
  LoaderCircle,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type { Operacao, StatusOperacao } from '../tipos';
import { dataCurta, moeda } from '../utilitarios/valoresFinanceiros';
export function CabecalhoPagina({
  titulo,
  descricao,
  acao,
}: {
  titulo: string;
  descricao: string;
  acao?: ReactNode;
}) {
  return (
    <div className="cabecalho-pagina">
      <div>
        <h1>{titulo}</h1>
        <p>{descricao}</p>
      </div>
      {acao}
    </div>
  );
}
export function SeloSimulado() {
  return <span className="selo-simulado">SIMULADO</span>;
}
export function Estado({
  titulo,
  descricao,
  carregando = false,
  acao,
}: {
  titulo: string;
  descricao?: string;
  carregando?: boolean;
  acao?: ReactNode;
}) {
  return (
    <div className="estado" role="status">
      {carregando ? <LoaderCircle className="girando" /> : <Inbox />}
      <h2>{titulo}</h2>
      {descricao && <p>{descricao}</p>}
      {acao}
    </div>
  );
}
export function Aviso({ children }: { children: ReactNode }) {
  return (
    <div className="aviso">
      <AlertCircle size={18} aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
export function Status({ valor }: { valor: StatusOperacao }) {
  const Icone = valor === 'concluida' ? CheckCircle2 : valor === 'pendente' ? Clock3 : AlertCircle;
  return (
    <span className={`status ${valor}`}>
      <Icone size={13} aria-hidden="true" />
      {valor === 'concluida'
        ? 'Concluída'
        : valor === 'pendente'
          ? 'Pendente'
          : valor === 'falha'
            ? 'Falha parcial'
            : 'Estado não reconhecido'}
    </span>
  );
}
export function Indicador({
  titulo,
  valor,
  detalhe,
  tom = '',
  periodo,
  carregando = false,
}: {
  titulo: string;
  valor: number | null;
  detalhe: string;
  tom?: string;
  periodo?: string;
  carregando?: boolean;
}) {
  return (
    <div className={`indicador ${tom}`} aria-busy={carregando}>
      <span>{titulo}</span>
      <strong>
        {carregando ? 'Carregando…' : valor === null ? 'Não informado' : moeda(valor)}
      </strong>
      {periodo && <small>{periodo}</small>}
      <small>{detalhe}</small>
    </div>
  );
}
export function TabelaOperacoes({
  operacoes,
  demonstrativo = true,
}: {
  operacoes: Operacao[];
  demonstrativo?: boolean;
}) {
  return (
    <div
      className="tabela-rolavel"
      tabIndex={0}
      role="region"
      aria-label="Tabela de operações; role horizontalmente para ver todas as colunas"
    >
      <table>
        <caption className="somente-leitor">
          {demonstrativo ? 'Operações de split demonstrativas' : 'Operações de split'}
        </caption>
        <thead>
          <tr>
            <th>Operação</th>
            <th>Data</th>
            <th>Pagamento</th>
            <th className="numero">Bruto</th>
            <th className="numero">Tributo</th>
            <th className="numero">Taxa</th>
            <th className="numero">Líquido previsto</th>
            <th>Status</th>
            <th>
              <span className="somente-leitor">Abrir</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {operacoes.map((o) => (
            <tr key={o.id}>
              <td>
                <a className="link-operacao" href={`#/operacoes/${o.id}`}>
                  {o.id}
                </a>
              </td>
              <td>{dataCurta(o.data)}</td>
              <td>{o.meio}</td>
              <td className="numero">{moeda(o.bruto)}</td>
              <td className="numero">{moeda(o.tributo)}</td>
              <td className="numero">{moeda(o.taxa)}</td>
              <td className="numero destaque-liquido">{moeda(o.liquido)}</td>
              <td>
                <Status valor={o.status} />
              </td>
              <td>
                <a className="botao-icone" href={`#/operacoes/${o.id}`} aria-label={`Ver ${o.id}`}>
                  <ArrowUpRight size={17} />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function Direcao({ entrada }: { entrada: boolean }) {
  return entrada ? (
    <ArrowDownLeft className="texto-verde" size={18} />
  ) : (
    <ArrowUpRight className="texto-vermelho" size={18} />
  );
}
