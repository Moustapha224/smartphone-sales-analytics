import { useState, useRef, useCallback } from "react";
import { SalesRecord } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface BulkImportFormProps {
    onImport: (records: SalesRecord[]) => void;
    onError: (message: string) => void;
}

function parseLine(line: string): SalesRecord | null {
    // Support tab, semicolon, and pipe separators
    let cols: string[];
    if (line.includes("\t")) {
        cols = line.split("\t");
    } else if (line.includes(";")) {
        cols = line.split(";");
    } else if (line.includes("|")) {
        cols = line.split("|");
    } else {
        cols = line.split("\t");
    }

    if (cols.length < 19) return null;

    const cleanNum = (s: string) => {
        if (!s) return 0;
        return parseFloat(s.replace(/[$€\s\u00A0]/g, "").replace(",", ".")) || 0;
    };

    return {
        codePOS: cols[0]?.trim() || "",
        index: parseInt(cols[1]) || 0,
        nameOfPOS: cols[2]?.trim() || "",
        categoryOfPOS: cols[3]?.trim() || "",
        typeOfPOS: cols[4]?.trim() || "",
        zone: cols[5]?.trim() || "",
        district: cols[6]?.trim() || "",
        distributionChannel: cols[7]?.trim() || "",
        brand: cols[8]?.trim() || "",
        segment: cols[9]?.trim() || "",
        product: cols[10]?.trim() || "",
        sellOut: cleanNum(cols[11]),
        purchasePrice: cleanNum(cols[12]),
        salePrice: cleanNum(cols[13]),
        status: cols[14]?.trim() || "",
        codeWeek: cols[15]?.trim() || "",
        annee: parseInt(cols[16]) || 2025,
        mois: cols[17]?.trim() || "",
        quarter: cols[18]?.trim() || "",
    };
}

const CHUNK_SIZE = 500;

export function BulkImportForm({ onImport, onError }: BulkImportFormProps) {
    const [bulkText, setBulkText] = useState("");
    const [parsing, setParsing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [stats, setStats] = useState<{ total: number; ok: number; errors: number } | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const processChunked = useCallback((lines: string[]) => {
        return new Promise<{ records: SalesRecord[]; errorCount: number }>((resolve) => {
            const records: SalesRecord[] = [];
            let errorCount = 0;
            let idx = 0;

            function processChunk() {
                const end = Math.min(idx + CHUNK_SIZE, lines.length);
                for (let i = idx; i < end; i++) {
                    const record = parseLine(lines[i]);
                    if (record) {
                        records.push(record);
                    } else {
                        errorCount++;
                    }
                }
                idx = end;
                setProgress(Math.round((idx / lines.length) * 100));

                if (idx < lines.length) {
                    setTimeout(processChunk, 0);
                } else {
                    resolve({ records, errorCount });
                }
            }

            processChunk();
        });
    }, []);

    const handleBulkImport = useCallback(async () => {
        if (!bulkText.trim()) {
            onError("⚠️ Veuillez coller des données avant d'importer.");
            return;
        }

        setParsing(true);
        setStats(null);
        setProgress(0);

        try {
            // Split lines – handle \r\n and \n
            const lines = bulkText.replace(/\r\n/g, "\n").trim().split("\n").filter((l) => l.trim().length > 0);

            // Skip header row if detected (non-numeric first cell that looks like a label)
            let startIdx = 0;
            const firstLine = lines[0]?.toLowerCase() || "";
            if (firstLine.includes("code") || firstLine.includes("pos") || firstLine.includes("index") || firstLine.includes("brand") || firstLine.includes("marque")) {
                startIdx = 1;
            }

            const dataLines = lines.slice(startIdx);

            if (dataLines.length === 0) {
                onError("⚠️ Aucune ligne de données trouvée.");
                setParsing(false);
                return;
            }

            const { records, errorCount } = await processChunked(dataLines);

            if (records.length === 0) {
                onError("⚠️ Aucune ligne valide trouvée. Vérifiez que les données ont au moins 19 colonnes séparées par tabulations, points-virgules ou pipes (|).");
                setParsing(false);
                return;
            }

            setStats({ total: dataLines.length, ok: records.length, errors: errorCount });
            onImport(records);
            setBulkText("");
        } catch {
            onError("⚠️ Erreur inattendue lors du traitement.");
        } finally {
            setParsing(false);
            setProgress(0);
        }
    }, [bulkText, onImport, onError, processChunked]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            setBulkText(text);
            setStats(null);
        };
        reader.readAsText(file, "UTF-8");
        e.target.value = "";
    };

    const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        // Let the browser handle the paste natively for large data
        // This ensures all data is captured without truncation
        e.stopPropagation();
        setStats(null);
    }, []);

    const lineCount = bulkText ? bulkText.replace(/\r\n/g, "\n").trim().split("\n").filter((l) => l.trim()).length : 0;

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                    Collez les données depuis Excel (19 colonnes, séparées par tabulations ou points-virgules) ou chargez un fichier CSV.
                </p>
                <label className="cursor-pointer inline-flex items-center gap-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/5">
                    <FileText size={14} />
                    Charger fichier .csv / .txt
                    <input type="file" accept=".csv,.txt,.tsv" className="hidden" onChange={handleFileUpload} />
                </label>
            </div>

            <div className="relative">
                <textarea
                    ref={textareaRef}
                    value={bulkText}
                    onChange={(e) => { setBulkText(e.target.value); setStats(null); }}
                    onPaste={handlePaste}
                    rows={10}
                    placeholder={"Collez vos données ici ou chargez un fichier...\n\nFormat attendu (19 colonnes) :\nCodePOS \\t Index \\t NomPOS \\t CatégoriePOS \\t TypePOS \\t Zone \\t District \\t Canal \\t Marque \\t Segment \\t Produit \\t SellOut \\t PrixAchat \\t PrixVente \\t Statut \\t Semaine \\t Année \\t Mois \\t Trimestre"}
                    className="w-full bg-background border border-border rounded-lg p-3 font-mono text-xs text-foreground resize-y min-h-[150px] focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                />
                {lineCount > 0 && (
                    <div className="absolute bottom-2 right-2 text-[10px] text-muted-foreground bg-card px-2 py-0.5 rounded border border-border">
                        {lineCount.toLocaleString("fr-FR")} ligne{lineCount > 1 ? "s" : ""}
                    </div>
                )}
            </div>

            {parsing && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 size={14} className="animate-spin" />
                        Traitement en cours... {progress}%
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                        <div
                            className="bg-primary h-1.5 rounded-full transition-all duration-200"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {stats && (
                <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-green-400">
                        <CheckCircle2 size={14} /> {stats.ok.toLocaleString("fr-FR")} importée(s)
                    </span>
                    {stats.errors > 0 && (
                        <span className="flex items-center gap-1 text-amber-400">
                            <AlertCircle size={14} /> {stats.errors.toLocaleString("fr-FR")} ignorée(s) (format invalide)
                        </span>
                    )}
                </div>
            )}

            <Button onClick={handleBulkImport} disabled={parsing || !bulkText.trim()} className="w-full sm:w-auto gap-2">
                <Upload size={16} />
                {parsing ? "Traitement en cours..." : `Importer ${lineCount > 0 ? `(${lineCount.toLocaleString("fr-FR")} lignes)` : "les données"}`}
            </Button>
        </div>
    );
}
