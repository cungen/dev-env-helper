import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSettings } from "../hooks/useSettings";
import { DownloadPathSetting } from "./DownloadPathSetting";
import { DefaultEditorSetting } from "./DefaultEditorSetting";
import { ProxySetting } from "./ProxySetting";
import { EnvironmentBackupSection } from "./EnvironmentBackupSection";
import { Loader2, Save, RotateCcw } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export function SettingsPage() {
  const { settings, isLoading, isSaving, save, reset } = useSettings();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);

  // Update local settings when settings load
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleSave = async () => {
    if (!localSettings) return;
    try {
      await save(localSettings);
    } catch (error) {
      // Error is handled by useSettings hook
    }
  };

  const handleReset = async () => {
    try {
      await reset();
      setLocalSettings(null);
      setShowResetDialog(false);
    } catch (error) {
      // Error is handled by useSettings hook
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!localSettings) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure application preferences</p>
      </div>

      <div className="space-y-6">
        {/* Application Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Application Settings</CardTitle>
            <CardDescription>Configure download paths, editor, and network settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <DownloadPathSetting
              value={localSettings.downloadPath || ""}
              onChange={(value) => setLocalSettings({ ...localSettings, downloadPath: value || null })}
            />
            <Separator />
            <DefaultEditorSetting
              value={localSettings.defaultEditor || ""}
              onChange={(value) => setLocalSettings({ ...localSettings, defaultEditor: value || null })}
            />
            <Separator />
            <ProxySetting
              value={localSettings.proxy}
              onChange={(value) => setLocalSettings({ ...localSettings, proxy: value })}
            />
          </CardContent>
        </Card>

        {/* Environment Backup & Restore */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Backup & Restore</CardTitle>
            <CardDescription>Export and import your development environment configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <EnvironmentBackupSection />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setShowResetDialog(true)}
            disabled={isSaving}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Settings to Defaults?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all settings to their default values. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

