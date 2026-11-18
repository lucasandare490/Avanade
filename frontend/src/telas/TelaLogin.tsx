import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Marca } from '../componentes/EstruturaPainel';
import {
  FalhaLogin,
  lembrarEmail,
  lerEmailLembrado,
  type Credenciais,
  type SessaoUsuario,
} from '../servicos/sessaoUsuario';
import { FalhaTransporte } from '../servicos/transporteApi';

/** Campo de senha com o "olhinho" para mostrar ou esconder o que foi digitado. */
function CampoSenha({
  rotulo,
  idRotulo,
  valor,
  definir,
  ...resto
}: {
  rotulo: string;
  idRotulo: string;
  valor: string;
  definir: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'>) {
  const [visivel, setVisivel] = useState(false);
  return (
    <div className="campo campo-senha">
      <span id={idRotulo}>{rotulo}</span>
      <div className="senha-com-olho">
        <input
          {...resto}
          aria-labelledby={idRotulo}
          type={visivel ? 'text' : 'password'}
          value={valor}
          onChange={(e) => definir(e.target.value)}
        />
        <button
          type="button"
          className="botao-olho"
          aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={visivel}
          onClick={() => setVisivel((v) => !v)}
        >
          {visivel ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}

export function TelaLogin({
  autenticar,
  cadastrar,
  solicitarRedefinicao,
  concluir,
  voltar,
  mensagem,
  demonstrativo = true,
}: {
  cadastrar?: (dados: { name: string; merchantName: string; email: string; password: string }) => Promise<void>;
  solicitarRedefinicao?: (email: string) => Promise<void>;
  autenticar: (dados: Credenciais) => Promise<SessaoUsuario>;
  concluir: (sessao: SessaoUsuario) => void;
  voltar: () => void;
  mensagem?: string;
  demonstrativo?: boolean;
}) {
  const emailLembrado = demonstrativo ? '' : lerEmailLembrado();
  const [criando, setCriando] = useState(false);
  const [nome, setNome] = useState('');
  const [loja, setLoja] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [email, setEmail] = useState(emailLembrado || (demonstrativo ? 'gestor@exemplo.invalid' : ''));
  const [senha, setSenha] = useState('');
  const [lembrar, setLembrar] = useState(Boolean(emailLembrado));
  const [erro, setErro] = useState('');
  const [tentativas, setTentativas] = useState<number | undefined>();
  const [bloqueadoAte, setBloqueadoAte] = useState(0);
  const [agora, setAgora] = useState(Date.now());
  const [confirmacaoInvalida, setConfirmacaoInvalida] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [recuperando, setRecuperando] = useState(false);
  const bloqueio = useRef(false);
  const bloqueado = bloqueadoAte > agora && !criando && !recuperando;

  useEffect(() => {
    if (!bloqueadoAte) return;
    const id = setInterval(() => {
      const t = Date.now();
      setAgora(t);
      if (t >= bloqueadoAte) {
        setBloqueadoAte(0);
        setTentativas(undefined);
        setErro('');
      }
    }, 1000);
    return () => clearInterval(id);
  }, [bloqueadoAte]);

  function trocarModo(mudar: () => void) {
    mudar();
    setConfirmacaoInvalida(false);
    setErro('');
    setSucesso('');
    setSenha('');
    setConfirmacao('');
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (bloqueio.current || bloqueado) return;
    bloqueio.current = true;
    setOcupado(true);
    setErro('');
    setConfirmacaoInvalida(false);
    try {
      if (recuperando && solicitarRedefinicao) {
        await solicitarRedefinicao(email.trim());
        setSucesso('Se o e-mail estiver cadastrado, enviaremos instruções de recuperação.');
      } else if (criando && cadastrar) {
        if (senha !== confirmacao) {
          setConfirmacaoInvalida(true);
          throw new Error('As senhas precisam ser iguais.');
        }
        await cadastrar({ name: nome.trim(), merchantName: loja.trim(), email: email.trim(), password: senha });
        setCriando(false);
        setSucesso('Conta e estabelecimento criados. Entre com seu e-mail e senha.');
      } else {
        const sessao = await autenticar({ email: email.trim(), senha, lembrar });
        lembrarEmail(lembrar && !demonstrativo ? email.trim() : null);
        setTentativas(undefined);
        concluir(sessao);
      }
    } catch (e) {
      const restantes =
        e instanceof FalhaLogin ? e.tentativasRestantes : e instanceof FalhaTransporte ? e.tentativasRestantes : undefined;
      const ate =
        e instanceof FalhaLogin
          ? e.bloqueadoAteMs
          : e instanceof FalhaTransporte && e.esperaSegundos !== undefined
            ? Date.now() + e.esperaSegundos * 1000
            : undefined;
      setTentativas(restantes);
      if (ate) {
        setBloqueadoAte(ate);
        setAgora(Date.now());
      }
      setErro(e instanceof Error ? e.message : 'Não foi possível entrar. Tente novamente.');
    } finally {
      setSenha('');
      setConfirmacao('');
      setOcupado(false);
      bloqueio.current = false;
    }
  }

  const segundosRestantes = Math.max(0, Math.ceil((bloqueadoAte - agora) / 1000));
  const relogio = `${Math.floor(segundosRestantes / 60)}:${String(segundosRestantes % 60).padStart(2, '0')}`;

  return (
    <main className={`tela-entrada tela-autenticacao ${criando ? 'cadastro' : ''}`}>
      {!criando && (
        <aside className="painel-marca-entrada" aria-label="Apresentação do Planner Comercial">
          <Marca />
          <div className="mensagem-marca-entrada">
            <h2>
              Controle suas vendas.
              <br />
              Entenda seu caixa.
              <br />
              <span>Planeje melhor.</span>
            </h2>
            <div className="beneficios-entrada">
              <p>
                <b>01</b> Fluxo de caixa em tempo real
              </p>
              <p>
                <b>02</b> Simulação de Split Payment
              </p>
              <p>
                <b>03</b> Análise inteligente
              </p>
            </div>
          </div>
          <small>
            {demonstrativo
              ? 'Planner Comercial · Demonstração local · Dados fictícios'
              : 'Planner Comercial · MVP · Pagamentos simulados'}
          </small>
        </aside>
      )}
      <div className="coluna-autenticacao">
        <section className="cartao-entrada">
          <Marca />
          <div className="entrada-cabecalho">
            <div className="etiqueta">ACESSO AO PLANNER</div>
            <h1>{recuperando ? 'Recuperar conta' : criando ? 'Criar conta e estabelecimento' : 'Entrar no Planner'}</h1>
            <p>
              {recuperando
                ? 'Informe o e-mail da conta. Se ele estiver cadastrado, enviaremos um link para criar uma nova senha.'
                : criando
                  ? 'Configure seu acesso e comece com um estabelecimento vazio.'
                  : 'Acesse seus dados e acompanhe o resultado do seu estabelecimento.'}
            </p>
          </div>
          {sucesso && (
            <p role="status" className="aviso">
              {sucesso}
            </p>
          )}
          {mensagem && (
            <p role="status" className="aviso">
              {mensagem}
            </p>
          )}
          {demonstrativo && !recuperando && (
            <p className="nota">
              Acesso simulado: use gestor@exemplo.invalid, financeiro@exemplo.invalid ou operador@exemplo.invalid.
              Senha fictícia: demo. Não informe credenciais reais.
            </p>
          )}
          <form className="formulario-vertical" onSubmit={enviar}>
            <fieldset className="campos-sem-borda formulario-vertical" disabled={ocupado}>
              <legend className="somente-leitor">Acesso ao Planner</legend>
              {criando && !recuperando && (
                <>
                  <label className="campo">
                    <span>Seu nome</span>
                    <input required maxLength={120} value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" />
                  </label>
                  <label className="campo">
                    <span>Nome do estabelecimento</span>
                    <input required maxLength={120} value={loja} onChange={(e) => setLoja(e.target.value)} autoComplete="organization" />
                  </label>
                  <p>
                    Você será responsável por uma nova loja, inicialmente sem vendas ou despesas. O processamento
                    financeiro continua simulado.
                  </p>
                </>
              )}
              <label className="campo">
                <span>E-mail</span>
                <input
                  type="email"
                  required
                  maxLength={254}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete={demonstrativo ? 'off' : 'username'}
                  aria-invalid={Boolean(erro) && !confirmacaoInvalida}
                  aria-describedby={erro && !confirmacaoInvalida ? 'erro-login' : undefined}
                />
              </label>
              {!recuperando && (
                <CampoSenha
                  rotulo="Senha"
                  idRotulo="rotulo-senha"
                  valor={senha}
                  definir={setSenha}
                  required
                  minLength={criando ? 12 : undefined}
                  maxLength={72}
                  autoComplete={criando ? 'new-password' : demonstrativo ? 'off' : 'current-password'}
                  aria-invalid={Boolean(erro)}
                  aria-describedby={erro ? 'erro-login' : tentativas !== undefined ? 'aviso-tentativas' : undefined}
                />
              )}
              {criando && !recuperando && (
                <>
                  <CampoSenha
                    rotulo="Confirmar senha"
                    idRotulo="rotulo-confirmar-senha"
                    valor={confirmacao}
                    definir={setConfirmacao}
                    required
                    minLength={12}
                    maxLength={72}
                    autoComplete="new-password"
                    aria-invalid={confirmacaoInvalida}
                    aria-describedby={confirmacaoInvalida ? 'erro-login' : undefined}
                  />
                  <small>Use pelo menos 12 caracteres; limite de 72 bytes UTF-8.</small>
                </>
              )}
              {!criando && !recuperando && (
                <div className="linha-lembrar">
                  <label className="campo-check">
                    <input type="checkbox" checked={lembrar} onChange={(e) => setLembrar(e.target.checked)} />
                    <span>Lembrar de mim</span>
                  </label>
                  {solicitarRedefinicao && (
                    <button type="button" className="botao texto" onClick={() => trocarModo(() => setRecuperando(true))}>
                      Esqueci minha senha
                    </button>
                  )}
                </div>
              )}
              {!criando && !recuperando && (
                <p className="nota-tentativas" id="aviso-tentativas">
                  {bloqueado
                    ? `Acesso bloqueado temporariamente. Tempo restante: ${relogio}`
                    : tentativas !== undefined
                      ? tentativas === 1
                        ? 'Atenção: resta 1 tentativa antes do bloqueio temporário.'
                        : `Restam ${tentativas} tentativas antes do bloqueio temporário.`
                      : 'Por segurança, o acesso é bloqueado por 15 minutos após 5 tentativas erradas seguidas.'}
                </p>
              )}
              <button className="botao primario largo" type="submit" disabled={bloqueado}>
                {ocupado
                  ? 'Aguarde…'
                  : recuperando
                    ? 'Enviar instruções'
                    : criando
                      ? 'Criar conta'
                      : demonstrativo
                        ? 'Entrar no cenário simulado'
                        : 'Entrar'}
              </button>
            </fieldset>
          </form>
          {!recuperando && (
            <p className="convite-cadastro">
              {criando ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'}{' '}
              <button
                type="button"
                className="botao texto destaque"
                disabled={ocupado}
                onClick={() =>
                  cadastrar
                    ? trocarModo(() => setCriando(!criando))
                    : trocarModo(() => setErro('Cadastro desativado nesta demonstração.'))
                }
              >
                {criando ? 'Entrar' : 'Cadastre-se'}
              </button>
            </p>
          )}
          <div className="acoes-entrada">
            {recuperando && (
              <button type="button" className="botao texto" disabled={ocupado} onClick={() => trocarModo(() => setRecuperando(false))}>
                Voltar para entrar
              </button>
            )}
            <button type="button" className="botao texto" disabled={ocupado} onClick={voltar}>
              Voltar
            </button>
          </div>
          {erro && (
            <p role="alert" className="erro" id="erro-login">
              {erro}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
