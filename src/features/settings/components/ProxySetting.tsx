import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProxyType, type ProxySettings } from "../types/settings";

interface ProxySettingProps {
  value: ProxySettings | null | undefined;
  onChange: (value: ProxySettings | null) => void;
}

export function ProxySetting({ value, onChange }: ProxySettingProps) {
  const proxy = value || {
    enabled: false,
    type: ProxyType.Http,
    url: "",
  };

  const handleEnabledChange = (enabled: boolean) => {
    if (enabled) {
      onChange({
        enabled: true,
        type: proxy.type,
        url: proxy.url || "http://proxy.example.com:8080",
      });
    } else {
      onChange(null);
    }
  };

  const handleTypeChange = (type: ProxyType) => {
    onChange({
      ...proxy,
      type,
      url: proxy.url || `http://proxy.example.com:8080`,
    });
  };

  const handleUrlChange = (url: string) => {
    onChange({
      ...proxy,
      url,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label>Proxy Settings</Label>
          <p className="text-sm text-muted-foreground">
            Configure proxy for network operations (brew installs and downloads)
          </p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={proxy.enabled}
            onChange={(e) => handleEnabledChange(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">Enable Proxy</span>
        </label>
      </div>

      {proxy.enabled && (
        <div className="space-y-4 pl-4 border-l-2">
          <div className="space-y-2">
            <Label htmlFor="proxy-type">Proxy Type</Label>
            <Select
              value={proxy.type}
              onValueChange={(value) => handleTypeChange(value as ProxyType)}
            >
              <SelectTrigger id="proxy-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ProxyType.Http}>HTTP</SelectItem>
                <SelectItem value={ProxyType.Https}>HTTPS</SelectItem>
                <SelectItem value={ProxyType.Socks4}>SOCKS4</SelectItem>
                <SelectItem value={ProxyType.Socks5}>SOCKS5</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proxy-url">Proxy URL</Label>
            <Input
              id="proxy-url"
              value={proxy.url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder={
                proxy.type === ProxyType.Http
                  ? "http://proxy.example.com:8080"
                  : proxy.type === ProxyType.Https
                  ? "https://proxy.example.com:8080"
                  : proxy.type === ProxyType.Socks4
                  ? "socks4://proxy.example.com:1080"
                  : "socks5://proxy.example.com:1080"
              }
            />
            <p className="text-sm text-muted-foreground">
              Format: {proxy.type}://host:port
            </p>
          </div>
        </div>
      )}
    </div>
  );
}


