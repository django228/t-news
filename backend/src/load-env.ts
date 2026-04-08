import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../.env') });

const profile = (process.env.DATABASE_PROFILE || 'local').toLowerCase();

if (profile === 'render' && process.env.DATABASE_URL_RENDER) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_RENDER;
} else if (profile === 'local' && process.env.DATABASE_URL_LOCAL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_LOCAL;
}
