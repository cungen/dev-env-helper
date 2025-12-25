import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";
import { useCustomTools } from "../hooks/useCustomTools";
import { CustomToolForm } from "./CustomToolForm";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function CustomToolList() {
  const { templates, isLoading, removeTemplate } = useCustomTools();
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await removeTemplate(deleteId);
      toast.success("Custom tool deleted successfully");
      setDeleteId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete tool");
    }
  };

  if (showForm) {
    return (
      <CustomToolForm
        onSuccess={() => setShowForm(false)}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Custom Tools</h2>
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Custom Tool
        </Button>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No custom tools yet. Click "Add Custom Tool" to create one.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{template.name}</h3>
                      <Badge variant="outline">{template.id}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Executable: <code className="font-mono">{template.executable}</code>
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {template.installMethods?.map((method, index) => (
                        <Badge key={index} variant="secondary">
                          {method.type === "brew" ? `brew: ${method.caskName}` : "dmg"}
                        </Badge>
                      ))}
                    </div>
                    {template.dependencies && template.dependencies.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {template.dependencies.map((dep) => (
                          <Badge key={dep} variant="outline" className="text-xs">
                            Requires: {dep}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(template.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Custom Tool</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the custom tool "{deleteId}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
