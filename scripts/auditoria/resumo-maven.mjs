// Lê a saída do Maven (stdin) e resume: passa só com BUILD SUCCESS e zero falhas/erros.
let s = '';
process.stdin.on('data', (d) => (s += d));
process.stdin.on('end', () => {
  const total = [...s.matchAll(/Tests run: (\d+), Failures: (\d+), Errors: (\d+), Skipped: (\d+)\s*$/gm)].pop();
  const falhas = [...s.matchAll(/^\[ERROR\]\s+(\S+\.\S+)\s.*<<< (FAILURE|ERROR)/gm)].map((m) => m[1]);
  if (!/BUILD SUCCESS/.test(s) || !total || total[2] !== '0' || total[3] !== '0') {
    console.error(`maven com falhas: ${total ? total[0] : 'sem resumo'}\n${[...new Set(falhas)].join('\n')}`);
    process.exit(1);
  }
  console.log(`maven sem falhas: ${total[0]}`);
});
