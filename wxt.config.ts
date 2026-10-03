import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],

  manifest: {
    name: 'Synapse AI',
    description: 'AI-powered browser assistant',
   permissions: [
  'activeTab',
  'tabs',
  'scripting',
  'storage',
  'identity',
],
oauth2: {
 client_id: '167805633388-fepp24u0rrc0nimn58spd0hhfou76u4q.apps.googleusercontent.com',
  scopes: [
    'https://www.googleapis.com/auth/gmail.readonly',
  ],
},
   host_permissions: [
  '<all_urls>',
  'http://localhost:11434/*',
  'http://127.0.0.1:11434/*',
  'https://gmail.googleapis.com/*',
],
  },
});