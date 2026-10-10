import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    // Fluxos completos e axe podem levar mais tempo em máquinas compartilhadas.
    testTimeout: 30000,
    hookTimeout: 15000,
    setupFiles: ['./src/testes/configurarTestes.ts'],
  },
});
