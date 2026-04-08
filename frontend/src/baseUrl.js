function resolveBaseUrl() {
  if (typeof import.meta !== 'undefined' && import.meta.url) {
    try {
      const pathname = new URL(import.meta.url).pathname;
      const assetsIdx = pathname.indexOf('/assets/');
      if (assetsIdx > 0) {
        return `${pathname.slice(0, assetsIdx)}/`;
      }
    } catch {
    }
  }
  const env = typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL;
  if (env) {
    return env.endsWith('/') ? env : `${env}/`;
  }
  return '/';
}

export const baseUrl = resolveBaseUrl();

import pkg from '../package.json';

const configuredApiUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  (import.meta.env?.DEV ? 'http://localhost:3000/api' : pkg?.config?.api_url) ||
  'http://localhost:3000/api';

export const apiUrl = configuredApiUrl.replace(/\/+$/, '');

export const apiOrigin =
  apiUrl.replace(/\/api\/?$/, '') || 'http://localhost:3000';

export const graphqlHttpUrl = `${apiOrigin}/api/graphql`;
