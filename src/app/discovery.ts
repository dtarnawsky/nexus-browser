export interface Service {
  path?: string;
  hostname?: string;
  id?: string;
  address: string;
  port?: number;
  name: string;
  secure: boolean;
  icon?: string; // Url to an icon
}
