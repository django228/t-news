export const baseUrl = typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL
  ? import.meta.env.BASE_URL
  : '/';

import pkg from '../package.json';
export const apiOrigin = (pkg?.config?.api_url || 'http://localhost:3000/api').replace(/\/api\/?$/, '') || 'http://localhost:3000';
