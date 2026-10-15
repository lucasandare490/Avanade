import { criarIntegracaoApi } from './servicos/adaptarEValidarRespostasApi';
import { contratoServidor } from './servicos/contratoBackendPlanner';
import { lerUrlApi } from './servicos/configuracaoAmbiente';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Aplicacao, LimiteErro } from './Aplicacao';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-600.css';
import '@fontsource/manrope/latin-700.css';
import '@fontsource/manrope/latin-800.css';
import './estilos.css';
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
        'Integração não configurada. É necessário definir a URL e o contrato do servidor. Nenhum dado demonstrativo será carregado neste modo.',
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
          <h1>Configuração de integração pendente</h1>
          <p role="alert">{erroConfiguracao}</p>
        </main>
      ) : (
        <Aplicacao integracao={integracao} />
      )}
    </LimiteErro>
  </StrictMode>,
);
