# Plan para añadir registro y login de usuarios con Zod, Airtable y Resend

## Objetivo

Añadir una capa de autenticación básica a la aplicación para:

- registrar usuarios,
- verificar su correo electrónico,
- permitir login seguro,
- persistir usuarios en Airtable,
- validar entradas con `zod`,
- enviar correos de verificación con Resend.

Este plan está pensado para la estructura actual del proyecto (`Next.js App Router` con rutas API simples y utilidades en `lib/`).

## Campos de Airtable a tener en cuenta

Según el PDF `Test_ Usuarios - Airtable.pdf`, la tabla de usuarios debe contemplar estos campos:

- `Email`
- `Nombre`
- `Password Hash`
- `Rol`
- `Estado`
- `Email Verificado`
- `Token Verificacion`
- `Token Recuperacion`
- `Token Expiracion`
- `Fecha Registro`
- `Ultimo Login`
- `Intentos Fallidos`

## Decisiones técnicas recomendadas

### 1. Mantener autenticación propia, no introducir un framework completo todavía

Dado que el proyecto actual es pequeño y no tiene capa de auth previa, la opción más simple y controlable es:

- `zod` para validar `register`, `login`, `verify-email` y `forgot/reset password`,
- `bcryptjs` para hash de contraseñas,
- `crypto` nativo para generar tokens,
- cookie `HttpOnly` para sesión simple,
- Airtable como almacenamiento inicial de usuarios.

Esto reduce complejidad y encaja mejor con la arquitectura actual.

### 2. No guardar nunca la contraseña en texto plano

El campo `Password Hash` en Airtable debe almacenar únicamente el hash de la contraseña.  
La contraseña original solo se usa durante la validación de entrada y el proceso de hash.

### 3. Separar estado de acceso y verificación

Usar `Estado` y `Email Verificado` con responsabilidades distintas:

- `Estado`: `pendiente`, `activo`, `bloqueado`
- `Email Verificado`: `true/false`

Regla recomendada:

- usuario recién creado: `Estado = pendiente`, `Email Verificado = false`
- al verificar correo: `Estado = activo`, `Email Verificado = true`

## Dependencias a añadir

Instalar como mínimo:

```bash
npm install zod bcryptjs resend
```

Opcional pero útil:

```bash
npm install jose
```

`jose` sería útil si luego quieres migrar la sesión a JWT firmados. Si quieres una primera versión mínima, puede omitirse y manejar una cookie de sesión con un token aleatorio persistido en Airtable o en una tabla aparte.

## Diseño funcional

### Flujo de registro

1. El usuario envía `nombre`, `email` y `password`.
2. La API valida con `zod`.
3. Se comprueba en Airtable si el `Email` ya existe.
4. Se genera `passwordHash` con `bcryptjs`.
5. Se genera `tokenVerificacion` aleatorio y `tokenExpiracion`.
6. Se crea el registro en Airtable con:
   - `Email`
   - `Nombre`
   - `Password Hash`
   - `Rol = editor` o el rol por defecto que definas
   - `Estado = pendiente`
   - `Email Verificado = false`
   - `Token Verificacion`
   - `Token Expiracion`
   - `Fecha Registro`
   - `Intentos Fallidos = 0`
7. Se envía correo con Resend incluyendo un enlace de verificación.

### Flujo de verificación de correo

1. El usuario hace clic en el enlace recibido por email.
2. La API recibe el `token`.
3. Busca el usuario por `Token Verificacion`.
4. Verifica que el token exista y no haya expirado.
5. Actualiza en Airtable:
   - `Email Verificado = true`
   - `Estado = activo`
   - `Token Verificacion = ""` o `null`
   - `Token Expiracion = ""` o `null`
6. Redirige a login con mensaje de éxito.

### Flujo de login

