import { environment } from '../../environments/environment';

export const appConfig = {
  api: {
    baseUrl: environment.apiUrl,
    timeout: 30000, // 30 segundos
    retryAttempts: 3
  },
  websocket: {
    url: environment.wsUrl,
    reconnectInterval: 5000, // 5 segundos
    maxReconnectAttempts: 10
  },
  app: {
    name: environment.appName,
    version: '1.0.0',
    production: environment.production
  },
  auth: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
    tokenExpiryKey: 'token_expiry'
  },
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100
  }
};
