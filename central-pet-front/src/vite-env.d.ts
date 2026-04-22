/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_AUTH_STRATEGY: 'mock' | 'session';
  readonly VITE_DISPLAY_MOCK_CHOICE_GATE?: 'true' | 'false';
  readonly VITE_SITE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