1. El usuario envía `email` y `password`.
2. La API valida con `zod`.
3. Busca el usuario por `Email`.
4. Si no existe, responde error genérico.
5. Si `Estado != activo` o `Email Verificado != true`, bloquea el acceso.
6. Compara password ingresado vs `Password Hash` con `bcryptjs.compare`.
7. Si falla:
   - incrementa `Intentos Fallidos`
   - opcionalmente bloquea si supera un umbral
8. Si funciona:
   - reinicia `Intentos Fallidos = 0`
   - actualiza `Ultimo Login`
   - crea sesión segura en cookie `HttpOnly`

## Estructura sugerida de archivos

### Nuevos archivos

- `lib/auth/schemas.ts`
- `lib/auth/tokens.ts`
- `lib/auth/password.ts`
- `lib/auth/session.ts`
- `lib/airtable-users.ts`
- `lib/email.ts`
- `app/api/auth/register/route.ts`
- `app/api/auth/login/route.ts`
- `app/api/auth/verify-email/route.ts`
- `app/login/page.tsx`
- `app/registro/page.tsx`
- `app/verificar-email/page.tsx`

### Archivos a ajustar

- `lib/types.ts`
- `.env.example`
- `app/page.tsx`
- si aplica, `middleware.ts` para proteger rutas privadas

## Esquemas Zod recomendados

### Registro

Campos:

- `nombre`: string, requerido, longitud razonable
- `email`: `z.string().email()`
- `password`: mínimo 8 caracteres
- `confirmPassword`: debe coincidir con `password`

Validaciones recomendadas:

- normalizar email a minúsculas,
- trim en `nombre`,
- exigir una contraseña con mínimo aceptable y mensaje claro.

### Login

Campos:

- `email`
- `password`

### Verificación

Campos:

- `token`

## Mapeo entre app y Airtable

Definir una capa específica para usuarios, separada de la actual `lib/airtable.ts` de facturas.

### Ejemplo de modelo lógico

```ts
type UserRole = "admin" | "editor";
type UserStatus = "pendiente" | "activo" | "bloqueado";

interface AirtableUserFields {
  Email: string;
  Nombre: string;
  "Password Hash": string;
  Rol: UserRole;
  Estado: UserStatus;
  "Email Verificado": boolean;
  "Token Verificacion"?: string;
  "Token Recuperacion"?: string;
  "Token Expiracion"?: string;
  "Fecha Registro": string;
  "Ultimo Login"?: string;
  "Intentos Fallidos": number;
}
```

## Variables de entorno a añadir

Agregar en `.env.example`:

```env
# Airtable usuarios
AIRTABLE_USERS_TABLE_NAME=Usuarios

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# App
APP_BASE_URL=http://localhost:3000

# Sesiones
AUTH_COOKIE_NAME=fw_session
AUTH_SESSION_SECRET=
```

Notas:

- `RESEND_FROM_EMAIL` debe usar un dominio configurado en Resend.
- `APP_BASE_URL` se usa para construir el enlace de verificación.
- `AUTH_SESSION_SECRET` debe ser largo y aleatorio.

## Envío de correos con Resend

### Contenido mínimo del email de verificación

- asunto claro: `Verifica tu correo`
- saludo con nombre si existe
- botón o enlace con URL tipo:

```txt
${APP_BASE_URL}/verificar-email?token=...
```

### Recomendación de implementación

Crear `lib/email.ts` con una función como:

```ts
sendVerificationEmail({ to, name, token })
```

Responsabilidades:

- construir URL de verificación,
- enviar con Resend,
- aislar la integración para futuras plantillas.

## Sesión y protección de rutas

### Primera versión recomendada

Implementar una sesión sencilla basada en cookie `HttpOnly`, `Secure`, `SameSite=Lax`.

Opciones:

- versión mínima: guardar un token de sesión firmado en cookie,
- versión más robusta: guardar un `sessionId` aleatorio y persistir sesiones en Airtable o en otra store.

Para este proyecto, la opción más pragmática es empezar con cookie firmada y payload mínimo:

