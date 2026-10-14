import { CabecalhoPagina } from '../componentes/ElementosInterface';
export function TelaAjuda({ demonstrativo = true }: { demonstrativo?: boolean }) {
  const itens = [
    ['O que é o valor bruto?', 'É o total da venda antes de separar as parcelas.'],
    [
      'Tributo e taxa são a mesma coisa?',
      'Não. A demonstração separa 10% de tributo e 2% de processamento. São parâmetros fictícios, não alíquotas oficiais.',
    ],
    [
      'Por que uma venda não aparece no caixa?',
      'Neste cenário, somente operações com split concluído entram no caixa realizado. Pendências e falhas parciais ficam fora do saldo.',
    ],
    [
      'Como retomar uma falha?',
      demonstrativo
        ? 'Abra a operação com falha parcial e escolha Retomar simulação. A parcela já confirmada permanece no histórico.'
        : 'Abra a operação com falha e solicite a retomada. É necessário perfil de gerente; as parcelas confirmadas são preservadas.',
    ],
    [
      'E se a resposta da venda se perder?',
      demonstrativo
        ? 'Use Consultar a mesma tentativa. Você pode navegar e voltar ao modo POS nesta página; não recarregue nem crie uma nova venda para substituir uma confirmação desconhecida.'
        : 'Use Consultar a mesma tentativa no POS. A intenção fica nesta aba e pode ser recuperada depois de recarregar e entrar com a mesma conta. Para despesas, use Recuperar despesa. Não feche a aba nem limpe seu armazenamento antes da recuperação.',
    ],
    [
      'A simulação altera o caixa?',
      'Não. Ela mostra um cenário sem registrar uma venda ou despesa.',
    ],
    [
      'Onde ficam meus dados?',
      demonstrativo
        ? 'Operações e despesas ficam na memória desta página. Recarregar ou sair da demonstração restaura o conjunto inicial. Os filtros podem ser lembrados durante a sessão do navegador.'
        : 'Vendas e despesas confirmadas ficam no banco do servidor. O token fica somente em memória: recarregar exige novo login. A aba guarda filtros e intenções ainda sem confirmação, separadas por conta e loja.',
    ],
    [
      'Posso usar o comprovante para fins fiscais?',
      'Não. O comprovante e a exportação são demonstrativos e estão identificados como simulados.',
    ],
    [
      'Como navegar sem mouse?',
      'Use Tab e Shift+Tab, Enter para links e botões, e Escape para fechar o menu móvel. As tabelas podem receber foco para rolagem horizontal.',
    ],
  ];
  return (
    <>
      <CabecalhoPagina
        titulo="Ajuda e guia de uso"
        descricao="Entenda os valores e saiba como usar a demonstração."
      />
      <section className="painel">
        {itens.map(([titulo, texto]) => (
          <details className="pergunta-ajuda" key={titulo}>
            <summary>{titulo}</summary>
            <p>{texto}</p>
          </details>
        ))}
      </section>
    </>
  );
}
