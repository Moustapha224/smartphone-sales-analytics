import { useState, useMemo } from "react";
import { ComputedRecord } from "@/lib/types";
import { groupBy, sumField } from "@/lib/data-store";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { ChartContainer } from "./ChartContainer";

interface Props {
  data: ComputedRecord[];
}

const tooltipStyle = {
  contentStyle: { backgroundColor: "hsl(220,15%,17%)", border: "1px solid hsl(220,12%,25%)", borderRadius: "8px", color: "hsl(210,20%,92%)" },
};

const MOIS_ORDER = ["JANVIER", "FÉVRIER", "MARS", "AVRIL", "MAI", "JUIN", "JUILLET", "AOÛT", "SEPTEMBRE", "OCTOBRE", "NOVEMBRE", "DÉCEMBRE"];

function topProducts(data: ComputedRecord[], metric: "sellOut" | "ca" | "margeTotale" | "margeMoyenne", top = 10) {
  const g = groupBy(data, (d) => d.product);
  return Object.entries(g)
    .map(([product, items]) => {
      let value = 0;
      if (metric === "sellOut") value = sumField(items, "sellOut");
      else if (metric === "ca") value = Math.round(sumField(items, "ca"));
      else if (metric === "margeTotale") value = Math.round(sumField(items, "margeTotale"));
      else if (metric === "margeMoyenne") {
        const vol = sumField(items, "sellOut");
        value = vol > 0 ? Math.round(sumField(items, "margeTotale") / vol) : 0;
      }
      return { product, value };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, top);
}

export default function ProductAnalysis({ data }: Props) {
  const products = useMemo(() => [...new Set(data.map((d) => d.product))].sort(), [data]);
  const [selected, setSelected] = useState(products[0] || "");

  const topVol = topProducts(data, "sellOut");
  const topCA = topProducts(data, "ca");
  const topMarge = topProducts(data, "margeMoyenne");

  const monthlyData = useMemo(() => {
    if (!selected) return [];
    const filtered = data.filter((d) => d.product === selected);
    const g = groupBy(filtered, (d) => d.mois);
    return Object.entries(g)
      .map(([mois, items]) => ({ mois: mois.slice(0, 4), volume: sumField(items, "sellOut") }))
      .sort((a, b) => MOIS_ORDER.indexOf(Object.keys(g).find((m) => m.startsWith(a.mois)) || "") - MOIS_ORDER.indexOf(Object.keys(g).find((m) => m.startsWith(b.mois)) || ""));
  }, [data, selected]);

  const charts = [
    { data: topVol, label: "Top 10 - Volume", color: "hsl(215,70%,55%)", isCurrency: false, colLabel: "Volume" },
    { data: topCA, label: "Top 10 - CA ($)", color: "hsl(150,55%,45%)", isCurrency: true, colLabel: "CA ($)" },
    { data: topMarge, label: "Top 10 - Marge Moyenne ($)", color: "hsl(35,85%,55%)", isCurrency: true, colLabel: "Marge ($)" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-warning/20 text-warning text-sm">📱</span>
        Analyse Produit
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {charts.map(({ data: d, label, color, isCurrency, colLabel }) => (
          <ChartContainer
            key={label}
            title={label}
            tableData={d.map((r) => ({ Produit: r.product, Valeur: r.value }))}
            tableColumns={[
              { key: "Produit", label: "Produit" },
              { key: "Valeur", label: colLabel, isCurrency },
            ]}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={d} layout="vertical" margin={{ left: 5 }}>
                <XAxis type="number" tick={{ fill: "hsl(215,15%,55%)", fontSize: 11 }} />
                <YAxis dataKey="product" type="category" tick={{ fill: "hsl(210,20%,85%)", fontSize: 9 }} width={120} />
                <Tooltip {...tooltipStyle} formatter={(v: number) => isCurrency ? `${v.toLocaleString("fr-FR")} $` : v.toLocaleString("fr-FR")} />
                <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ))}
      </div>

      <ChartContainer
        title="Détail Mensuel par Produit"
        tableData={monthlyData.map((r) => ({ Mois: r.mois, Volume: r.volume }))}
        tableColumns={[
          { key: "Mois", label: "Mois" },
          { key: "Volume", label: "Volume" },
        ]}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4 mb-6">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="bg-background border border-border rounded-md px-3 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-primary outline-none min-w-[200px]"
          >
            {products.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,12%,25%)" />
            <XAxis dataKey="mois" tick={{ fill: "hsl(210,20%,85%)", fontSize: 11 }} />
            <YAxis tick={{ fill: "hsl(215,15%,55%)", fontSize: 11 }} />
            <Tooltip {...tooltipStyle} />
            <Line type="monotone" dataKey="volume" stroke="hsl(215,70%,55%)" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
