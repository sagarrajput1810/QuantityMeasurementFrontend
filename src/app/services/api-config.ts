import { environment } from '../../environments/environment';

declare global {
  var __API_BASE_URL__: string | undefined;
}

export function getApiBaseUrl(): string {
  return globalThis.__API_BASE_URL__ || environment.apiBaseUrl;
}
