import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  CircleDollarSign,
  CreditCard,
  Home,
  UserRound,
  Wallet,
  Zap,
} from 'lucide-react';

type Pagina =
  | 'inicio'
  | 'venda'
  | 'processando'
  | 'resultado'
  | 'falha'
  | 'operacoes'
  | 'registro'
  | 'caixa'
  | 'projecao'
  | 'despesas'
  | 'simular'
  | 'ia'
  | 'alertas'
  | 'perfil';

const paginas: Record<Pagina, string> = {
  inicio: 'Início', venda: 'Nova venda', processando: 'Processando', resultado: 'Resultado',
  falha: 'Falha no split', operacoes: 'Operações', registro: 'Registro da operação',
  caixa: 'Caixa', projecao: 'Projeção', despesas: 'Despesas', simular: 'Simular cenário',
  ia: 'Análise com IA', alertas: 'Alertas', perfil: 'Perfil',
};

const dinheiro = (valor: number) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function TelaPosDesign({ voltar }: { voltar: () => void }) {
  const [pagina, setPagina] = useState<Pagina | 'login'>('login');
  const [historico, setHistorico] = useState<(Pagina | 'login')[]>([]);
  const [valor, setValor] = useState('150,00');
  const [forma, setForma] = useState('PIX');
  const [statusOperacoes, setStatusOperacoes] = useState('Todos os status');
  const [falhaSimulada, setFalhaSimulada] = useState(false);
  const [estadoIa, setEstadoIa] = useState<'sucesso' | 'fallback'>('sucesso');

  const navegar = (proxima: Pagina | 'login') => {
    setHistorico((atual) => [...atual, pagina]);
    setPagina(proxima);
  };
  const voltarTela = () => {
    const anterior = historico.at(-1);
    setHistorico((atual) => atual.slice(0, -1));
    setPagina(anterior ?? 'inicio');
  };
  const valorNumerico = Number(valor.replace(/\./g, '').replace(',', '.')) || 0;
  const cobrar = (comFalha = false) => {
    setFalhaSimulada(comFalha);
    navegar('processando');
  };

  if (pagina === 'login') {
    return (
      <main className="pos-login">
        <button className="pos-text-button pos-dashboard-link" onClick={voltar}>
          <ArrowLeft size={18} /> Dashboard web
        </button>
        <div className="pos-brand-mark">PC</div>
        <div className="pos-wordmark">PLANNER COMERCIAL</div>
        <h1>Acesse o Smart POS</h1>
        <p className="pos-muted">Entre para acompanhar suas vendas e o caixa do seu negócio.</p>
        <label className="pos-field">
          E-mail
          <input type="email" placeholder="voce@exemplo.com" />
        </label>
        <label className="pos-field">
          Senha
          <input type="password" placeholder="Sua senha" />
        </label>
        <button className="pos-primary" onClick={() => navegar('inicio')}>Entrar</button>
        <button className="pos-secondary" onClick={() => navegar('inicio')}>Iniciar demonstração</button>
        <p className="pos-login-note">Demonstração: senha 123456. Todos os dados e valores são simulados.</p>
      </main>
    );
  }

  const navItems: { id: Pagina; label: string; icon: typeof Home }[] = [
    { id: 'inicio', label: 'Início', icon: Home },
    { id: 'operacoes', label: 'Operações', icon: CircleDollarSign },
    { id: 'simular', label: 'Simular', icon: Zap },
    { id: 'alertas', label: 'Alertas', icon: Bell },
    { id: 'perfil', label: 'Perfil', icon: UserRound },
  ];

  const aviso = <div className="pos-notice">Demonstração simulada. Nenhum pagamento ou registro real é realizado.</div>;
  const cardOperacao = (id: string, quantia: string, status = 'Confirmada') => (
    <button className="pos-operation" key={id} onClick={() => navegar('registro')}>
      <span><strong>{quantia}</strong><small>{id} · Hoje, 14:32</small></span>
      <span className="pos-pill">{status}</span>
      <span className="pos-operation-net">Líquido · {dinheiro(Number(quantia.replace(',', '.')) * 0.88)}</span>
    </button>
  );

  return (
    <div className="pos-page">
      <section className="pos-shell" aria-label="Smart POS demonstrativo">
        <header className="pos-header">
          <button className="pos-back" aria-label="Voltar" onClick={voltarTela}><ArrowLeft size={20} /></button>
          <div><small>Mercadinho São João</small><strong>{paginas[pagina]}</strong></div>
          <span className="pos-simulated">SIMULADO</span>
        </header>

        <main className="pos-main" key={pagina}>
          {pagina === 'inicio' && <>
            <section className="pos-balance-card">
              <div className="pos-card-eyebrow">Líquido disponível hoje <span>SIMULADO</span></div>
              <strong className="pos-balance">R$ 2.486,40</strong>
              <div className="pos-balance-breakdown"><span>Total bruto<strong>R$ 2.820,00</strong></span><span>Tributo separado<strong>R$ 282,00</strong></span></div>
            </section>
            <button className="pos-primary pos-large" onClick={() => navegar('venda')}><CreditCard size={20} /> Nova venda</button>
            <div className="pos-shortcuts">
              <button onClick={() => navegar('caixa')}><Wallet />Caixa</button>
              <button onClick={() => navegar('despesas')}><CircleDollarSign />Despesas</button>
              <button onClick={() => navegar('simular')}><Zap />Simular</button>
            </div>
            <section className="pos-section"><h2>Últimas vendas</h2>{cardOperacao('OP-2026-0042', '150,00')}{cardOperacao('OP-2026-0041', '82,50')}</section>
            <button className="pos-alert-cta" onClick={() => navegar('alertas')}>Ver alertas e recomendações <ArrowRight size={17} /></button>
            {aviso}
          </>}

          {pagina === 'venda' && <>
            <label className="pos-field pos-amount-field">Valor da venda
              <span>R$ <input aria-label="Valor da venda" inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} /></span>
            </label>
            <label className="pos-field">Forma de pagamento<select value={forma} onChange={(e) => setForma(e.target.value)}><option>PIX</option><option>Cartão</option><option>Dinheiro</option></select></label>
            <label className="pos-field">Categoria do tributo<select defaultValue="Venda de produtos"><option>Venda de produtos</option><option>Serviços</option><option>Outros</option></select></label>
            <div className="pos-info">SIMULADO · Esta cobrança percorre somente um fluxo demonstrativo.</div>
            <button className="pos-primary pos-large" onClick={() => cobrar(false)}>Cobrar {dinheiro(valorNumerico)}</button>
            <button className="pos-danger-text" onClick={() => cobrar(true)}>Demonstrar fluxo com falha</button>
          </>}

          {pagina === 'processando' && <section className="pos-process">
            <div className="pos-pulse" aria-hidden="true" />
            <h1>Processando demonstração</h1><p>Não retire o cartão durante o fluxo simulado.</p>
            {['Venda iniciada', 'Pagamento demonstrativo', 'Tributo separado', 'Parcelas roteadas', 'Conferência do resultado'].map((etapa, i) => <div className={`pos-step ${i < (falhaSimulada ? 3 : 5) ? 'is-done' : ''}`} key={etapa}>{i < (falhaSimulada ? 3 : 5) ? <Check size={18} /> : <span className="pos-step-dot" />}{etapa}</div>)}
            <button className="pos-primary" onClick={() => navegar(falhaSimulada ? 'falha' : 'resultado')}>Continuar demonstração</button>
          </section>}

          {pagina === 'resultado' && <>
            <section className="pos-result-card"><h1>Venda simulada</h1><span>SIMULADO · Valor bruto</span><strong>{dinheiro(valorNumerico)}</strong><small>Forma de pagamento · {forma}</small></section>
            <section className="pos-section pos-splits"><h2>Parcelas roteadas</h2><div className="pos-split orange"><span>Tributo · Destino fiscal</span><strong>{dinheiro(valorNumerico * 0.1)}</strong><small>Parcela roteada · Confirmada</small></div><div className="pos-split neutral"><span>Processamento · Plataforma</span><strong>{dinheiro(valorNumerico * 0.02)}</strong><small>Parcela roteada · Confirmada</small></div><div className="pos-split green"><span>Disponível · Comerciante</span><strong>{dinheiro(valorNumerico * 0.88)}</strong><small>Parcela roteada · Confirmada</small></div></section>
            <div className="pos-sum">Soma das parcelas · {dinheiro(valorNumerico)} = bruto</div>
            <button className="pos-primary" onClick={() => navegar('registro')}>Ver registro</button>
            <button className="pos-secondary" onClick={() => navegar('ia')}>Explicar com IA</button>
            <button className="pos-text-button pos-center" onClick={() => navegar('venda')}>Nova venda</button>{aviso}
          </>}

          {pagina === 'falha' && <>
            <section className="pos-failure"><Bell /><h1>Falha ao rotear uma parcela</h1><p>Uma parcela demonstrativa não foi confirmada. As demais etapas e o registro permanecem preservados.</p></section>
            <section className="pos-failed-item"><strong>Taxa de processamento · FALHA</strong><p>{dinheiro(valorNumerico * 0.02)} · destino da plataforma</p></section>
            <button className="pos-danger-button" onClick={() => cobrar(false)}>Reprocessar</button>
            <button className="pos-text-button" onClick={() => navegar('registro')}>Ver registro preservado</button>
            <p className="pos-muted">A tentativa demonstrativa preserva o identificador para ilustrar idempotência.</p>{aviso}
          </>}

          {pagina === 'operacoes' && <>
            <div className="pos-filter-row"><select aria-label="Período"><option>Hoje</option><option>7 dias</option><option>30 dias</option></select><select aria-label="Status" value={statusOperacoes} onChange={(e) => setStatusOperacoes(e.target.value)}><option>Todos os status</option><option>Confirmada</option><option>Falha</option><option>Pendente</option></select></div>
            <div className="pos-info">SIMULADO · Dados fictícios para demonstração</div>
            <section className="pos-section"><h2>Operações recentes</h2>{[
              ['OP-2026-0042', '150,00', 'Confirmada'],
              ['OP-2026-0041', '82,50', 'Confirmada'],
              ['OP-2026-0040', '210,00', 'Pendente'],
              ['OP-2026-0039', '64,90', 'Falha'],
            ].filter(([, , status]) => statusOperacoes === 'Todos os status' || status === statusOperacoes).map(([id, quantia, status]) => cardOperacao(id, quantia, status))}</section>{aviso}
          </>}

          {pagina === 'registro' && <>
            <div className="pos-info">Registro somente leitura · SIMULADO</div>
            <section className="pos-section"><h2>Dados da operação</h2><dl className="pos-record">{[['Identificador', 'OP-2026-0042'], ['Data e hora', '26/10/2026 · 14:32'], ['Valor bruto', dinheiro(valorNumerico || 150)], ['Pagamento', forma], ['Status', 'Concluída · Simulada'], ['Estabelecimento', 'Mercadinho São João']].map(([chave, dado]) => <div key={chave}><dt>{chave}</dt><dd>{dado}</dd></div>)}</dl></section>
            <section className="pos-destination"><h2>Destinos e status</h2><p>Tributo · Confirmado</p><p>Processamento · Confirmado</p><p>Comerciante · Confirmado</p></section>
            <section className="pos-timeline"><h2>Linha do tempo</h2><p>Venda iniciada · 14:32</p><p>Split simulado concluído · 14:32</p></section>{aviso}
          </>}

          {pagina === 'caixa' && <>
            <label className="pos-field">Período<select><option>Hoje</option><option>7 dias</option><option>30 dias</option></select></label>
            <section className="pos-balance-card"><span>Saldo líquido</span><strong className="pos-balance">R$ 2.486,40</strong><small>Valores demonstrativos</small></section>
            <div className="pos-shortcuts pos-cash-grid"><article><span>Entradas</span><strong>R$ 2.820,00</strong></article><article><span>Saídas</span><strong>R$ 333,60</strong></article></div>
            <div className="pos-warning">Há uma divergência demonstrativa de R$ 12,00 entre o saldo previsto e realizado.</div>
            <button className="pos-plain-cta" onClick={() => navegar('projecao')}>Ver projeção <ArrowRight size={17} /></button>{aviso}
          </>}

          {pagina === 'projecao' && <>
            <section className="pos-balance-card"><span className="pos-attention">Atenção média</span><h1>Projeção de caixa</h1><small>Estimativa demonstrativa</small></section>
            <div className="pos-shortcuts pos-cash-grid"><article><span>Receitas</span><strong>R$ 8.420,00</strong></article><article><span>Despesas</span><strong>R$ 3.180,00</strong></article></div>
            <section className="pos-section"><h2>Tendência do saldo</h2><div className="pos-chart" role="img" aria-label="Gráfico de tendência do saldo em sete dias">{[42, 57, 49, 73, 66, 88, 78].map((h, i) => <span key={i} style={{ height: `${h}%` }} />)}</div><div className="pos-chart-labels"><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span><span>Dom</span></div></section>
            <button className="pos-primary" onClick={() => navegar('alertas')}>Ver alertas</button>{aviso}
          </>}

          {pagina === 'despesas' && <>
            <section className="pos-section"><h2>Cadastrar despesa</h2><label className="pos-field">Descrição<input placeholder="Ex.: Compra de estoque" /></label><div className="pos-filter-row"><label className="pos-field">Valor<input inputMode="decimal" placeholder="R$ 0,00" /></label><label className="pos-field">Data<input type="date" defaultValue="2026-10-26" /></label></div><div className="pos-info">Sugestão da IA: despesas operacionais</div><label className="pos-field">Categoria<select><option>Operacional</option><option>Estoque</option><option>Outros</option></select></label><button className="pos-primary" disabled>Salvar despesa</button><small className="pos-muted">Cadastro desativado nesta demonstração.</small></section>
            <section className="pos-section"><h2>Últimas despesas</h2><article className="pos-list-row"><span>Compra de embalagens</span><strong>R$ 86,00</strong></article><article className="pos-list-row"><span>Energia elétrica</span><strong>R$ 240,00</strong></article></section>{aviso}
          </>}

          {pagina === 'simular' && <>
            <div className="pos-info">SIMULADO · Ajuste os campos para explorar o cenário. Eles não alteram os valores exibidos.</div>
            <label className="pos-field">Valor<input inputMode="decimal" defaultValue="150,00" /></label><label className="pos-field">Percentual<input inputMode="decimal" defaultValue="10" /></label>
            <section className="pos-simulation-result"><div><span>Valor do split simulado</span><strong>R$ 15,00</strong></div><div><span>Valor disponível estimado</span><strong>R$ 135,00</strong></div></section>{aviso}
          </>}

          {pagina === 'ia' && <>
            <div className="pos-sticky-warning">Recomendação demonstrativa. A análise não envia dados nem executa ações.</div>
            <div className="pos-filter-row"><button className={estadoIa === 'sucesso' ? 'is-selected' : ''} onClick={() => setEstadoIa('sucesso')}>Sucesso</button><button className={estadoIa === 'fallback' ? 'is-selected' : ''} onClick={() => setEstadoIa('fallback')}>Fallback</button></div>
            {estadoIa === 'sucesso' ? <section className="pos-ai-card"><strong>Nível de atenção: baixo</strong><p>O saldo demonstrativo acompanha o volume de entradas recente.</p><h2>Recomendações</h2><p>Confira as despesas previstas e mantenha uma reserva para custos operacionais.</p></section> : <section className="pos-warning"><strong>Análise indisponível</strong><p>Exibindo orientação demonstrativa enquanto a IA não responde.</p></section>}{aviso}
          </>}

          {pagina === 'alertas' && <>
            <article className="pos-alert-card amber"><Bell /><div><strong>Confira a divergência de caixa</strong><p>Saldo previsto e realizado diferem em R$ 12,00.</p></div></article>
            <article className="pos-alert-card red"><Bell /><div><strong>Parcela com falha</strong><p>Uma etapa de roteamento precisa ser reprocessada.</p></div></article>
            <article className="pos-alert-card blue"><Zap /><div><strong>Projeção atualizada</strong><p>Veja a tendência estimada para os próximos dias.</p></div></article>{aviso}
          </>}

          {pagina === 'perfil' && <>
            <section className="pos-section"><h2>Comerciante</h2><p>Mercadinho São João</p><small>Maria · Administradora</small></section>
            <section className="pos-section"><h2>Dispositivo</h2><p>POS-REC-0042</p><span className="pos-pill">Conectado</span></section>
            {aviso}<button className="pos-outline-danger" onClick={() => navegar('login')}>Sair do Smart POS</button>
            <button className="pos-secondary" onClick={voltar}>Voltar ao dashboard web</button>
          </>}
        </main>

        {pagina === 'inicio' && <nav className="pos-nav" aria-label="Navegação POS">{navItems.map(({ id, label, icon: Icon }) => <button key={id} aria-current={pagina === id ? 'page' : undefined} onClick={() => navegar(id)}><Icon size={19} /><span>{label}</span></button>)}</nav>}
      </section>
    </div>
  );
}
