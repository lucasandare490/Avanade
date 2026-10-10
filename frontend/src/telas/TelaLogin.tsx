import { useRef, useState, type FormEvent } from 'react';
import { Marca } from '../componentes/EstruturaPainel';
import type { Credenciais, SessaoUsuario } from '../servicos/sessaoUsuario';
export function TelaLogin({
  autenticar,
  concluir,
  voltar,
  mensagem,
  demonstrativo = true,
}: {
  autenticar: (dados: Credenciais) => Promise<SessaoUsuario>;
  concluir: (sessao: SessaoUsuario) => void;
  voltar: () => void;
  mensagem?: string;
  demonstrativo?: boolean;
}) {
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
      concluir(await autenticar({ email: email.trim(), senha }));
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível entrar. Tente novamente.');
    } finally {
      setSenha('');
      setOcupado(false);
      bloqueio.current = false;
    }
  }
  return (
    <main className="tela-entrada">
      <section className="cartao-entrada">
        <Marca />
        <h1>Entrar no Planner</h1>
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
                autoComplete={demonstrativo ? 'off' : 'current-password'}
                aria-invalid={Boolean(erro)}
                aria-describedby={erro ? 'erro-login' : undefined}
              />
            </label>
            <button className="botao primario">
              {ocupado ? 'Entrando…' : demonstrativo ? 'Entrar no cenário simulado' : 'Entrar'}
            </button>
          </fieldset>
        </form>
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
