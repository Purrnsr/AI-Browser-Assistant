import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],

  manifest: {
    name: 'Synapse AI',
    description: 'AI-powered browser assistant',
    permissions: ['activeTab', 'tabs', 'scripting', 'storage'],
    host_permissions: [
      '<all_urls>',
      'http://localhost:11434/*',
      'http://127.0.0.1:11434/*',
    ],
  },
});