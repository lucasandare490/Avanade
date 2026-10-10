import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Marca } from '../componentes/EstruturaPainel';
export function TelaEntrada({
  entrar,
  abrirLogin,
  permitirDemo = true,
}: {
  entrar: () => void;
  abrirLogin?: () => void;
  permitirDemo?: boolean;
}) {
  return (
    <main className="tela-entrada">
      <section className="cartao-entrada">
        <Marca />
        <div className="etiqueta">PLANNER COMERCIAL</div>
        <h1>
          Seu negócio.
          <br />
          Cada valor, mais claro.
        </h1>
        <p>
          Acompanhe as operações de split e entenda o dinheiro disponível para o seu
          estabelecimento.
        </p>
        <div className="preview-split">
          <span>
            Venda demonstrativa<strong>R$ 150,00</strong>
          </span>
          <div>
            <span>
              Tributo<b>R$ 15,00</b>
            </span>
            <span>
              Taxa<b>R$ 3,00</b>
            </span>
            <span>
              Líquido<b>R$ 132,00</b>
            </span>
          </div>
        </div>
        <button className="botao primario largo" onClick={permitirDemo ? entrar : abrirLogin}>
          {permitirDemo ? 'Explorar demonstração' : 'Entrar'} <ArrowRight size={18} />
        </button>
        {abrirLogin && permitirDemo && (
          <button className="botao secundario largo" onClick={abrirLogin}>
            Entrar com perfil demonstrativo
          </button>
        )}
        <p className="nota">
          <ShieldCheck size={16} />
          Sem cadastro ou senha. Dados fictícios, sem movimentação real.
        </p>
        <small>
          O acesso autenticado será conectado à API do projeto. Não informe dados pessoais nesta
          demonstração.
        </small>
      </section>
    </main>
  );
}
