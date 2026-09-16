-- Campo requerido para campañas de smishing. Es seguro ejecutar esta migración
-- aunque la columna ya exista.
ALTER TABLE usuarios_objetivo
  ADD COLUMN IF NOT EXISTS telefono VARCHAR(30);
