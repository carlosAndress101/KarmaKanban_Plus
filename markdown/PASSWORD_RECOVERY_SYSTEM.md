# Sistema de Recuperación de Contraseña con OTP

Este documento describe la implementación completa del sistema de recuperación de contraseña con código OTP para KarmaKanban.

## 🔐 Características

- **Seguridad robusta**: Códigos OTP de 6 dígitos con expiración de 10 minutos
- **Validación estricta**: Control de intentos y tokens únicos
- **UI/UX intuitiva**: Interfaz moderna y responsive
- **Notificaciones por email**: Templates HTML profesionales
- **Validación de contraseñas**: Indicador de fortaleza y requisitos mínimos para que cada usuario se esfuerce a la hora de asignar una contrasena mejor

## 📁 Estructura del Proyecto

### Backend

#### Rutas de API (`/api/auth/`)

- `POST /forgot-password` - Solicitar código OTP
- `POST /verify-otp` - Verificar código OTP
- `POST /reset-password` - Cambiar contraseña
- `POST /resend-otp` - Reenviar código OTP

#### Servicios

- **EmailService** (`src/lib/email/email-service.ts`)
  - Envío de emails con templates HTML fue la mejor opcion y no instalar una libreria adicional
  - Confirmaciones de cambio de contraseña
- **OTPService** (`src/lib/email/otp-service.ts`)
  - Generación y validación de códigos OTP
  - Gestión de tokens de recuperación
  - Limpieza automática de códigos expirados

#### Base de Datos

- **Tabla**: `password_reset_tokens`
  - `id` (uuid, PK)
  - `email` (text)
  - `token` (text, unique)
  - `expires_at` (timestamp)
  - `used` (boolean)
  - `created_at` (timestamp)

### Frontend

#### Páginas

- `/forgot-password` - Solicitar recuperación
- `/verify-otp` - Verificar código OTP
- `/reset-password` - Establecer nueva contraseña

#### Hooks API

- `useForgotPassword()` - Hook para solicitar código
- `useVerifyOtp()` - Hook para verificar OTP
- `useResetPassword()` - Hook para cambiar contraseña
- `useResendOtp()` - Hook para reenviar código

## 🚀 Instalación y Configuración

### 1. Instalar Dependencias

```bash
bun add otp-generator
bun add nodemailer
```

### 2. Configurar Base de Datos

```bash
# Generar migración
bun run db:generate
```

### 3. Configuración de Email

Actualiza las credenciales en `src/lib/email/email-service.ts`:

```typescript
const emailConfig: EmailConfig = {
  service: "gmail",
  user: "tu-email@gmail.com", // Correo de envio
  pass: "tu-app-password", // Password de aplicación de Gmail
};
```

## 📋 Flujo de Usuario

### 1. Solicitar Recuperación

1. Usuario ingresa su email en `/forgot-password`
2. Sistema verifica que el email existe
3. Genera código OTP de 6 dígitos
4. Envía email con código y redirige a verificación

### 2. Verificar Código OTP

1. Usuario ingresa código de 6 dígitos en `/verify-otp`
2. Sistema valida código y expiración
3. Genera token de recuperación válido por 30 minutos
4. Redirige a página de nueva contraseña

### 3. Establecer Nueva Contraseña

1. Usuario crea nueva contraseña en `/reset-password`
2. Sistema valida fortaleza de contraseña
3. Actualiza contraseña en base de datos
4. Marca token como usado
5. Envía confirmación por email

## 🔒 Medidas de Seguridad

### Códigos OTP

- **Longitud**: 6 dígitos numéricos
- **Expiración**: 10 minutos
- **Límite de intentos**: 5 intentos fallidos
- **Un solo uso**: Se elimina tras verificación exitosa

### Tokens de Recuperación

- **Longitud**: 32 caracteres alfanuméricos
- **Expiración**: 30 minutos
- **Un solo uso**: Se marca como usado tras cambio
- **Limpieza automática**: Tokens expirados se eliminan

### Validación de Contraseñas

- **Mínimo**: 8 caracteres
- **Requisitos**: Mayúscula, minúscula y número
- **Indicador de fortaleza**: Visual en tiempo real
- **Confirmación**: Doble entrada para evitar errores

## 🎨 Características de UI/UX

### Diseño

- **Responsive**: Adaptable a todos los dispositivos
- **Iconografía**: Lucide Icons para consistencia
- **Colores**: Sistema de colores semánticos

### Interactividad

- **Validación en tiempo real**: Feedback inmediato
- **Estados de carga**: Spinners y estados disabled
- **Temporizadores**: Countdown visual para expiración
- **Navegación intuitiva**: Enlaces de regreso y avance

### Accesibilidad

- **Campos numéricos**: InputMode para teclados móviles
- **Labels descriptivos**: Texto claro para screen readers
- **Contraste**: Colores con contraste adecuado
- **Focus visible**: Indicadores de foco claros

## 📧 Templates de Email

### Email de OTP

- **Asunto**: "Código de Verificación - Recuperar Contraseña"
- **Contenido**: Código destacado con instrucciones
- **Advertencias**: Tiempo de expiración y seguridad

### Email de Confirmación

- **Asunto**: "Contraseña Actualizada Exitosamente"
- **Contenido**: Confirmación de cambio exitoso
- **Timestamp**: Fecha y hora del cambio

## 🛠️ Desarrollo y Testing

### Scripts Útiles

```bash
# Desarrollo
bun run dev
```

### Testing Manual

1. **Flujo Completo**:

   - Ir a `/sign-in`
   - Hacer clic en "¿Olvidaste tu contraseña?"
   - Completar todo el flujo

2. **Casos Edge**:
   - Email no registrado
   - Código OTP expirado
   - Token de recuperación inválido
   - Contraseña débil

## 📊 Métricas y Monitoreo

### Logs Importantes

- Emails enviados exitosamente
- Intentos de OTP fallidos
- Tokens expirados
- Cambios de contraseña exitosos

### Posibles Mejoras

- **Rate Limiting**: Limitar solicitudes por IP
- **Auditoria**: Log de todos los intentos de recuperación
- **Métricas**: Dashboard de uso del sistema
- **Multi-factor**: SMS como alternativa al email

## 🔧 Configuración Avanzada

### Variables de Entorno (Producción)

```env
EMAIL_SERVICE=gmail
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password
OTP_EXPIRATION_MINUTES=10
TOKEN_EXPIRATION_MINUTES=30
```

### Personalización de Emails

Los templates están en `src/lib/email/email-service.ts` y pueden ser personalizados:

- Cambiar colores y logos
- Modificar textos y idioma
- Añadir elementos de marca

## 🚨 Solución de Problemas

### Email no se envía

1. Verificar credenciales de Gmail
2. Confirmar que la contraseña de aplicación esté activa
3. Revisar logs de la consola

### Base de datos

1. Verificar conexión a la BD
2. Ejecutar script manual de creación de tabla
3. Revisar permisos de usuario de BD

### Códigos OTP no funcionan

1. Verificar que el tiempo del servidor sea correcto
2. Comprobar que el email llegue a la bandeja
3. Revisar logs del servicio OTP

---

**Desarrollado por**: Carlos Andrés Hinestroza  
**Email**: carlostheoro@gmail.com  
**Proyecto**: KarmaKanban  
**Versión**: 1.0.0
