/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_AUTH_STRATEGY: 'mock' | 'jwt';
  readonly VITE_DISPLAY_MOCK_CHOICE_GATE?: 'true' | 'false';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
