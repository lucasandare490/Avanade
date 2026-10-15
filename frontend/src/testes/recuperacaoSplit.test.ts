// @vitest-environment jsdom
import {it,expect,vi,afterEach} from 'vitest';
import {criarIntencoes} from '../servicos/intencoesApi';
import {criarTransporteApi} from '../servicos/transporteApi';
afterEach(()=>{sessionStorage.clear();vi.unstubAllGlobals();});
it('preserva a mesma chave para recuperar split após resposta perdida',async()=>{
 const fetchMock=vi.fn().mockRejectedValueOnce(new TypeError('offline')).mockResolvedValueOnce(new Response(JSON.stringify({id:'venda-1'}),{status:200}));
 vi.stubGlobal('fetch',fetchMock);
 const transporte=criarTransporteApi('http://127.0.0.1:8080');
 const validar=(v:unknown)=>v;
 const cliente=criarIntencoes('loja:usuario',transporte);
 const acao='RECOVER_SPLIT:venda-1',caminho='/api/v1/sales/venda-1/recover-split';
 await expect(cliente.enviar(acao,caminho,undefined,validar,'chave-recuperacao')).rejects.toThrow();
 expect(cliente.pendente(acao)).toBe(true);
 const recriado=criarIntencoes('loja:usuario',transporte);
 await expect(recriado.enviar(acao,caminho,undefined,validar,'outra-chave')).resolves.toEqual({id:'venda-1'});
 const cabecalhos=fetchMock.mock.calls.map(c=>new Headers(c[1].headers).get('Idempotency-Key'));
 expect(cabecalhos).toEqual(['chave-recuperacao','chave-recuperacao']);
 expect(recriado.pendente(acao)).toBe(false);
});
