export const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || 'your-super-secret-key-min-32-chars',
  EXPIRES_IN: '24h',
  COOKIE_NAME: 'admin_token'
}; 