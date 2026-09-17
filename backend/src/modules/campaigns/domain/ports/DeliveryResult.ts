export interface DeliveryResult {
  accepted: boolean;
  providerId?: string;
  providerStatus?: string;
  errorCode?: string;
  errorMessage?: string;
}

export const safeDeliveryError = (error: any): Pick<DeliveryResult, 'errorCode' | 'errorMessage'> => ({
  errorCode: String(error?.code || error?.status || 'UNKNOWN').slice(0, 40),
  errorMessage: String(error?.message || 'Error del proveedor')
    .replace(/\+[1-9]\d{7,14}/g, '[número oculto]')
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, '[correo oculto]')
    .replace(/https?:\/\/\S+/gi, '[URL oculta]')
    .slice(0, 400),
});
