import React, { useRef, useState, useMemo } from "react";
import { Download, Table2, BarChart3, ArrowUpDown, ArrowUp, ArrowDown, FileSpreadsheet } from "lucide-react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  title: string;
  children: React.ReactNode;
  className?: string;
  tableData?: Record<string, string | number>[];
  tableColumns?: { key: string; label: string; isCurrency?: boolean }[];
}

type SortDir = "asc" | "desc" | null;

function exportCSV(data: Record<string, string | number>[], columns: { key: string; label: string }[], title: string) {
  const header = columns.map((c) => c.label).join(";");
  const rows = data.map((row) => columns.map((c) => {
    const val = row[c.key];
    return typeof val === "string" && val.includes(";") ? `"${val}"` : String(val ?? "");
  }).join(";"));
  const csv = [header, ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${title.toLowerCase().replace(/\s+/g, "-")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  toast.success("CSV exporté avec succès");
}

export function ChartContainer({ title, children, className = "", tableData, tableColumns }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showTable, setShowTable] = useState(false);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const handleDownload = async () => {
    if (!containerRef.current) return;
    try {
      const dataUrl = await toPng(containerRef.current, {
        backgroundColor: "hsl(222, 22%, 14%)",
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `${title.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Graphique téléchargé");
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Erreur lors du téléchargement");
    }
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : sortDir === "desc" ? null : "asc");
      if (sortDir === "desc") setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedData = useMemo(() => {
    if (!tableData || !sortKey || !sortDir) return tableData || [];
    return [...tableData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDir === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [tableData, sortKey, sortDir]);

  const hasTable = tableData && tableColumns && tableData.length > 0;

  return (
    <div ref={containerRef} className={`glass-card p-4 relative group transition-all duration-200 hover:border-border ${className}`}>
      <div className="flex items-center justify-between mb-3 gap-2">
        <p className="text-sm text-muted-foreground font-medium truncate">{title}</p>
        <div className="flex items-center gap-0.5 shrink-0">
          {hasTable && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-60 hover:opacity-100 transition-opacity"
              onClick={() => setShowTable(!showTable)}
              title={showTable ? "Voir le graphique" : "Voir en tableau"}
            >
              {showTable ? <BarChart3 size={14} className="text-primary" /> : <Table2 size={14} className="text-muted-foreground" />}
            </Button>
          )}
          {hasTable && showTable && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-60 hover:opacity-100 transition-opacity"
              onClick={() => exportCSV(sortedData, tableColumns!, title)}
              title="Exporter en CSV"
            >
              <FileSpreadsheet size={14} className="text-accent" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-60 hover:opacity-100 transition-opacity"
            onClick={handleDownload}
            title="Télécharger en PNG"
          >
            <Download size={14} className="text-muted-foreground" />
          </Button>
        </div>
      </div>

      {showTable && hasTable ? (
        <div className="overflow-x-auto rounded-lg border border-border/40">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-secondary/60">
                {tableColumns!.map((col) => (
                  <th
                    key={col.key}
                    className="px-3 py-2.5 text-left text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors select-none"
                    onClick={() => handleSort(col.key)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {sortKey === col.key && sortDir === "asc" && <ArrowUp size={12} className="text-primary" />}
                      {sortKey === col.key && sortDir === "desc" && <ArrowDown size={12} className="text-primary" />}
                      {sortKey !== col.key && <ArrowUpDown size={10} className="opacity-30" />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, i) => (
                <tr key={i} className="border-t border-border/30 hover:bg-secondary/30 transition-colors">
                  {tableColumns!.map((col) => (
                    <td key={col.key} className="px-3 py-2 text-foreground">
                      {col.isCurrency
                        ? `${Number(row[col.key]).toLocaleString("fr-FR")} $`
                        : typeof row[col.key] === "number"
                          ? Number(row[col.key]).toLocaleString("fr-FR")
                          : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
