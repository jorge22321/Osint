# Plataforma OSINT

## Ejecutar con Docker

Requisitos: Docker Desktop con Docker Compose.

1. Crea `backend/.env` a partir de `backend/.env.example` y completa las credenciales.
   `SUPABASE_KEY` es la clave pública para solicitudes autenticadas. Configura
   `SUPABASE_SECRET_KEY` solo en el backend para envíos programados y
   enlaces públicos de capacitación (también se acepta la clave heredada
   `SUPABASE_SERVICE_ROLE_KEY`). Sin una de ellas se desactivan esos procesos. Esta
   clave omite RLS, así que nunca debe ir al frontend, a Git ni a la imagen;
   Docker la recibe únicamente como variable de entorno en ejecución.
2. En el SQL Editor de Supabase, ejecuta una vez estas migraciones, en orden:
   - `backend/supabase/migrations/20260915_add_target_phone.sql`
   - `backend/supabase/migrations/20260915_training_flow.sql`
   - `backend/supabase/migrations/20260916_platform_management.sql`
3. Configura `PUBLIC_BASE_URL` con la URL desde la que los destinatarios pueden
   abrir la plataforma. Para pruebas en la misma PC puede ser
   `http://localhost:8080`; solo funcionará en la PC que ejecuta Docker.
4. Construye e inicia los contenedores:

   ```bash
   docker compose up --build -d
   ```

5. Abre <http://localhost:8080>.

Docker publica la interfaz únicamente en `127.0.0.1`; otros equipos de la red
no pueden entrar a esta instalación. En otra PC con una copia del proyecto,
el mismo comando crea su propia interfaz local.

En esta instalación local puedes editar la configuración, preparar contenido,
consultar el historial y programar campañas de prueba por correo si el backend
tiene `SUPABASE_SECRET_KEY` configurada. Esos correos se envían realmente en la
fecha indicada, pero sus enlaces `localhost` solo funcionan si se abren en la
misma PC que ejecuta Docker. Antes de programar, la interfaz pide confirmación.
No programes correos para personas que los abrirán en otra PC o teléfono.
Smishing permanece bloqueado mientras el enlace sea `localhost`, porque un
teléfono no podría abrir la capacitación. Este modo no requiere dominio ni túnel.
Para probar el flujo completo: registra tu propio correo como empleado, crea una
campaña de phishing para ese único destinatario, elige una hora futura dentro
del horario configurado y confirma la programación. Mantén Docker encendido;
cuando llegue la hora, consulta **Historial de envíos** y abre el correo en esa
misma PC. La comprobación SMTP ocurre antes de crear la campaña. Aunque la
interfaz y el procesamiento corren en tu PC, esta configuración sigue usando
Supabase y Gmail como servicios externos; no es un modo sin Internet.

La pantalla **Configuración** comprueba SMTP y Twilio sin mostrar secretos. En una
cuenta de prueba de Twilio los SMS personalizados de smishing se rechazan; la
comprobación de conexión no equivale a una entrega. Las pruebas de envío se
activan por separado y requieren confirmación del administrador. El historial
separa aceptación del proveedor, entrega, fallos y clics.

En **Capacitación** puedes editar plantillas manuales o pedir una sugerencia
automática para revisarla antes de publicarla. La campaña guarda una copia fija de la
lección escogida; editar la plantilla después no cambia las campañas previas.

## Flujo de capacitación

Cada correo de phishing y SMS de smishing incluye un enlace único. Al abrirlo,
el backend registra el clic, actualiza el riesgo del empleado y redirige a una
microlección con quiz. El resultado queda almacenado en `modulo_educativo` y el
cambio de puntuación en `historial_riesgo`.

Para campañas de smishing, cada empleado debe tener un número telefónico en
formato internacional, por ejemplo `+51999999999`.

Las campañas se programan con fecha y hora local desde el asistente. Los envíos
quedan con estado `En Cola` y, una vez habilitado el procesamiento, el backend
revisa cada 30 segundos los que ya alcanzaron su `fecha_programada`; el mecanismo también recupera pendientes
después de reiniciar el contenedor.

El frontend publica el puerto `8080` y reenvía `/graphql` al backend a través de
la red interna de Docker. El backend no publica puertos en el host.

Para consultar el estado o detener la plataforma:

```bash
docker compose ps
docker compose logs -f
docker compose down
```

Los puertos se pueden cambiar sin editar el archivo Compose:

```bash
FRONTEND_PORT=8081 docker compose up --build -d
```
