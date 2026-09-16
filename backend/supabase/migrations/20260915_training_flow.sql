-- Flujo de impacto y educación para campañas de phishing y smishing.
ALTER TABLE usuarios_objetivo
  ADD COLUMN IF NOT EXISTS telefono VARCHAR(30);

CREATE TABLE IF NOT EXISTS modulo_educativo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_envio UUID NOT NULL REFERENCES envios_simulacion(id) ON DELETE CASCADE,
  id_usuario_objetivo UUID NOT NULL REFERENCES usuarios_objetivo(id) ON DELETE CASCADE,
  estado VARCHAR(30) NOT NULL DEFAULT 'Pendiente'
    CHECK (estado IN ('Pendiente', 'En Curso', 'Completado')),
  puntaje_quiz INTEGER CHECK (puntaje_quiz >= 0 AND puntaje_quiz <= 100),
  respuestas_json JSONB,
  fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  fecha_completado TIMESTAMP WITH TIME ZONE
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_modulo_educativo_envio
  ON modulo_educativo(id_envio);

CREATE TABLE IF NOT EXISTS historial_riesgo (
  id BIGSERIAL PRIMARY KEY,
  id_usuario_objetivo UUID NOT NULL REFERENCES usuarios_objetivo(id) ON DELETE CASCADE,
  score_anterior NUMERIC(5,2) NOT NULL,
  score_nuevo NUMERIC(5,2) NOT NULL,
  motivo VARCHAR(255) NOT NULL,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_historial_usuario_fecha
  ON historial_riesgo(id_usuario_objetivo, creado_en DESC);
