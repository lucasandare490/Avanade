// @vitest-environment jsdom
// Entrega final (Thayná Batista da Silva): login seguro, tema, idiomas e ícones "i".
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TelaLogin } from '../telas/TelaLogin';
import { autenticacaoDemonstrativa, FalhaLogin, zerarTentativasDemo } from '../servicos/sessaoUsuario';
import { FalhaTransporte, mensagemLogin } from '../servicos/transporteApi';
import { traduzirTexto, temTraducao } from '../preferencias/idioma';
import { aplicarTema, lerTema, resolverTema } from '../preferencias/tema';
import { dicas, explicacao } from '../preferencias/dicas';
import { criarIntegracaoApi } from '../servicos/adaptarEValidarRespostasApi';
import { contratoServidor } from '../servicos/contratoBackendPlanner';

afterEach(() => {
  cleanup();
  dicas.parar();
  document.body.innerHTML = '';
});
beforeEach(() => localStorage.clear());

function abrirLogin(props: Partial<Parameters<typeof TelaLogin>[0]> = {}) {
  const autenticar = props.autenticar ?? vi.fn();
  render(<TelaLogin autenticar={autenticar} concluir={vi.fn()} voltar={vi.fn()} demonstrativo={false} {...props} />);
  return autenticar as ReturnType<typeof vi.fn>;
}

