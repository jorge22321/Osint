// backend/src/modules/campaigns/domain/ports/ISmsProvider.ts
export interface ISmsProvider {
  enviarSms(numeroDestino: string, mensaje: string): Promise<boolean>;
}