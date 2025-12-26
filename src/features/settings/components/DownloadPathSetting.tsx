import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FolderOpen } from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";
import { useState } from "react";

interface DownloadPathSettingProps {
  value: string;
  onChange: (value: string) => void;
}

export function DownloadPathSetting({ value, onChange }: DownloadPathSettingProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleBrowse = async () => {
    setIsLoading(true);
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select Download Directory",
        defaultPath: value || undefined,
      });

      if (selected && typeof selected === "string") {
        onChange(selected);
      } else if (selected && Array.isArray(selected) && selected.length > 0) {
        onChange(selected[0]);
      }
    } catch (error) {
      console.error("Failed to open directory dialog:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="download-path">Download Path</Label>
      <div className="flex gap-2">
        <Input
          id="download-path"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="~/Downloads"
        />
        <button
          type="button"
          className="px-3 border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          title="Browse for directory"
          onClick={handleBrowse}
          disabled={isLoading}
        >
          <FolderOpen className="h-4 w-4" />
        </button>
      </div>
      <p className="text-sm text-muted-foreground">
        Directory where downloaded files will be saved. Leave empty to use system Downloads folder.
      </p>
    </div>
  );
}

