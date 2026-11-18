import { criarIntegracaoApi } from './servicos/adaptarEValidarRespostasApi';
import { contratoServidor } from './servicos/contratoBackendPlanner';
import { lerUrlApi } from './servicos/configuracaoAmbiente';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Aplicacao, LimiteErro } from './Aplicacao';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import '@fontsource/outfit/latin-400.css';
import '@fontsource/outfit/latin-500.css';
import '@fontsource/outfit/latin-600.css';
import '@fontsource/outfit/latin-700.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import '@fontsource/jetbrains-mono/latin-600.css';
import '@fontsource/jetbrains-mono/latin-700.css';
import './estilos.css';
import './design-fidelidade.css';
import './estilos-pos.css';
import './preferencias/preferencias.css';
import './preferencias/tema-escuro.css';
import { aplicarTema, lerTema } from './preferencias/tema';
import { lerIdioma, tradutor, traduzirTexto, temTraducao } from './preferencias/idioma';
import { textosSemTraducao } from './preferencias/traducoes';
import { dicas } from './preferencias/dicas';
import { SeletorPreferencias } from './componentes/SeletorPreferencias';
aplicarTema(lerTema(), false);
let integracao: ReturnType<typeof criarIntegracaoApi> | undefined;
let erroConfiguracao = '';
try {
  const modo = import.meta.env.VITE_MODO_DADOS ?? 'api';
  if (modo !== 'demo' && modo !== 'api') throw new Error('Modo de dados inválido.');
  if (modo === 'api') {
    const url = lerUrlApi({
      ...import.meta.env,
      VITE_API_URL: import.meta.env.VITE_API_URL || window.location.origin,
    });
    if (!url || !contratoServidor)
      throw new Error(
        'Integração não configurada. É necessário definir a URL e o contrato do servidor. Nenhum dado será carregado até corrigir a configuração.',
      );
    integracao = criarIntegracaoApi(url, contratoServidor);
  }
} catch (e) {
  erroConfiguracao = e instanceof Error ? e.message : 'Configuração indisponível.';
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LimiteErro>
      {erroConfiguracao ? (
        <main className="cartao-entrada">
          <SeletorPreferencias flutuante />
          <h1>Configuração de integração pendente</h1>
          <p role="alert">{erroConfiguracao}</p>
        </main>
      ) : (
        <Aplicacao integracao={integracao} />
      )}
    </LimiteErro>
  </StrictMode>,
);
tradutor.iniciar(document.body, lerIdioma());
dicas.iniciar(document.body);
// Somente em desenvolvimento/testes: permite aos testes de navegador conferir dicas e traduções.
if (import.meta.env.DEV) Object.assign(window, { __planner: { dicas, tradutor, traduzirTexto, temTraducao, textosSemTraducao } });