- `userId`
- `email`
- `rol`

Si más adelante aparecen requisitos de revocación de sesión, convendrá pasar a sesiones persistidas.

### Middleware

Añadir `middleware.ts` solo cuando ya existan rutas privadas.  
No hace falta introducirlo antes de tener páginas protegidas.

## Manejo de errores y seguridad

### Reglas mínimas

- no revelar si un email existe o no en ciertos flujos sensibles,
- aplicar mensajes de error genéricos en login,
- limitar intentos fallidos,
- invalidar tokens usados o expirados,
- usar expiración corta para `Token Verificacion` y `Token Recuperacion`,
- registrar fechas en ISO 8601.

### Recomendaciones concretas

- `Token Expiracion`: 15 minutos a 24 horas según flujo
- `Token Verificacion`: 24 horas
- `Token Recuperacion`: 15 a 60 minutos
- bloqueo por intentos fallidos: por ejemplo a partir de 5 intentos

## Fases de implementación

### Fase 1. Fundaciones

- instalar dependencias,
- crear tipos de usuario,
- crear capa `lib/airtable-users.ts`,
- definir variables de entorno nuevas,
- crear esquemas `zod`.

### Fase 2. Registro y verificación

- implementar `POST /api/auth/register`,
- guardar usuario en Airtable,
- enviar email con Resend,
- implementar `GET/POST /api/auth/verify-email`,
- crear UI básica de registro y confirmación.

### Fase 3. Login y sesión

- implementar `POST /api/auth/login`,
- crear cookie de sesión,
- añadir logout,
- actualizar `Ultimo Login`,
- reiniciar o incrementar `Intentos Fallidos`.

### Fase 4. Protección y recuperación

- proteger páginas privadas,
- implementar `forgot-password`,
- implementar `reset-password`,
- usar `Token Recuperacion` y `Token Expiracion`.

## Orden de trabajo recomendado

1. Preparar tabla `Usuarios` en Airtable con nombres exactos de columnas.
2. Añadir dependencias y variables de entorno.
3. Crear tipos y esquemas `zod`.
4. Crear capa de lectura/escritura de usuarios en Airtable.
5. Implementar `register`.
6. Integrar Resend para verificación.
7. Implementar `verify-email`.
8. Implementar `login`.
9. Añadir sesión por cookie.
10. Proteger rutas privadas.
11. Implementar recuperación de contraseña.

## Riesgos y puntos de atención

### 1. Airtable no es una base de auth ideal

Funciona para un MVP o herramienta interna, pero tiene limitaciones para auth:

- búsquedas menos eficientes,
- sesiones no nativas,
- rate limits,
- menor ergonomía para consultas seguras y auditoría.

Si el producto crece, convendrá migrar usuarios y sesiones a una base relacional o a un proveedor de auth.

### 2. Tipos de campo en Airtable

Conviene revisar que:

- `Email Verificado` sea boolean,
- `Intentos Fallidos` sea numérico,
- `Fecha Registro`, `Ultimo Login` y `Token Expiracion` sean fecha/hora,
- `Rol` y `Estado` sean single select o texto controlado.

### 3. API key expuesta

La API key de Airtable y la de Resend deben quedarse exclusivamente del lado servidor.  
No deben exponerse a componentes cliente ni a variables `NEXT_PUBLIC_*`.

## Resultado esperado

Al finalizar, la app tendrá:

- registro de usuarios validado con `zod`,
- contraseñas hasheadas,
- persistencia en Airtable usando los campos definidos,
- verificación por correo con Resend,
- login con control de estado del usuario,
- base lista para recuperación de contraseña y protección de rutas.

## Siguiente paso recomendado

Implementar primero la tabla `Usuarios` y la capa `lib/airtable-users.ts`, porque todo el flujo de registro, verificación y login depende de que el mapeo con Airtable quede estable desde el principio.
