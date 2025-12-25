import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import type { CliToolTemplate, InstallMethod, ConfigFileLocation } from "../types/cli-tool";
import { saveCustomTemplate } from "../api/cli-commands";

interface CustomToolFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CustomToolForm({ onSuccess, onCancel }: CustomToolFormProps) {
  const [formData, setFormData] = useState<Partial<CliToolTemplate>>({
    id: "",
    name: "",
    executable: "",
    versionCommand: "",
    versionParser: "stdout",
    configFiles: [],
    installMethods: [],
    dependencies: [],
  });

  const [installMethodType, setInstallMethodType] = useState<"brew" | "dmg" | "">("");
  const [installMethodValue, setInstallMethodValue] = useState("");
  const [configPath, setConfigPath] = useState("");
  const [configPathType, setConfigPathType] = useState<"home" | "absolute">("home");
  const [dependencyInput, setDependencyInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.id || !formData.name || !formData.executable || !formData.versionCommand) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const template: CliToolTemplate = {
        id: formData.id!,
        name: formData.name!,
        executable: formData.executable!,
        versionCommand: formData.versionCommand!,
        versionParser: formData.versionParser || "stdout",
        configFiles: formData.configFiles || [],
        installMethods: formData.installMethods || [],
        dependencies: formData.dependencies,
      };

      await saveCustomTemplate(template);
      toast.success("Custom tool template saved successfully");
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save template");
    }
  };

  const addInstallMethod = () => {
    if (!installMethodType || !installMethodValue) return;

    const method: InstallMethod = {
      type: installMethodType,
      [installMethodType === "brew" ? "caskName" : "dmgUrl"]: installMethodValue,
    };

    setFormData((prev) => ({
      ...prev,
      installMethods: [...(prev.installMethods || []), method],
    }));
    setInstallMethodType("");
    setInstallMethodValue("");
  };

  const removeInstallMethod = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      installMethods: prev.installMethods?.filter((_, i) => i !== index),
    }));
  };

  const addConfigFile = () => {
    if (!configPath) return;

    const config: ConfigFileLocation = {
      path: configPath,
      type: configPathType,
    };

    setFormData((prev) => ({
      ...prev,
      configFiles: [...(prev.configFiles || []), config],
    }));
    setConfigPath("");
  };

  const removeConfigFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      configFiles: prev.configFiles?.filter((_, i) => i !== index),
    }));
  };

  const addDependency = () => {
    if (!dependencyInput.trim()) return;

    setFormData((prev) => ({
      ...prev,
      dependencies: [...(prev.dependencies || []), dependencyInput.trim()],
    }));
    setDependencyInput("");
  };

  const removeDependency = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      dependencies: prev.dependencies?.filter((_, i) => i !== index),
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Custom CLI Tool</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="id">ID *</Label>
              <Input
                id="id"
                placeholder="e.g., rust"
                value={formData.id}
                onChange={(e) => setFormData((prev) => ({ ...prev, id: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Rust"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="executable">Executable *</Label>
            <Input
              id="executable"
              placeholder="e.g., rustc"
              value={formData.executable}
              onChange={(e) => setFormData((prev) => ({ ...prev, executable: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="versionCommand">Version Command *</Label>
            <Input
              id="versionCommand"
              placeholder="e.g., --version"
              value={formData.versionCommand}
              onChange={(e) => setFormData((prev) => ({ ...prev, versionCommand: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="versionParser">Version Parser</Label>
            <Select
              value={formData.versionParser}
              onValueChange={(value: "stdout" | "stderr" | "stdout-first-line") =>
                setFormData((prev) => ({ ...prev, versionParser: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stdout">stdout</SelectItem>
                <SelectItem value="stderr">stderr</SelectItem>
                <SelectItem value="stdout-first-line">stdout-first-line</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Install Methods</Label>
            <div className="flex gap-2">
              <Select value={installMethodType} onValueChange={(v: any) => setInstallMethodType(v)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brew">Homebrew</SelectItem>
                  <SelectItem value="dmg">DMG</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder={installMethodType === "brew" ? "cask name" : "dmg url"}
                value={installMethodValue}
                onChange={(e) => setInstallMethodValue(e.target.value)}
                className="flex-1"
              />
              <Button type="button" onClick={addInstallMethod} variant="outline">
                Add
              </Button>
            </div>
            {formData.installMethods?.map((method, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm">
                  {method.type === "brew" ? `brew: ${method.caskName}` : `dmg: ${method.dmgUrl}`}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeInstallMethod(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Dependencies</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Tool ID"
                value={dependencyInput}
                onChange={(e) => setDependencyInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addDependency())}
              />
              <Button type="button" onClick={addDependency} variant="outline">
                Add
              </Button>
            </div>
            {formData.dependencies?.map((dep, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm">{dep}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDependency(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Config Files</Label>
            <div className="flex gap-2">
              <Select value={configPathType} onValueChange={(v: any) => setConfigPathType(v)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home (~)</SelectItem>
                  <SelectItem value="absolute">Absolute</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder=".config/tool/config.yml"
                value={configPath}
                onChange={(e) => setConfigPath(e.target.value)}
                className="flex-1"
              />
              <Button type="button" onClick={addConfigFile} variant="outline">
                Add
              </Button>
            </div>
            {formData.configFiles?.map((config, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm font-mono">
                  {config.type === "home" ? "~/" : "/"}{config.path}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeConfigFile(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit">Save Template</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
