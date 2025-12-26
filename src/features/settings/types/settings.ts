export interface AppSettings {
  downloadPath?: string | null;
  defaultEditor?: string | null;
  proxy?: ProxySettings | null;
}

export interface ProxySettings {
  enabled: boolean;
  type: ProxyType;
  url: string;
}

export enum ProxyType {
  Http = "http",
  Https = "https",
  Socks4 = "socks4",
  Socks5 = "socks5",
}


