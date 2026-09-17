-- Ajustes, biblioteca de capacitación e historial verificable por organización.
ALTER TABLE campanas
  ADD COLUMN IF NOT EXISTS training_snapshot JSONB,
  ADD COLUMN IF NOT EXISTS training_template_id UUID,
  ADD COLUMN IF NOT EXISTS training_template_version INTEGER;

ALTER TABLE envios_simulacion
  ADD COLUMN IF NOT EXISTS provider_message_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_status TEXT,
  ADD COLUMN IF NOT EXISTS provider_error_code TEXT,
  ADD COLUMN IF NOT EXISTS provider_error_message TEXT,
  ADD COLUMN IF NOT EXISTS fecha_estado_proveedor TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS intentos INTEGER NOT NULL DEFAULT 0;

ALTER TABLE envios_simulacion DROP CONSTRAINT IF EXISTS chk_estado_envio;
ALTER TABLE envios_simulacion ADD CONSTRAINT chk_estado_envio
  CHECK (estado IN ('En Cola', 'Aceptado', 'Enviado', 'Entregado', 'Fallido', 'Abierto', 'Clickeado', 'Reportado'));

CREATE INDEX IF NOT EXISTS idx_envios_campana_historial
  ON envios_simulacion (id_campana, fecha_envio DESC);
CREATE INDEX IF NOT EXISTS idx_envios_provider_pendiente
  ON envios_simulacion (provider_status) WHERE provider_message_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS configuracion_organizacion (
  id_organizacion UUID PRIMARY KEY REFERENCES organizaciones(id) ON DELETE CASCADE,
  nombre_mostrado TEXT NOT NULL DEFAULT '',
  zona_horaria TEXT NOT NULL DEFAULT 'America/Lima',
  hora_inicio TIME NOT NULL DEFAULT '08:00',
  hora_fin TIME NOT NULL DEFAULT '18:00',
  limite_destinatarios INTEGER NOT NULL DEFAULT 100 CHECK (limite_destinatarios BETWEEN 1 AND 10000),
  nota_minima INTEGER NOT NULL DEFAULT 67 CHECK (nota_minima BETWEEN 0 AND 100),
  permitir_borradores_ia BOOLEAN NOT NULL DEFAULT TRUE,
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plantillas_capacitacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_organizacion UUID NOT NULL REFERENCES organizaciones(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  canal TEXT NOT NULL CHECK (canal IN ('Phishing', 'Smishing')),
  contenido_json JSONB NOT NULL,
  origen TEXT NOT NULL DEFAULT 'Manual' CHECK (origen IN ('Manual', 'IA')),
  estado TEXT NOT NULL DEFAULT 'Borrador' CHECK (estado IN ('Borrador', 'Publicada')),
  version INTEGER NOT NULL DEFAULT 1,
  creado_por UUID NOT NULL REFERENCES administradores(id),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_plantillas_org_canal
  ON plantillas_capacitacion (id_organizacion, canal, actualizado_en DESC);

CREATE TABLE IF NOT EXISTS auditoria_configuracion (
  id BIGSERIAL PRIMARY KEY,
  id_organizacion UUID NOT NULL REFERENCES organizaciones(id) ON DELETE CASCADE,
  id_admin UUID NOT NULL REFERENCES administradores(id),
  accion TEXT NOT NULL,
  detalle JSONB NOT NULL DEFAULT '{}'::jsonb,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_auditoria_config_org_fecha
  ON auditoria_configuracion (id_organizacion, creado_en DESC);

ALTER TABLE configuracion_organizacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE plantillas_capacitacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria_configuracion ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS org_admin_config ON configuracion_organizacion;
CREATE POLICY org_admin_config ON configuracion_organizacion FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM administradores a WHERE a.email = auth.jwt()->>'email' AND a.id_organizacion = configuracion_organizacion.id_organizacion))
  WITH CHECK (EXISTS (SELECT 1 FROM administradores a WHERE a.email = auth.jwt()->>'email' AND a.id_organizacion = configuracion_organizacion.id_organizacion));

DROP POLICY IF EXISTS org_admin_plantillas ON plantillas_capacitacion;
CREATE POLICY org_admin_plantillas ON plantillas_capacitacion FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM administradores a WHERE a.email = auth.jwt()->>'email' AND a.id_organizacion = plantillas_capacitacion.id_organizacion))
  WITH CHECK (EXISTS (SELECT 1 FROM administradores a WHERE a.email = auth.jwt()->>'email' AND a.id_organizacion = plantillas_capacitacion.id_organizacion));

DROP POLICY IF EXISTS org_admin_auditoria ON auditoria_configuracion;
CREATE POLICY org_admin_auditoria ON auditoria_configuracion FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM administradores a WHERE a.email = auth.jwt()->>'email' AND a.id_organizacion = auditoria_configuracion.id_organizacion));
DROP POLICY IF EXISTS org_admin_auditoria_insert ON auditoria_configuracion;
CREATE POLICY org_admin_auditoria_insert ON auditoria_configuracion FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM administradores a WHERE a.email = auth.jwt()->>'email' AND a.id_organizacion = auditoria_configuracion.id_organizacion AND a.id = auditoria_configuracion.id_admin));
