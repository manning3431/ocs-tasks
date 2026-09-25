interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_SHELL_REMOTE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}