export const baseUrl = typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL
  ? import.meta.env.BASE_URL
  : '/';

import pkg from '../package.json';

const configuredApiUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  (import.meta.env?.DEV ? 'http://localhost:3000/api' : pkg?.config?.api_url) ||
  'http://localhost:3000/api';

export const apiUrl = configuredApiUrl.replace(/\/+$/, '');

export const apiOrigin =
  apiUrl.replace(/\/api\/?$/, '') || 'http://localhost:3000';

export const graphqlHttpUrl = `${apiOrigin}/api/graphql`;
