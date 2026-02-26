import { ComputedRecord } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";

interface DataExportProps {
    data: ComputedRecord[];
}

export default function DataExport({ data }: DataExportProps) {
    const handleExportExcel = () => {
        // Transformer les données pour avoir des colonnes propres dans Excel
        const exportData = data.map((d) => ({
            "Code POS": d.codePOS,
            Index: d.index,
            "Nom POS": d.nameOfPOS,
            "Catégorie POS": d.categoryOfPOS,
            "Type POS": d.typeOfPOS,
            Zone: d.zone,
            District: d.district,
            "Canal Distribution": d.distributionChannel,
            Marque: d.brand,
            Segment: d.segment,
            Produit: d.product,
            "Sell Out": d.sellOut,
            "Prix Achat": d.purchasePrice,
            "Prix Vente": d.salePrice,
            "Chiffre d'Affaires": d.ca,
            "Marge Unitaire": d.margeUnitaire,
            "Marge Totale": d.margeTotale,
            "Taux de Marge (%)": d.tauxMarge.toFixed(2),
            Statut: d.status,
            "Code Semaine": d.codeWeek,
            Mois: d.mois,
            Année: d.annee,
            Trimestre: d.quarter,
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);

        // Auto-size columns slightly
        const colWidths = [
            { wch: 12 }, { wch: 8 }, { wch: 25 }, { wch: 15 }, { wch: 10 },
            { wch: 10 }, { wch: 15 }, { wch: 20 }, { wch: 12 }, { wch: 12 },
            { wch: 20 }, { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 15 },
            { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 15 },
            { wch: 12 }, { wch: 8 }, { wch: 10 },
        ];
        worksheet["!cols"] = colWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Données Filtrées");

        // Generate file and trigger download
        XLSX.writeFile(workbook, "Export_Donnees_Sales.xlsx");
    };

    return (
        <Button
            onClick={handleExportExcel}
            className="bg-accent text-accent-foreground hover:brightness-110 font-medium px-3 py-2 text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
        >
            <Download size={16} />
            <span>Export Excel</span>
        </Button>
    );
}
