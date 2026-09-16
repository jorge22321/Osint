//backend/src/modules/osint/infrastructure/providers/OsintAggregateAdapter.ts
import { IOsintProvider, OsintHallazgo } from '../../domain/ports/IOsintProvider';

export interface ProviderStatus {
  nombre: string;
  estado: 'OK' | 'ERROR';
  hallazgos: number;
  mensaje?: string;
}

interface NamedProvider {
  nombre: string;
  provider: IOsintProvider;
}

export class OsintAggregateAdapter implements IOsintProvider {
  constructor(private providers: NamedProvider[]) {}

  async escanear(dominio: string, organizacionId: string): Promise<OsintHallazgo[]> {
    return (await this.escanearConEstado(dominio, organizacionId)).hallazgos;
  }

  async escanearConEstado(dominio: string, organizacionId: string): Promise<{ hallazgos: OsintHallazgo[]; proveedores: ProviderStatus[] }> {
    const results = await Promise.allSettled(
      this.providers.map(item => item.provider.escanear(dominio, organizacionId))
    );

    const hallazgos: OsintHallazgo[] = [];
    const proveedores: ProviderStatus[] = [];
    results.forEach((result, index) => {
      const nombre = this.providers[index].nombre;
      if (result.status === 'fulfilled') {
        hallazgos.push(...result.value);
        proveedores.push({ nombre, estado: 'OK', hallazgos: result.value.length });
      } else {
        const mensaje = result.reason instanceof Error ? result.reason.message : 'Error desconocido';
        console.error(`Proveedor ${nombre} falló:`, mensaje);
        proveedores.push({ nombre, estado: 'ERROR', hallazgos: 0, mensaje });
      }
    });

    if (proveedores.length > 0 && proveedores.every(provider => provider.estado === 'ERROR')) {
      throw new Error('Todos los proveedores OSINT fallaron. Intenta nuevamente más tarde.');
    }
    return { hallazgos, proveedores };
  }
}
