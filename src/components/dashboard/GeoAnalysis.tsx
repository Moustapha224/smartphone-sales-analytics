import { ComputedRecord } from "@/lib/types";
import { groupBy, sumField } from "@/lib/data-store";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer } from "./ChartContainer";

interface Props {
  data: ComputedRecord[];
}

const tooltipStyle = {
  contentStyle: { backgroundColor: "hsl(220,15%,17%)", border: "1px solid hsl(220,12%,25%)", borderRadius: "8px", color: "hsl(210,20%,92%)" },
};

function agg(data: ComputedRecord[], key: keyof ComputedRecord, metric: "sellOut" | "ca") {
  const g = groupBy(data, (d) => d[key] as string);
  return Object.entries(g)
    .map(([name, items]) => ({ name, value: metric === "ca" ? Math.round(sumField(items, "ca")) : sumField(items, "sellOut") }))
    .sort((a, b) => b.value - a.value);
}

export default function GeoAnalysis({ data }: Props) {
  const byZone = agg(data, "zone", "sellOut");
  const byDistrict = agg(data, "district", "ca").slice(0, 10);
  const byChannel = agg(data, "distributionChannel", "sellOut").filter((d) => d.name);

  const charts = [
    {
      data: byZone,
      title: "Volume par Zone",
      color: "hsl(215,70%,55%)",
      isCurrency: false,
      layout: "vertical" as const,
      colLabel: "Volume",
    },
    {
      data: byDistrict,
      title: "CA par District (Top 10, $)",
      color: "hsl(150,55%,45%)",
      isCurrency: true,
      layout: "horizontal" as const,
      colLabel: "CA ($)",
    },
    {
      data: byChannel,
      title: "Volume par Canal de Distribution",
      color: "hsl(35,85%,55%)",
      isCurrency: false,
      layout: "vertical" as const,
      colLabel: "Volume",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-primary/20 text-primary text-sm">🌍</span>
        Analyse Géographique
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {charts.map(({ data: d, title, color, isCurrency, layout, colLabel }) => (
          <ChartContainer
            key={title}
            title={title}
            tableData={d.map((r) => ({ Nom: r.name, Valeur: r.value }))}
            tableColumns={[
              { key: "Nom", label: "Nom" },
              { key: "Valeur", label: colLabel, isCurrency },
            ]}
          >
            <ResponsiveContainer width="100%" height={250}>
              {layout === "horizontal" ? (
                <BarChart data={d} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" tick={{ fill: "hsl(215,15%,55%)", fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: "hsl(210,20%,85%)", fontSize: 10 }} width={100} />
                  <Tooltip {...tooltipStyle} formatter={(v: number) => isCurrency ? `${v.toLocaleString("fr-FR")} $` : v.toLocaleString("fr-FR")} />
                  <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} />
                </BarChart>
              ) : (
                <BarChart data={d}>
                  <XAxis dataKey="name" tick={{ fill: "hsl(210,20%,85%)", fontSize: 10 }} />
                  <YAxis tick={{ fill: "hsl(215,15%,55%)", fontSize: 11 }} />
                  <Tooltip {...tooltipStyle} formatter={(v: number) => isCurrency ? `${v.toLocaleString("fr-FR")} $` : v.toLocaleString("fr-FR")} />
                  <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </ChartContainer>
        ))}
      </div>
    </div>
  );
}
