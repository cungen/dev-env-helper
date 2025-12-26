import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FolderOpen } from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";
import { useState } from "react";

interface DefaultEditorSettingProps {
  value: string;
  onChange: (value: string) => void;
}

const EDITOR_PRESETS = [
  { name: "VS Code", path: "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code" },
  { name: "Sublime", path: "/Applications/Sublime Text.app/Contents/SharedSupport/bin/subl" },
  { name: "Vim", path: "/usr/bin/vim" },
  { name: "Nano", path: "/usr/bin/nano" },
];

export function DefaultEditorSetting({ value, onChange }: DefaultEditorSettingProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePreset = (presetPath: string) => {
    onChange(presetPath);
  };

  const handleBrowse = async () => {
    setIsLoading(true);
    try {
      const selected = await open({
        directory: false,
        multiple: false,
        title: "Select Editor Executable",
        defaultPath: value || undefined,
        filters: [
          {
            name: "Executable",
            extensions: ["app", "exe", ""], // macOS .app, Windows .exe, or no extension for Unix
          },
        ],
      });

      if (selected && typeof selected === "string") {
        onChange(selected);
      } else if (selected && Array.isArray(selected) && selected.length > 0) {
        onChange(selected[0]);
      }
    } catch (error) {
      console.error("Failed to open file dialog:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="default-editor">Default Editor</Label>
      <div className="flex gap-2">
        <Input
          id="default-editor"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="System default"
        />
        <button
          type="button"
          className="px-3 border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          title="Browse for editor"
          onClick={handleBrowse}
          disabled={isLoading}
        >
          <FolderOpen className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {EDITOR_PRESETS.map((preset) => (
          <Button
            key={preset.name}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePreset(preset.path)}
          >
            {preset.name}
          </Button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Editor to use when opening files. Leave empty to use system default application.
      </p>
    </div>
  );
}

