import { useState, type FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Marca } from '../componentes/EstruturaPainel';

/** Tela aberta pelo link do e-mail de recuperação: cria a nova senha. */
export function TelaRedefinirSenha({
  token,
  redefinir,
  concluir,
}: {
  token: string;
  redefinir?: (token: string, senha: string) => Promise<void>;
  concluir: () => void;
}) {
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [visivel, setVisivel] = useState(false);
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);
  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro('');
    if (senha !== confirmacao) {
      setErro('As senhas precisam ser iguais.');
      return;
    }
    if (new TextEncoder().encode(senha).length > 72) {
      setErro('A senha deve ter no máximo 72 bytes UTF-8.');
      return;
    }
    if (!redefinir) {
      setErro('A recuperação de senha funciona somente no MVP online.');
      return;
    }
    setOcupado(true);
    try {
      await redefinir(token, senha);
      concluir();
    } catch {
      setErro('O link de recuperação é inválido ou expirou. Peça um novo link na tela de entrada.');
    } finally {
      setOcupado(false);
      setSenha('');
      setConfirmacao('');
    }
  }
  return (
    <main className="tela-entrada tela-autenticacao cadastro">
      <div className="coluna-autenticacao">
        <section className="cartao-entrada">
          <Marca />
          <div className="entrada-cabecalho">
            <div className="etiqueta">ACESSO AO PLANNER</div>
            <h1>Criar nova senha</h1>
            <p>Escolha uma nova senha para a sua conta. Depois, entre com ela normalmente.</p>
          </div>
          <form className="formulario-vertical" onSubmit={enviar}>
            <fieldset className="campos-sem-borda formulario-vertical" disabled={ocupado}>
              <legend className="somente-leitor">Nova senha</legend>
              <div className="campo campo-senha">
                <span id="rotulo-nova-senha">Nova senha</span>
                <div className="senha-com-olho">
                  <input aria-labelledby="rotulo-nova-senha" type={visivel ? 'text' : 'password'} required minLength={12} maxLength={72} autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} aria-describedby={erro ? 'erro-redefinir' : undefined} />
                  <button type="button" className="botao-olho" aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={visivel} onClick={() => setVisivel((v) => !v)}>
                    {visivel ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                  </button>
                </div>
              </div>
              <label className="campo">
                <span>Confirmar senha</span>
                <input type={visivel ? 'text' : 'password'} required minLength={12} maxLength={72} autoComplete="new-password" value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} />
              </label>
              <small>Use pelo menos 12 caracteres; limite de 72 bytes UTF-8.</small>
              <button className="botao primario largo" type="submit">
                {ocupado ? 'Aguarde…' : 'Salvar nova senha'}
              </button>
            </fieldset>
          </form>
          <div className="acoes-entrada">
            <a className="botao texto" href="#/">Voltar para entrar</a>
          </div>
          {erro && (
            <p role="alert" className="erro" id="erro-redefinir">
              {erro}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
