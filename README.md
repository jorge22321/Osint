# Plataforma OSINT

## Ejecutar con Docker

Requisitos: Docker Desktop con Docker Compose.

1. Crea `backend/.env` a partir de `backend/.env.example` y completa las credenciales.
2. En el SQL Editor de Supabase, ejecuta una vez estas migraciones, en orden:
   - `backend/supabase/migrations/20260915_add_target_phone.sql`
   - `backend/supabase/migrations/20260915_training_flow.sql`
3. Configura `PUBLIC_BASE_URL` con la URL desde la que los destinatarios pueden
   abrir la plataforma. Para pruebas en la misma PC puede ser
   `http://localhost:8080`; para campañas reales debe ser una URL HTTPS pública.
4. Construye e inicia los contenedores:

   ```bash
   docker compose up --build -d
   ```

5. Abre <http://localhost:8080>.

## Flujo de capacitación

Cada correo de phishing y SMS de smishing incluye un enlace único. Al abrirlo,
el backend registra el clic, actualiza el riesgo del empleado y redirige a una
microlección con quiz. El resultado queda almacenado en `modulo_educativo` y el
cambio de puntuación en `historial_riesgo`.

Para campañas de smishing, cada empleado debe tener un número telefónico en
formato internacional, por ejemplo `+51999999999`.

Las campañas se programan con fecha y hora local desde el asistente. Los envíos
quedan con estado `En Cola` y el backend procesa cada 30 segundos los que ya
alcanzaron su `fecha_programada`; el mecanismo también recupera pendientes
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
