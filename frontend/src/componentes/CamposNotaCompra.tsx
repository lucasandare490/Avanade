import { useId, useState, type ChangeEvent } from 'react';
import { descricaoDaNota, lerNotaCompra, TAMANHO_MAXIMO_XML } from '../servicos/reforma';
import { moeda } from '../utilitarios/valoresFinanceiros';

const paraCampo = (cents: number) => (cents / 100).toFixed(2).replace('.', ',');

/**
 * Campo do crédito de IBS/CBS da nota de compra e leitura do XML da NF-e (Thayná Batista da
 * Silva). O XML é lido só no navegador: preenche descrição, valor, data e crédito do formulário
 * para a pessoa conferir antes de salvar. Nada é enviado sem o clique em salvar.
 */
export function CamposNotaCompra({ desabilitado = false }: { desabilitado?: boolean }) {
  const id = useId();
  const [mensagem, setMensagem] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);

  async function importar(e: ChangeEvent<HTMLInputElement>) {
    const entrada = e.currentTarget;
    const arquivo = entrada.files?.[0];
    const form = entrada.form;
    entrada.value = '';
    if (!arquivo || !form) return;
    try {
      if (arquivo.size > TAMANHO_MAXIMO_XML) throw new Error('O arquivo XML é grande demais.');
      if (!/\.xml$/i.test(arquivo.name)) throw new Error('Escolha o arquivo .xml da NF-e.');
      const nota = lerNotaCompra(await arquivo.text());
      const definir = (nome: string, valor: string) => {
        const campo = form.elements.namedItem(nome);
        if (campo instanceof HTMLInputElement || campo instanceof HTMLSelectElement) campo.value = valor;
      };
      definir('descricao', descricaoDaNota(nota));
      definir('valor', paraCampo(nota.valorCents));
      definir('data', nota.data);
      definir('credito', nota.creditoCents ? paraCampo(nota.creditoCents) : '');
      const categoria = form.elements.namedItem('categoria');
      if (categoria instanceof HTMLSelectElement && [...categoria.options].some((o) => o.value === 'Estoque')) categoria.value = 'Estoque';
      setMensagem({
        tipo: 'ok',
        texto: nota.temIbsCbs
          ? `Nota lida: ${moeda(nota.valorCents)}, com ${moeda(nota.creditoCents)} de crédito de IBS/CBS. Confira e salve.`
          : `Nota lida: ${moeda(nota.valorCents)}. Ela não tem o grupo de IBS/CBS; informe o crédito se houver.`,
      });
    } catch (falha) {
      setMensagem({ tipo: 'erro', texto: falha instanceof Error ? falha.message : 'Não foi possível ler o XML.' });
    }
  }

  return (
    <>
      <label className="campo">
        <span>Crédito de IBS/CBS da nota (R$)</span>
        <input name="credito" inputMode="decimal" placeholder="0,00" disabled={desabilitado} aria-describedby={`${id}-dica`} />
        <small id={`${id}-dica`}>Opcional. É o IBS e a CBS destacados na nota de compra.</small>
      </label>
      <label className="campo">
        <span>Importar XML da NF-e</span>
        <input type="file" accept=".xml,application/xml,text/xml" onChange={importar} disabled={desabilitado} />
      </label>
      {mensagem && (
        <p role={mensagem.tipo === 'erro' ? 'alert' : 'status'} className={mensagem.tipo === 'erro' ? 'erro' : 'aviso'}>
          {mensagem.texto}
        </p>
      )}
    </>
  );
}
