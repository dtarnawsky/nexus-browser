export interface Service {
  path?: string
  hostname?: string
  id?: string
  address: string
  port?: number
  name: string
}

export const IonicDiscover = (window as any).IonicDiscover;
