interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_MODO_DADOS?: 'demo' | 'api';
  /** Vite: verdadeiro só no servidor de desenvolvimento (nunca no build publicado). */
  readonly DEV?: boolean;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
