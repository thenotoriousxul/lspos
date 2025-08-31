# Configuración de Variables de Entorno

## Descripción
Este proyecto utiliza variables de entorno para manejar diferentes configuraciones entre desarrollo y producción.

## Archivos de Entorno

### Desarrollo (`src/environments/environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3333/api',
  wsUrl: 'ws://localhost:3333',
  appName: 'LS App - Desarrollo'
};
```

### Producción (`src/environments/environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-dominio.com/api',
  wsUrl: 'wss://tu-dominio.com',
  appName: 'LS App'
};
```

## Configuración

### Variables Disponibles

- **apiUrl**: URL base de la API del backend
- **wsUrl**: URL del WebSocket para notificaciones en tiempo real
- **appName**: Nombre de la aplicación
- **production**: Indica si está en modo producción

### Cómo Usar

1. **En servicios**: Importar `appConfig` desde `src/app/config/app.config.ts`
```typescript
import { appConfig } from '../config/app.config';

// Usar la configuración
const apiUrl = appConfig.api.baseUrl;
```

2. **En componentes**: Importar `environment` directamente
```typescript
import { environment } from '../../environments/environment';

// Usar directamente
const isProduction = environment.production;
```

## Cambiar Configuración

### Para Desarrollo
Edita `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3333/api', // Cambia el puerto si es necesario
  wsUrl: 'ws://localhost:3333',
  appName: 'LS App - Desarrollo'
};
```

### Para Producción
Edita `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-servidor.com/api', // Cambia por tu dominio real
  wsUrl: 'wss://tu-servidor.com',
  appName: 'LS App'
};
```

## Comandos de Build

- **Desarrollo**: `ng serve` (usa `environment.ts`)
- **Producción**: `ng build --configuration=production` (usa `environment.prod.ts`)

## Notas Importantes

1. **No committear credenciales**: Nunca incluyas contraseñas o tokens en los archivos de entorno
2. **Variables sensibles**: Para datos sensibles, usa variables de entorno del sistema operativo
3. **Backend**: Asegúrate de que el backend esté configurado para aceptar las URLs especificadas
4. **CORS**: Verifica que el backend tenga configurado CORS para las URLs de desarrollo y producción

## Ejemplo de Uso en Servicios

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { appConfig } from '../config/app.config';

@Injectable({
  providedIn: 'root'
})
export class MiServicio {
  private readonly baseUrl = appConfig.api.baseUrl;

  constructor(private http: HttpClient) {}

  getData() {
    return this.http.get(`${this.baseUrl}/mi-endpoint`);
  }
}
```
