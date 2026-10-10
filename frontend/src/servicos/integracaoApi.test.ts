import { afterEach, describe, expect, it, vi } from 'vitest';
import { criarIntegracaoApi, type ContratoServidor } from './adapterApi';
import { criarTransporteApi } from './transporteApi';
import { criarCenario } from '../dados/cenarioDemonstrativo';
import { validarOperacao } from './validarContratoInterno';
import { sessaoDemonstrativa, autenticacaoDemonstrativa, podeAcessarRota } from './sessaoUsuario';
const operacao = () => criarCenario().operacoes[0];
const contrato = (alteracoes: Partial<ContratoServidor> = {}): ContratoServidor => ({
  versao: 'teste-v1',
  credenciais: 'omit',
  carregar: async () => criarCenario(),
  login: () => ({ caminho: '/login', metodo: 'POST' }),
  mapearSessao: (r) => r,
  logout: () => ({ caminho: '/logout', metodo: 'POST' }),
  venda: (d) => ({ caminho: '/sales', metodo: 'POST', dados: d }),
  mapearOperacao: (r) => r,
  despesa: (d) => ({ caminho: '/expenses', metodo: 'POST', dados: d }),
  retomada: (id) => ({ caminho: `/operations/${id}/retry`, metodo: 'POST' }),
  ...alteracoes,
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
describe('contratos e fronteiras da integração', () => {
  it('não transforma estado desconhecido em concluído', () =>
    expect(() => validarOperacao({ ...operacao(), status: 'NOVO_ESTADO' })).toThrow());
  it('não aceita composição monetária divergente', () =>
    expect(() => validarOperacao({ ...operacao(), liquido: 1 })).toThrow());
  it('mantém pagamento separado de split e não inventa regra ausente', () => {
    const o = validarOperacao({ ...operacao(), pagamento: 'pendente' });
    expect(o.pagamento).toBe('pendente');
    expect(o.regraHistorica).toBeUndefined();
    expect(o.parcelas).toBeUndefined();
  });
  it('rejeita parcelas duplicadas mesmo com total conservado', () => {
    const o = operacao();
    expect(() =>
      validarOperacao({
        ...o,
        parcelas: [
          { id: 'a', titulo: 'A', destino: 'D', valor: o.bruto, status: 'concluida' },
          { id: 'a', titulo: 'B', destino: 'D', valor: 0, status: 'pendente' },
        ],
      }),
    ).toThrow();
  });
  it('rejeita detalhe de outra operação', async () => {
    const s = criarIntegracaoApi(
      'https://api.example.invalid',
      contrato({ consultas: () => ({ consultarOperacao: async () => operacao() }) }),
    ).criarServico(sessaoDemonstrativa());
    await expect(s.consultarOperacao!('outra')).rejects.toThrow('divergente');
  });
  it('rejeita total inválido e registros duplicados na página', async () => {
    const o = operacao();
    const s = criarIntegracaoApi(
      'https://api.example.invalid',
      contrato({
        consultas: () => ({
          consultarOperacoes: async () => ({ itens: [o, o], total: 2, pagina: 1, tamanho: 20 }),
        }),
      }),
    ).criarServico(sessaoDemonstrativa());
    await expect(
      s.consultarOperacoes!({
        busca: '',
        inicio: '',
        fim: '',
        status: '',
        meio: '',
        pagina: 1,
        tamanho: 20,
      }),
    ).rejects.toThrow('duplicadas');
  });
  it('não aceita resumo de período diferente', async () => {
    const s = criarIntegracaoApi(
      'https://api.example.invalid',
      contrato({
        consultas: () => ({
          consultarResumo: async () => ({
            periodo: { inicio: '2026-01-01', fim: '2026-01-02' },
            indicadores: [],
            atualizadoEm: '2026-10-09T12:00:00Z',
          }),
        }),
      }),
    ).criarServico(sessaoDemonstrativa());
    await expect(
      s.consultarResumo!('dashboard', { inicio: '2026-10-01', fim: '2026-10-09' }),
    ).rejects.toThrow();
  });
  it('preserva chave de retomada quando a resposta se perde', async () => {
    const f = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('network'))
      .mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', f);
    const s = criarIntegracaoApi('https://api.example.invalid', contrato()).criarServico(
      sessaoDemonstrativa(),
    );
    await expect(s.reprocessar('op')).rejects.toThrow();
    await s.reprocessar('op');
    expect(f.mock.calls[0][1].headers['Idempotency-Key']).toBe(
      f.mock.calls[1][1].headers['Idempotency-Key'],
    );
  });
  it('envia a chave da intenção ao registrar venda e nunca faz fallback', async () => {
    const f = vi.fn().mockRejectedValue(new TypeError('rede'));
    vi.stubGlobal('fetch', f);
    const s = criarIntegracaoApi('https://api.example.invalid', contrato()).criarServico(
      sessaoDemonstrativa(),
    );
    await expect(
      s.registrarVenda({ chave: 'intencao-1', bruto: 15000, meio: 'PIX', cenario: 'sucesso' }),
    ).rejects.toThrow();
    expect(f).toHaveBeenCalledTimes(1);
    expect(f.mock.calls[0][1].headers['Idempotency-Key']).toBe('intencao-1');
  });
  it.each([401, 403, 409, 422, 429, 500])(
    'preserva erro HTTP %i sem texto interno',
    async (codigo) => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(new Response('segredo', { status: codigo })),
      );
      await expect(
        criarTransporteApi('https://api.example.invalid')('/op', (v) => v),
      ).rejects.toMatchObject({ codigo });
    },
  );
  it('mapeia erros de campos sem mostrar o corpo cru', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 422 })));
    const api = criarTransporteApi('https://api.example.invalid', 'omit', () => ({
      valor: 'Confira o valor',
    }));
    await expect(api('/op', (v) => v)).rejects.toMatchObject({
      campos: { valor: 'Confira o valor' },
    });
  });
  it('perfil operador consulta e vende, mas não vê financeiro', () => {
    const s = sessaoDemonstrativa('operador');
    expect(podeAcessarRota('operacoes/op', s)).toBe(true);
    expect(podeAcessarRota('venda-demonstrativa', s)).toBe(true);
    expect(podeAcessarRota('dashboard', s)).toBe(false);
  });
  it('login não aceita conta não cadastrada no demonstrativo', async () => {
    await expect(
      autenticacaoDemonstrativa.entrar({ email: 'outro@exemplo.invalid', senha: 'demo' }),
    ).rejects.toThrow();
  });
});

it('recusa API remota sem HTTPS e credencial embutida no endereço', () => {
  expect(() => criarTransporteApi('http://api.example.invalid')).toThrow('HTTPS');
  expect(() => criarTransporteApi('https://usuario:senha@api.example.invalid')).toThrow();
  expect(() => criarTransporteApi('http://127.0.0.1:8080')).not.toThrow();
});
