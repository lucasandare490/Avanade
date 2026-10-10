import { useState } from 'react';
import { Aviso, CabecalhoPagina, Estado } from '../componentes/ElementosInterface';
/** Prévia de UX; não recebe nem transmite credenciais reais. */
export function TelaEstadosAcesso() {
  const [estado, definir] = useState('login');
  const [email, setEmail] = useState('maria@exemplo.invalid');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  return (
    <>
      <CabecalhoPagina
        titulo="Prévia de acesso"
        descricao="Conheça as telas de acesso antes da conexão com o servidor."
      />
      <Aviso>
        Prévia local. Use somente dados fictícios. Não há criação de conta nem autenticação real.
      </Aviso>
      <label className="campo">
        <span>Estado demonstrativo</span>
        <select
          value={estado}
          onChange={(e) => {
            definir(e.target.value);
            setErro('');
            setSenha('');
          }}
        >
          <option value="login">Entrada</option>
          <option value="cadastro">Cadastro</option>
          <option value="expirada">Sessão expirada</option>
          <option value="negado">Acesso negado</option>
          <option value="indisponivel">Serviço indisponível</option>
        </select>
      </label>
      {['login', 'cadastro'].includes(estado) ? (
        <section className="painel formulario-venda">
          <h2>{estado === 'login' ? 'Entrar na sua conta' : 'Preparar seu cadastro'}</h2>
          <form
            className="formulario-vertical"
            onSubmit={(e) => {
              e.preventDefault();
              setSenha('');
              setErro(
                'Prévia concluída. O envio estará disponível após integrar a autenticação e o cadastro do backend.',
              );
            }}
          >
            {estado === 'cadastro' && (
              <label className="campo">
                <span>Nome do estabelecimento fictício</span>
                <input required maxLength={100} autoComplete="off" />
              </label>
            )}
            <label className="campo">
              <span>E-mail fictício</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
              />
            </label>
            <label className="campo">
              <span>Senha fictícia</span>
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="off"
                aria-describedby="nota-acesso"
              />
            </label>
            <p id="nota-acesso" className="nota">
              Os campos são apenas uma prévia e não são armazenados. A política de senha será
              definida com o backend.
            </p>
            <button className="botao primario">Visualizar retorno da prévia</button>
          </form>
          {erro && (
            <p role="status" className="aviso">
              {erro}
            </p>
          )}
        </section>
      ) : (
        <Estado
          titulo={
            estado === 'expirada'
              ? 'Sua sessão expirou'
              : estado === 'negado'
                ? 'Você não tem acesso a esta área'
                : 'O serviço está indisponível'
          }
          descricao={
            estado === 'negado'
              ? 'Solicite ao responsável pelo estabelecimento a permissão necessária.'
              : 'Seus dados não foram enviados. Volte à tela de entrada para continuar.'
          }
          acao={
            <button className="botao primario" onClick={() => definir('login')}>
              Voltar à prévia de entrada
            </button>
          }
        />
      )}
    </>
  );
}