describe('tela de login', () => {
  it('olhinho mostra e esconde a senha', () => {
    abrirLogin();
    const senha = screen.getByLabelText('Senha', { exact: true });
    expect(senha).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar senha' }));
    expect(senha).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Ocultar senha' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Ocultar senha' }));
    expect(senha).toHaveAttribute('type', 'password');
  });

  it('tem "Ainda não tem uma conta? Cadastre-se" e "Esqueci minha senha"', () => {
    abrirLogin({ cadastrar: vi.fn(), solicitarRedefinicao: vi.fn() });
    expect(screen.getByText(/Ainda não tem uma conta\?/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cadastre-se' }));
    expect(screen.getByRole('heading', { name: 'Criar conta e estabelecimento' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Esqueci minha senha' }));
    expect(screen.getByRole('heading', { name: 'Recuperar conta' })).toBeInTheDocument();
  });

  it('lembrar de mim envia lembrar=true e guarda só o e-mail, nunca a senha', async () => {
    const autenticar = vi.fn().mockResolvedValue({ id: '1', nome: 'P', loja: 'L', permissoes: ['consultar'], expiraEm: Date.now() + 60000 });
    abrirLogin({ autenticar });
    fireEvent.change(screen.getByLabelText('E-mail', { exact: true }), { target: { value: 'pessoa@example.invalid' } });
    fireEvent.change(screen.getByLabelText('Senha', { exact: true }), { target: { value: 'Senha-secreta-123' } });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Lembrar de mim' }));
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    await waitFor(() => expect(autenticar).toHaveBeenCalledWith({ email: 'pessoa@example.invalid', senha: 'Senha-secreta-123', lembrar: true }));
    expect(localStorage.getItem('planner:email-lembrado')).toBe('pessoa@example.invalid');
    expect(JSON.stringify({ ...localStorage })).not.toContain('Senha-secreta-123');
  });

  it('mostra quantas tentativas restam a cada erro', async () => {
    const autenticar = vi.fn().mockRejectedValue(new FalhaTransporte(401, 'E-mail ou senha inválidos. Restam 3 tentativas antes do bloqueio temporário.', {}, 3));
    abrirLogin({ autenticar });
    fireEvent.change(screen.getByLabelText('E-mail', { exact: true }), { target: { value: 'p@example.invalid' } });
    fireEvent.change(screen.getByLabelText('Senha', { exact: true }), { target: { value: 'errada' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Restam 3 tentativas'));
    expect(screen.getByText('Restam 3 tentativas antes do bloqueio temporário.')).toBeInTheDocument();
  });

  it('bloqueado: desativa o botão e mostra o tempo restante', async () => {
    const autenticar = vi.fn().mockRejectedValue(new FalhaTransporte(429, 'Muitas tentativas erradas. O acesso foi bloqueado temporariamente. Tente novamente em 15 minutos ou recupere sua senha.', {}, 0, 900));
    abrirLogin({ autenticar });
    fireEvent.change(screen.getByLabelText('E-mail', { exact: true }), { target: { value: 'p@example.invalid' } });
    fireEvent.change(screen.getByLabelText('Senha', { exact: true }), { target: { value: 'errada' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Entrar' })).toBeDisabled());
    expect(screen.getByText(/Tempo restante: 1[45]:\d\d/)).toBeInTheDocument();
  });
});

describe('bloqueio na demonstração', () => {
  it('conta 4, 3, 2, 1 e bloqueia na quinta tentativa errada', async () => {
    zerarTentativasDemo();
    const erros: (number | undefined)[] = [];
    for (let i = 0; i < 5; i++) {
      try {
        await autenticacaoDemonstrativa.entrar({ email: 'gestor@exemplo.invalid', senha: 'errada' });
      } catch (e) {
        erros.push((e as FalhaLogin).tentativasRestantes);
      }
    }
    expect(erros).toEqual([4, 3, 2, 1, 0]);
    await expect(autenticacaoDemonstrativa.entrar({ email: 'gestor@exemplo.invalid', senha: 'demo' })).rejects.toThrow('bloqueado temporariamente');
    zerarTentativasDemo();
    await expect(autenticacaoDemonstrativa.entrar({ email: 'gestor@exemplo.invalid', senha: 'demo' })).resolves.toMatchObject({ nome: 'Maria' });
  });
});

describe('resposta de login do servidor', () => {
  it('monta a mensagem só com números válidos do servidor', () => {
    expect(mensagemLogin(401, { remainingAttempts: 2 })?.mensagem).toBe('E-mail ou senha inválidos. Restam 2 tentativas antes do bloqueio temporário.');
    expect(mensagemLogin(401, { remainingAttempts: 1 })?.mensagem).toContain('Resta 1 tentativa');
    expect(mensagemLogin(429, { retryAfterSeconds: 61 })).toMatchObject({ restantes: 0, espera: 61 });
    expect(mensagemLogin(429, { retryAfterSeconds: 61 })?.mensagem).toContain('2 minutos');
    // Servidor antigo, valores estranhos ou texto injetado: usa a mensagem padrão.
    expect(mensagemLogin(401, undefined)).toBeUndefined();
    expect(mensagemLogin(401, { remainingAttempts: '<img src=x>' })).toBeUndefined();
    expect(mensagemLogin(401, { remainingAttempts: -1 })).toBeUndefined();
    expect(mensagemLogin(429, { retryAfterSeconds: 1e9 })).toBeUndefined();
  });
});

describe('lembrar de mim no MVP', () => {
  const url = 'http://127.0.0.1:8080';
  const sessao = { id: 's1', nome: 'Pessoa', loja: 'Loja', permissoes: ['consultar'], expiraEm: Date.now() + 60_000 };
  const token = 'a'.repeat(43);
  it('retoma a sessão válida da mesma API', () => {
    localStorage.setItem('planner:sessao-lembrada', JSON.stringify({ api: url, token, sessao }));
    expect(criarIntegracaoApi(url, contratoServidor).autenticacao.retomar!()).toMatchObject({ nome: 'Pessoa' });
  });
  it('descarta sessão expirada, de outra API ou com token inválido', () => {
    for (const salvo of [
      { api: url, token, sessao: { ...sessao, expiraEm: Date.now() - 1 } },
      { api: 'https://outro.example.invalid', token, sessao },
      { api: url, token: 'curto', sessao },
    ]) {
      localStorage.setItem('planner:sessao-lembrada', JSON.stringify(salvo));
      expect(criarIntegracaoApi(url, contratoServidor).autenticacao.retomar!()).toBeNull();
      expect(localStorage.getItem('planner:sessao-lembrada')).toBeNull();
    }
    localStorage.setItem('planner:sessao-lembrada', '{não é json');
    expect(criarIntegracaoApi(url, contratoServidor).autenticacao.retomar!()).toBeNull();
  });
});

describe('idiomas', () => {
  it('traduz textos, maiúsculas, mensagens com números e datas', () => {
    expect(traduzirTexto('Valor bruto', 'en')).toBe('Gross value');
    expect(traduzirTexto('Valor bruto', 'es')).toBe('Valor bruto');
    expect(traduzirTexto('TRIBUTO', 'en')).toBe('TAX');
    expect(traduzirTexto('  Senha ', 'es')).toBe('  Contraseña ');
    expect(traduzirTexto('E-mail ou senha inválidos. Restam 3 tentativas antes do bloqueio temporário.', 'en')).toBe('Invalid email or password. 3 attempts left before a temporary lock.');
    expect(traduzirTexto('Muitas tentativas erradas. O acesso foi bloqueado temporariamente. Tente novamente em 15 minutos ou recupere sua senha.', 'es')).toContain('15 minutos');
    expect(traduzirTexto('09 de out.', 'en')).toBe('Oct 09');
    expect(traduzirTexto('09 de out.', 'es')).toBe('09 oct');
    expect(traduzirTexto('Valor bruto', 'pt')).toBe('Valor bruto');
    expect(traduzirTexto('Texto que não existe', 'en')).toBe('Texto que não existe');
    expect(temTraducao('Texto que não existe')).toBe(false);
  });
});

describe('tema', () => {
  function simularSistema(escuro: boolean) {
    window.matchMedia = vi.fn().mockReturnValue({ matches: escuro, addEventListener: vi.fn(), removeEventListener: vi.fn() }) as never;
  }
  it('claro, escuro e do sistema', () => {
    simularSistema(true);
    expect(resolverTema('sistema')).toBe('escuro');
    simularSistema(false);
    expect(resolverTema('sistema')).toBe('claro');
    expect(resolverTema('escuro')).toBe('escuro');
  });
  it('aplica no documento e lembra a escolha', () => {
    simularSistema(false);
    aplicarTema('escuro');
    expect(document.documentElement.dataset.tema).toBe('escuro');
    expect(lerTema()).toBe('escuro');
    aplicarTema('sistema');
    expect(document.documentElement.dataset.tema).toBe('claro');
    localStorage.setItem('planner:tema', 'roxo');
    expect(lerTema()).toBe('sistema');
  });
});

describe('ícones "i"', () => {
  it('explicações existem nos três idiomas', () => {
    for (const idioma of ['pt', 'en', 'es'] as const) expect(explicacao('Valor bruto', idioma)?.length).toBeGreaterThan(20);
    expect(explicacao('TOTAL BRUTO', 'pt')).toBe(explicacao('total bruto', 'pt'));
  });
  it('coloca o "i" ao lado do rótulo sem mudar o nome do campo, e abre/fecha', async () => {
    document.body.innerHTML = '<main><label class="campo"><span>Valor bruto</span><input /></label><table><thead><tr><th>Status</th></tr></thead></table></main>';
    dicas.iniciar(document.body);
    const icone = document.querySelector('label .dica-i') as HTMLElement;
    expect(icone).not.toBeNull();
    expect(icone.previousElementSibling?.textContent).toBe('Valor bruto');
    expect(screen.getByRole('textbox', { name: 'Valor bruto' })).toBeInTheDocument();
    expect(document.querySelector('th .dica-i')).not.toBeNull();
    expect(icone).toHaveAttribute('aria-label', 'Mais informações');
    expect(icone).toHaveAccessibleDescription('Valor bruto');
    act(() => icone.focus());
    const balao = document.getElementById('dica-flutuante')!;
    expect(balao.hidden).toBe(false);
    expect(balao.getAttribute('role')).toBe('tooltip');
    expect(icone.getAttribute('aria-describedby')).toContain('dica-flutuante');
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(balao.hidden).toBe(true);
    act(() => icone.click());
    expect(balao.hidden).toBe(false);
    act(() => icone.click());
    expect(balao.hidden).toBe(true);
  });
});
