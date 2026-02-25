import { useState } from "react";
import { SalesRecord } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface BulkImportFormProps {
    onImport: (records: SalesRecord[]) => void;
    onError: (message: string) => void;
}

export function BulkImportForm({ onImport, onError }: BulkImportFormProps) {
    const [bulkText, setBulkText] = useState("");

    const handleBulkImport = () => {
        try {
            const lines = bulkText.trim().split("\n").filter(Boolean);
            const records: SalesRecord[] = lines.map((line) => {
                const cols = line.split("\t");
                if (cols.length < 19) throw new Error("Nombre de colonnes insuffisant");
                return {
                    codePOS: cols[0],
                    index: parseInt(cols[1]) || 0,
                    nameOfPOS: cols[2],
                    categoryOfPOS: cols[3],
                    typeOfPOS: cols[4],
                    zone: cols[5],
                    district: cols[6],
                    distributionChannel: cols[7],
                    brand: cols[8],
                    segment: cols[9],
                    product: cols[10],
                    sellOut: parseFloat(cols[11]?.replace(",", ".")) || 0,
                    purchasePrice: parseFloat(cols[12]?.replace(/[$€\s]/g, "").replace(",", ".")) || 0,
                    salePrice: parseFloat(cols[13]?.replace(/[$€\s]/g, "").replace(",", ".")) || 0,
                    status: cols[14],
                    codeWeek: cols[15],
                    annee: parseInt(cols[16]) || 2025,
                    mois: cols[17],
                    quarter: cols[18],
                };
            });
            onImport(records);
            setBulkText("");
        } catch {
            onError("⚠️ Erreur de format. Collez les données séparées par tabulations (19 colonnes).");
        }
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Collez les données depuis Excel (séparées par tabulations, 19 colonnes). Une ligne par enregistrement.
            </p>
            <Textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                rows={8}
                placeholder="Collez vos données ici..."
                className="font-mono text-sm"
            />
            <Button onClick={handleBulkImport} className="w-full sm:w-auto">
                Importer les données
            </Button>
        </div>
    );
}
