// Vite client type declarations and typed import.meta.env for the Admin SPA.
// File: src/vite-env.d.ts
// Author: Hasif Ahmed <xmart@live.com> (www.hasif.info)
// Created: 2026-06-26

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
