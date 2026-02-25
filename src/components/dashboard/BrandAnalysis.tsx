import { ComputedRecord } from "@/lib/types";
import { groupBy, sumField } from "@/lib/data-store";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { ChartContainer } from "./ChartContainer";

interface Props {
  data: ComputedRecord[];
}

const COLORS = ["hsl(215,70%,55%)", "hsl(150,55%,45%)", "hsl(35,85%,55%)", "hsl(280,55%,55%)", "hsl(0,65%,55%)", "hsl(190,60%,50%)"];

const tooltipStyle = {
  contentStyle: { backgroundColor: "hsl(220,15%,17%)", border: "1px solid hsl(220,12%,25%)", borderRadius: "8px", color: "hsl(210,20%,92%)" },
  labelStyle: { color: "hsl(210,20%,92%)" },
};

function brandAgg(data: ComputedRecord[]) {
  const g = groupBy(data, (d) => d.brand);
  return Object.entries(g)
    .map(([brand, items]) => {
      const volume = sumField(items, "sellOut");
      return {
        brand,
        volume,
        ca: Math.round(sumField(items, "ca")),
        marge: volume > 0 ? Math.round(sumField(items, "margeTotale") / volume) : 0,
      };
    })
    .sort((a, b) => b.volume - a.volume);
}

const MOIS_ORDER = ["JANVIER", "FÉVRIER", "MARS", "AVRIL", "MAI", "JUIN", "JUILLET", "AOÛT", "SEPTEMBRE", "OCTOBRE", "NOVEMBRE", "DÉCEMBRE"];

function trendByTime(data: ComputedRecord[]) {
  const brands = [...new Set(data.map((d) => d.brand))];
  const uniqueMonths = [...new Set(data.map((d) => d.mois))];
  
  const useWeeks = uniqueMonths.length === 1;
  const groupByField = useWeeks ? "codeWeek" : "mois";
  
  const g = groupBy(data, (d) => d[groupByField]);
  const timeLabels = Object.keys(g).sort((a, b) => {
    if (useWeeks) return a.localeCompare(b);
    return MOIS_ORDER.indexOf(a) - MOIS_ORDER.indexOf(b);
  });

  return {
    data: timeLabels.map((time) => {
      const entry: Record<string, string | number> = { 
        time: useWeeks ? time.replace(/^\d{4}W/, "S") : time.slice(0, 4) 
      };
      brands.forEach((brand) => {
        entry[brand] = sumField(
          g[time]?.filter((d) => d.brand === brand) || [],
          "sellOut"
        );
      });
      return entry;
    }),
    label: useWeeks ? "Évolution hebdomadaire" : "Évolution mensuelle"
  };
}

export default function BrandAnalysis({ data }: Props) {
  const agg = brandAgg(data);
  const brands = [...new Set(data.map((d) => d.brand))];
  const trend = trendByTime(data);
  const fmt = (v: number) => `${(v / 1000).toFixed(1)}k`;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">📊 Analyse par Marque</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { key: "volume" as const, label: "Volume par Marque", color: COLORS[0] },
          { key: "ca" as const, label: "CA par Marque ($)", color: COLORS[1] },
          { key: "marge" as const, label: "Marge Moyenne par Marque ($)", color: COLORS[2] },
        ].map(({ key, label, color }) => (
          <ChartContainer key={key} title={label}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={agg} layout="vertical" margin={{ left: 10, right: 10 }}>
                <XAxis type="number" tick={{ fill: "hsl(215,15%,55%)", fontSize: 11 }} tickFormatter={key !== "volume" ? fmt : undefined} />
                <YAxis dataKey="brand" type="category" tick={{ fill: "hsl(210,20%,85%)", fontSize: 11 }} width={90} />
                <Tooltip {...tooltipStyle} formatter={(v: number) => key !== "volume" ? `${v.toLocaleString("fr-FR")} $` : v.toLocaleString("fr-FR")} />
                <Bar dataKey={key} fill={color} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ))}
      </div>
      <ChartContainer title={`${trend.label} du volume par Marque`}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trend.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,12%,25%)" />
            <XAxis dataKey="time" tick={{ fill: "hsl(210,20%,85%)", fontSize: 11 }} />
            <YAxis tick={{ fill: "hsl(215,15%,55%)", fontSize: 11 }} />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ color: "hsl(210,20%,85%)" }} />
            {brands.map((brand, i) => (
              <Line key={brand} type="monotone" dataKey={brand} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
