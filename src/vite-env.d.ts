/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "mock" (default) or "api" */
  readonly VITE_READING_SOURCE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
