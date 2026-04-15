const LOCAL_API_BASE_URL = 'http://localhost:5010/api/v1';
const DEPLOYED_API_BASE_URL = 'https://measurement.azurewebsites.net/api/v1';

export function getApiBaseUrl(): string {
  const hostname = globalThis.location?.hostname;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return LOCAL_API_BASE_URL;
  }

  return DEPLOYED_API_BASE_URL;
}
