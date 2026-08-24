import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],

  manifest: {
    name: 'Synapse AI',
    description: 'AI-powered browser assistant with Summarizer and Context Q&A',
    permissions: ['activeTab', 'tabs', 'scripting'],
    host_permissions: [
      '<all_urls>',
      'http://localhost:11434/*',
      'http://127.0.0.1:11434/*',
    ],
  },
});