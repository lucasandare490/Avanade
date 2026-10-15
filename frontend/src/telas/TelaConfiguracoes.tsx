import type { SessaoUsuario } from '../servicos/sessaoUsuario';
import { CabecalhoPagina } from '../componentes/ElementosInterface';
export function TelaConfiguracoes({
  demonstrativo = true,
  cenario = 'normal',
  mudarCenario,
  sessao,
  expirar,
}: {
  demonstrativo?: boolean;
  cenario?: string;
  sessao?: SessaoUsuario;
  expirar?: () => void;
  mudarCenario?: (valor: string) => void;
}) {
  return (
    <>
      <CabecalhoPagina
        titulo={demonstrativo ? 'Sobre esta demonstração' : 'Configurações e sessão'}
        descricao="Saiba o que está funcionando e o que depende da integração."
      />
      {expirar && (
        <button className="botao secundario" onClick={expirar}>
          Demonstrar sessão expirada
        </button>
      )}
      {mudarCenario && (
        <section className="painel">
          <h2>Estados da demonstração</h2>
          <p>
            Escolha um estado para visualizar nas telas. Nenhum registro será apagado; retorne ao
            cenário normal para recuperar a visualização.
          </p>
          <label className="campo">
            <span>Cenário das consultas</span>
            <select value={cenario} onChange={(e) => mudarCenario(e.target.value)}>
              <option value="normal">Dados disponíveis</option>
              <option value="vazio">Sem registros</option>
              <option value="carregando">Carregamento</option>
              <option value="erro">Serviço indisponível</option>
              <option value="negado">Acesso negado</option>
              <option value="desatualizado">Dados anteriores, atualização falhou</option>
            </select>
          </label>
        </section>
      )}
      <section className="painel">
        <h2>Estabelecimento</h2>
        <dl className="lista-configuracoes">
          <div>
            <dt>Nome</dt>
            <dd>{sessao?.loja ?? 'Mercadinho São João'}</dd>
          </div>
          <div>
            <dt>Perfil</dt>
            <dd>
              {sessao?.nome ?? 'Maria'}
              {demonstrativo ? ' · demonstração' : ''}
            </dd>
          </div>
          <div>
            <dt>Modo</dt>
            <dd>
              {demonstrativo
                ? 'Simulado, sem movimentação financeira'
                : 'Conectado ao serviço configurado'}
            </dd>
          </div>
          <div>
            <dt>Referência dos dados</dt>
            <dd>{demonstrativo ? '09/10/2026' : 'Informada nas consultas do servidor'}</dd>
          </div>
          <div>
            <dt>Armazenamento</dt>
            <dd>
              {demonstrativo
                ? 'Somente na memória desta página. Recarregar restaura o cenário inicial.'
                : 'Dados consultados no servidor; credenciais não são gravadas no armazenamento do navegador.'}
            </dd>
          </div>
        </dl>
      </section>
      {demonstrativo && (
        <section className="painel">
          <h2>Integração e próximos passos</h2>
          <p>
            Este modo usa dados locais. O modo integrado já utiliza login, permissões e banco do
            servidor demonstrativo. Regras oficiais, projeções, recorrência e alterações de
            configurações não estão disponíveis nesta entrega.
          </p>
          <p>
            O modo POS desta interface demonstra o fluxo no navegador. Não substitui o aplicativo
            Android. O APK demonstrativo já foi gerado; a integração com este backend e a
            validação em dispositivo continuam pendentes.
          </p>
          <p>
            Não há pagamento real, emissão fiscal, crédito ou conexão com IA externa nesta versão.
          </p>
        </section>
      )}
      <section className="painel">
        <h2>Recursos de demonstração</h2>
        <p>
          {demonstrativo
            ? 'No modo demonstrativo, a consulta de operações permite exportar o filtro em CSV e o detalhe oferece impressão sem valor fiscal.'
            : 'No modo integrado, contas com acesso financeiro podem exportar operações filtradas em CSV, até 2.000 registros. Os valores estão em centavos BRL; não é comprovante fiscal.'}
        </p>
        <a className="botao secundario" href="#/previa-acesso">
          Conhecer as telas de acesso
        </a>{' '}
        <a className="botao secundario" href="#/ajuda">
          Abrir guia de uso
        </a>
      </section>
      <section className="painel">
        <h2>Créditos e referência</h2>
        <p>
          Design e prototipação de alta fidelidade: Thayná Batista da Silva. Documentação de
          requisitos: Thayná Batista da Silva e Kleysson Teixeira.
        </p>
        <p>Projeto acadêmico Squad 19 · GrowUp/Senac com Avanade.</p>
        <a
          className="link"
          href="https://www.figma.com/make/tJXFL2o4nYoZnZARUCkBLQ/Planner-Comercial-MVP-Design"
          target="_blank"
          rel="noreferrer"
        >
          Abrir protótipo de referência ↗
        </a>
      </section>
    </>
  );
}
