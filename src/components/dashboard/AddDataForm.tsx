import { useState } from "react";
import { addRecords, clearAllData, replaceAllData } from "@/lib/data-store";
import { Plus, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ManualEntryForm } from "./add-data/ManualEntryForm";
import { BulkImportForm } from "./add-data/BulkImportForm";
import { ExcelImportForm } from "./add-data/ExcelImportForm";

interface Props {
  onDataAdded: () => void;
}

export default function AddDataForm({ onDataAdded }: Props) {
  const [message, setMessage] = useState("");

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 5000);
  };

  const handleClearData = () => {
    const confirmed = window.confirm(
      "⚠️ Êtes-vous sûr de vouloir effacer TOUTES les données ?\n\nCette action est irréversible. Les données d'exemple seront restaurées au prochain chargement.",
    );
    if (!confirmed) return;

    clearAllData();
    showMessage("🗑️ Toutes les données ont été effacées. Les données d'exemple ont été restaurées.");
    onDataAdded();
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Plus size={24} className="text-primary" /> Gestion des Données
        </h2>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleClearData}
          className="gap-2"
        >
          <Trash2 size={16} /> Effacer les données
        </Button>
      </div>

      {message && (
        <div className="text-sm px-4 py-3 rounded-lg bg-primary/10 text-primary border border-primary/20 animate-in fade-in slide-in-from-top-1 duration-300">
          {message}
        </div>
      )}

      <Tabs defaultValue="form" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="form">Saisie Manuelle</TabsTrigger>
          <TabsTrigger value="bulk">Import CSV/Texte</TabsTrigger>
          <TabsTrigger value="excel">Import Excel</TabsTrigger>
        </TabsList>
        <TabsContent value="form">
          <ManualEntryForm
            onAdd={(record) => {
              addRecords([record]);
              showMessage("✅ Ligne ajoutée avec succès !");
              onDataAdded();
            }}
          />
        </TabsContent>
        <TabsContent value="bulk">
          <BulkImportForm
            onImport={(records) => {
              addRecords(records);
              showMessage(`✅ ${records.length} ligne(s) importée(s) avec succès !`);
              onDataAdded();
            }}
            onError={showMessage}
          />
        </TabsContent>
        <TabsContent value="excel">
          <ExcelImportForm
            onImport={async (records) => {
              await replaceAllData(records);
              showMessage(`✅ ${records.length} ligne(s) importée(s) ! Les données précédentes ont été remplacées.`);
              onDataAdded();
            }}
            onError={showMessage}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
