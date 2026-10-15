/** CSV de dados simulados locais ou do servidor; neutraliza fórmulas de planilha. */
export function exportarRelatorio(nome: string, colunas: string[], linhas: (string | number)[][]) {
  const escapar = (valor: string | number) => {
    let texto = String(valor);
    if (/^[\s]*[=+@-]/.test(texto)) texto = `'${texto}`;
    return `"${texto.replace(/"/g, '""')}"`;
  };
  const csv = '\uFEFF' + [colunas, ...linhas].map((l) => l.map(escapar).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${nome}-SIMULADO.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
