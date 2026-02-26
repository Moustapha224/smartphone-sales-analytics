import { ComputedRecord } from "@/lib/types";
import { sumField, groupBy } from "@/lib/data-store";
import { TrendingUp, DollarSign, BarChart3, Percent, Store, Crown } from "lucide-react";

interface KPICardsProps {
  data: ComputedRecord[];
}

interface KPICardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  accent?: string;
}

function KPICard({ title, value, icon, accent = "primary" }: KPICardProps) {
  const accentStyles: Record<string, string> = {
    primary: "border-primary/20 bg-primary/5",
    accent: "border-accent/20 bg-accent/5",
    warning: "border-warning/20 bg-warning/5",
    destructive: "border-destructive/20 bg-destructive/5",
    default: "border-border/60",
  };

  const iconStyles: Record<string, string> = {
    primary: "text-primary bg-primary/10",
    accent: "text-accent bg-accent/10",
    warning: "text-warning bg-warning/10",
    destructive: "text-destructive bg-destructive/10",
    default: "text-muted-foreground bg-muted",
  };

  return (
    <div className={`rounded-xl border p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${accentStyles[accent] || accentStyles.default}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">{title}</span>
        <span className={`p-2 rounded-lg ${iconStyles[accent] || iconStyles.default}`}>{icon}</span>
      </div>
      <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
    </div>
  );
}

export default function KPICards({ data }: KPICardsProps) {
  const totalVolume = sumField(data, "sellOut");
  const totalCA = sumField(data, "ca");
  const totalMarge = sumField(data, "margeTotale");
  const tauxMarge = totalCA > 0 ? (totalMarge / totalCA) * 100 : 0;
  const uniquePOS = new Set(data.map((d) => d.codePOS)).size;

  const byBrand = groupBy(data, (d) => d.brand);
  let leaderBrand = "—";
  let maxVol = 0;
  for (const [brand, items] of Object.entries(byBrand)) {
    const vol = sumField(items, "sellOut");
    if (vol > maxVol) {
      maxVol = vol;
      leaderBrand = brand;
    }
  }

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <KPICard title="Volume Total" value={totalVolume.toLocaleString("fr-FR")} icon={<BarChart3 size={18} />} accent="primary" />
      <KPICard title="Chiffre d'Affaires" value={fmt(totalCA)} icon={<DollarSign size={18} />} accent="accent" />
      <KPICard title="Marge Totale" value={fmt(totalMarge)} icon={<TrendingUp size={18} />} accent="warning" />
      <KPICard title="Taux de Marge" value={`${tauxMarge.toFixed(1)}%`} icon={<Percent size={18} />} accent="default" />
      <KPICard title="Points de Vente" value={uniquePOS.toLocaleString("fr-FR")} icon={<Store size={18} />} accent="default" />
      <KPICard title="Marque Leader" value={leaderBrand} icon={<Crown size={18} />} accent="primary" />
    </div>
  );
}
