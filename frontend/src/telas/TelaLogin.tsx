import { useRef, useState, type FormEvent } from 'react';
import { Marca } from '../componentes/EstruturaPainel';
import type { Credenciais, SessaoUsuario } from '../servicos/sessaoUsuario';
export function TelaLogin({
  autenticar,
  cadastrar,
  concluir,
  voltar,
  mensagem,
  demonstrativo = true,
}: {
  cadastrar?: (dados: {name:string;merchantName:string;email:string;password:string}) => Promise<void>;
  autenticar: (dados: Credenciais) => Promise<SessaoUsuario>;
  concluir: (sessao: SessaoUsuario) => void;
  voltar: () => void;
  mensagem?: string;
  demonstrativo?: boolean;
}) {
  const [criando, setCriando] = useState(false);
  const [nome, setNome] = useState('');
  const [loja, setLoja] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [email, setEmail] = useState(demonstrativo ? 'gestor@exemplo.invalid' : '');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const bloqueio = useRef(false);
  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (bloqueio.current) return;
    bloqueio.current = true;
    setOcupado(true);
    setErro('');
    try {
      if (criando && cadastrar) {
        if (senha !== confirmacao) throw new Error('As senhas precisam ser iguais.');
        await cadastrar({name:nome.trim(),merchantName:loja.trim(),email:email.trim(),password:senha});
        setCriando(false);
        setSucesso('Conta e estabelecimento criados. Entre com seu e-mail e senha.');
      } else concluir(await autenticar({ email: email.trim(), senha }));
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível entrar. Tente novamente.');
    } finally {
      setSenha('');
      setConfirmacao('');
      setOcupado(false);
      bloqueio.current = false;
    }
  }
  return (
    <main className="tela-entrada">
      <section className="cartao-entrada">
        <Marca />
        <h1>{criando ? 'Criar conta e estabelecimento' : 'Entrar no Planner'}</h1>
        {sucesso && <p role="status" className="aviso">{sucesso}</p>}
        {mensagem && (
          <p role="status" className="aviso">
            {mensagem}
          </p>
        )}
        {demonstrativo && (
          <p className="nota">
            Acesso simulado: use gestor@exemplo.invalid, financeiro@exemplo.invalid ou
            operador@exemplo.invalid. Senha fictícia: demo. Não informe credenciais reais.
          </p>
        )}
        <form className="formulario-vertical" onSubmit={enviar}>
          <fieldset className="campos-sem-borda formulario-vertical" disabled={ocupado}>
            <legend className="somente-leitor">Acesso ao Planner</legend>
            {criando && <>
              <label className="campo"><span>Seu nome</span><input required maxLength={120} value={nome} onChange={e=>setNome(e.target.value)} autoComplete="name" /></label>
              <label className="campo"><span>Nome do estabelecimento</span><input required maxLength={120} value={loja} onChange={e=>setLoja(e.target.value)} autoComplete="organization" /></label>
              <p>Você será responsável por uma nova loja, inicialmente sem vendas ou despesas. O processamento financeiro continua simulado.</p>
            </>}
            <label className="campo">
              <span>E-mail</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete={demonstrativo ? 'off' : 'username'}
                aria-invalid={Boolean(erro)}
                aria-describedby={erro ? 'erro-login' : undefined}
              />
            </label>
            <label className="campo">
              <span>Senha</span>
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                minLength={criando ? 12 : undefined}
                maxLength={72}
                autoComplete={criando ? 'new-password' : demonstrativo ? 'off' : 'current-password'}
                aria-invalid={Boolean(erro)}
                aria-describedby={erro ? 'erro-login' : undefined}
              />
            </label>
            {criando && <label className="campo"><span id="rotulo-confirmar-senha">Confirmar senha</span><input aria-labelledby="rotulo-confirmar-senha" type="password" required minLength={12} maxLength={72} autoComplete="new-password" value={confirmacao} onChange={e=>setConfirmacao(e.target.value)} /><small>Use pelo menos 12 caracteres; limite de 72 bytes UTF-8.</small></label>}
            <button className="botao primario">
              {ocupado ? 'Aguarde…' : criando ? 'Criar conta' : demonstrativo ? 'Entrar no cenário simulado' : 'Entrar'}
            </button>
          </fieldset>
        </form>
        {cadastrar && <button type="button" className="botao secundario" disabled={ocupado} onClick={()=>{setCriando(!criando);setErro('');setSucesso('');setSenha('');setConfirmacao('');}}>{criando ? 'Já tenho conta' : 'Criar minha conta'}</button>}
        {erro && (
          <p role="alert" className="erro" id="erro-login">
            {erro}
          </p>
        )}
        <button className="botao secundario" disabled={ocupado} onClick={voltar}>
          Voltar
        </button>
      </section>
    </main>
  );
}
