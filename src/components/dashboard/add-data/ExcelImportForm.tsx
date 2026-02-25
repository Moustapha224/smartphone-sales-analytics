import { useState, useRef } from "react";
import { SalesRecord } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Upload, AlertTriangle } from "lucide-react";
import * as XLSX from "xlsx";
import { mapHeaders, rowToSalesRecord } from "./import-utils";

interface ExcelImportFormProps {
  onImport: (records: SalesRecord[]) => void;
  onError: (message: string) => void;
}

interface ExcelPreview {
  fileName: string;
  totalRows: number;
  mappedColumns: { excelHeader: string; mappedTo: keyof SalesRecord }[];
  unmappedColumns: string[];
  headerMapping: Record<number, keyof SalesRecord>;
  rows: unknown[][];
}

export function ExcelImportForm({ onImport, onError }: ExcelImportFormProps) {
  const [excelPreview, setExcelPreview] = useState<ExcelPreview | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processExcelFile = (file: File) => {
    if (!file.name.match(/\.xlsx?$/i)) {
      onError("⚠️ Veuillez sélectionner un fichier Excel (.xlsx ou .xls)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1 });

        if (jsonData.length < 2) {
          onError("⚠️ Le fichier ne contient pas assez de données (au moins 1 en-tête + 1 ligne).");
          return;
        }

        const headers = (jsonData[0] as unknown[]).map(String);
        const rows = jsonData.slice(1).filter((row) =>
          (row as unknown[]).some((cell) => cell != null && cell !== ""),
        ) as unknown[][];

        const headerMapping = mapHeaders(headers);
        const mappedColumns: { excelHeader: string; mappedTo: keyof SalesRecord }[] = [];
        const unmappedColumns: string[] = [];

        headers.forEach((h, i) => {
          if (headerMapping[i]) {
            mappedColumns.push({ excelHeader: h, mappedTo: headerMapping[i] });
          } else {
            unmappedColumns.push(h);
          }
        });

        if (mappedColumns.length === 0) {
          onError("⚠️ Aucune colonne reconnue. Vérifiez les en-têtes de votre fichier Excel.");
          return;
        }

        setExcelPreview({
          fileName: file.name,
          totalRows: rows.length,
          mappedColumns,
          unmappedColumns,
          headerMapping,
          rows,
        });
      } catch (err) {
        console.error("Excel parse error:", err);
        onError("⚠️ Erreur lors de la lecture du fichier Excel. Vérifiez le format.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processExcelFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processExcelFile(file);
  };

  const handleConfirmImport = async () => {
    if (!excelPreview || isImporting) return;
    setIsImporting(true);
    // Using a timeout to let the UI update and show the loading state
    setTimeout(() => {
      try {
        const records = excelPreview.rows.map((row) =>
          rowToSalesRecord(row, excelPreview.headerMapping),
        );
        onImport(records);
        setExcelPreview(null);
      } catch (err) {
        console.error("Excel import error:", err);
        onError("⚠️ Erreur lors de l'import : impossible de sauvegarder les données.");
      } finally {
        setIsImporting(false);
      }
    }, 50);
  };

  return (
    <div className="space-y-4">
      {!excelPreview ? (
        <>
          <p className="text-sm text-muted-foreground">
            Importez un fichier Excel (.xlsx) pour remplacer toutes les données actuelles.
          </p>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
                            w-full border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
                            ${isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-primary/5"}
                        `}
          >
            <FileSpreadsheet size={40} className={`mx-auto mb-3 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
            <p className="text-sm font-medium">Glissez-déposez votre fichier Excel ici</p>
            <p className="text-xs text-muted-foreground mt-1">ou cliquez pour sélectionner un fichier (.xlsx, .xls)</p>
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileSelect} className="hidden" />
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3 border border-border">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <FileSpreadsheet size={16} className="text-primary" />
              Prévisualisation — {excelPreview.fileName}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background rounded-lg p-3 border border-border">
                <span className="text-muted-foreground text-xs block">Lignes</span>
                <span className="text-lg font-bold">{excelPreview.totalRows.toLocaleString()}</span>
              </div>
              <div className="bg-background rounded-lg p-3 border border-border">
                <span className="text-muted-foreground text-xs block">Colonnes mappées</span>
                <span className="text-lg font-bold text-primary">{excelPreview.mappedColumns.length}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleConfirmImport} disabled={isImporting} className="flex-1">
              {isImporting ? (
                <><Upload size={14} className="mr-2 animate-bounce" /> Importation...</>
              ) : (
                <><Upload size={14} className="mr-2" /> Confirmer l'import</>
              )}
            </Button>
            <Button variant="secondary" disabled={isImporting} onClick={() => setExcelPreview(null)}>Annuler</Button>
          </div>
        </div>
      )}
    </div>
  );
}
