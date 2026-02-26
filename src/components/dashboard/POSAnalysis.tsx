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

function topPOS(data: ComputedRecord[], metric: "sellOut" | "ca" | "margeTotale", top = 10) {
  const g = groupBy(data, (d) => `${d.nameOfPOS}||${d.codePOS}`);
  return Object.entries(g)
    .map(([key, items]) => {
      const [name, code] = key.split("||");
      let value = 0;
      if (metric === "sellOut") value = sumField(items, "sellOut");
      else if (metric === "ca") value = Math.round(sumField(items, "ca"));
      else value = Math.round(sumField(items, "margeTotale"));
      return { pos: name.length > 25 ? name.slice(0, 22) + "..." : name, fullName: name, code, value };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, top);
}

export default function POSAnalysis({ data }: Props) {
  const charts = [
    { data: topPOS(data, "sellOut"), label: "Top 10 POS par Volume (Sell Out)", color: "hsl(215,70%,55%)", isCurrency: false },
    { data: topPOS(data, "ca"), label: "Top 10 POS par Chiffre d'Affaires ($)", color: "hsl(150,55%,45%)", isCurrency: true },
    { data: topPOS(data, "margeTotale"), label: "Top 10 POS par Marge Totale ($)", color: "hsl(35,85%,55%)", isCurrency: true },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-accent/20 text-accent text-sm">🏪</span>
        Analyse par Point de Vente
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {charts.map(({ data: d, label, color, isCurrency }) => (
          <ChartContainer
            key={label}
            title={label}
            tableData={d.map((r) => ({ POS: r.fullName, Code: r.code, Valeur: r.value }))}
            tableColumns={[
              { key: "POS", label: "Point de Vente" },
              { key: "Code", label: "Code" },
              { key: "Valeur", label: isCurrency ? "Montant ($)" : "Volume", isCurrency },
            ]}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={d} layout="vertical" margin={{ left: 5 }}>
                <XAxis type="number" tick={{ fill: "hsl(215,15%,55%)", fontSize: 11 }} />
                <YAxis dataKey="pos" type="category" tick={{ fill: "hsl(210,20%,85%)", fontSize: 9 }} width={130} />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(v: number) => isCurrency ? `${v.toLocaleString("fr-FR")} $` : v.toLocaleString("fr-FR")}
                  labelFormatter={(label: string) => {
                    const item = d.find((r) => r.pos === label);
                    return item ? `${item.fullName} (${item.code})` : label;
                  }}
                />
                <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ))}
      </div>
    </div>
  );
}
