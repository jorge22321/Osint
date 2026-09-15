# Plataforma OSINT

## Ejecutar con Docker

Requisitos: Docker Desktop con Docker Compose.

1. Crea `backend/.env` a partir de `backend/.env.example` y completa las credenciales.
2. Construye e inicia los contenedores:

   ```bash
   docker compose up --build -d
   ```

3. Abre <http://localhost:8080>.

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
