//backend/src/modules/osint/infrastructure/providers/OsintAggregateAdapter.ts
import { IOsintProvider, OsintHallazgo } from '../../domain/ports/IOsintProvider';

export class OsintAggregateAdapter implements IOsintProvider {
  constructor(private providers: IOsintProvider[]) {}

  async escanear(dominio: string, organizacionId: string): Promise<OsintHallazgo[]> {
    const results = await Promise.allSettled(
      this.providers.map(provider => provider.escanear(dominio, organizacionId))
    );

    const hallazgos: OsintHallazgo[] = [];
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        hallazgos.push(...result.value);
      } else {
        console.error('Un proveedor falló:', result.reason);
      }
    });

    return hallazgos;
  }
}