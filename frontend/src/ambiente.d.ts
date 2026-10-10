interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_MODO_DADOS?: 'demo' | 'api';
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
