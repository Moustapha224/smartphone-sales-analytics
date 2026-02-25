import { Filters, emptyFilters } from "@/lib/types";
import { Filter, X } from "lucide-react";
import { FilterSelect } from "./FilterSelect";

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  options: {
    segment: string[];
    product: string[];
    zone: string[];
    district: string[];
    typeOfPOS: string[];
    categoryOfPOS: string[];
    brand: string[];
    mois: string[];
    quarter: string[];
    codeWeek: string[];
    pos: { code: string; name: string }[];
    annee: number[];
  };
}

export default function DashboardFilters({ filters, onChange, options }: Props) {
  const hasFilters = Object.values(filters).some((v) => v.length > 0);

  const formatOptions = (values: string[]) => values.map(v => ({ label: v, value: v }));

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Filtres Globaux</h3>
        </div>
        {hasFilters && (
          <button onClick={() => onChange(emptyFilters)} className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 transition-colors">
            <X size={14} /> Réinitialiser
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <FilterSelect 
          label="POS (Point de Vente)" 
          options={options.pos.map(p => ({ label: `${p.name} (${p.code})`, value: p.code }))} 
          selected={filters.codePOS} 
          onChange={(v) => onChange({ ...filters, codePOS: v })} 
        />
        <FilterSelect 
          label="Marque" 
          options={formatOptions(options.brand)} 
          selected={filters.brand} 
          onChange={(v) => onChange({ ...filters, brand: v })} 
        />
        <FilterSelect 
          label="Segment" 
          options={formatOptions(options.segment)} 
          selected={filters.segment} 
          onChange={(v) => onChange({ ...filters, segment: v })} 
        />
        <FilterSelect 
          label="Produit" 
          options={formatOptions(options.product)} 
          selected={filters.product} 
          onChange={(v) => onChange({ ...filters, product: v })} 
        />
        <FilterSelect 
          label="Zone" 
          options={formatOptions(options.zone)} 
          selected={filters.zone} 
          onChange={(v) => onChange({ ...filters, zone: v })} 
        />
        <FilterSelect 
          label="District" 
          options={formatOptions(options.district)} 
          selected={filters.district} 
          onChange={(v) => onChange({ ...filters, district: v })} 
        />
        <FilterSelect 
          label="Type POS" 
          options={formatOptions(options.typeOfPOS)} 
          selected={filters.typeOfPOS} 
          onChange={(v) => onChange({ ...filters, typeOfPOS: v })} 
        />
        <FilterSelect 
          label="Catégorie POS" 
          options={formatOptions(options.categoryOfPOS)} 
          selected={filters.categoryOfPOS} 
          onChange={(v) => onChange({ ...filters, categoryOfPOS: v })} 
        />
        <FilterSelect 
          label="Semaine" 
          options={formatOptions(options.codeWeek)} 
          selected={filters.codeWeek} 
          onChange={(v) => onChange({ ...filters, codeWeek: v })} 
        />
        <FilterSelect 
          label="Mois" 
          options={formatOptions(options.mois)} 
          selected={filters.mois} 
          onChange={(v) => onChange({ ...filters, mois: v })} 
        />
        <FilterSelect 
          label="Trimestre" 
          options={formatOptions(options.quarter)} 
          selected={filters.quarter} 
          onChange={(v) => onChange({ ...filters, quarter: v })} 
        />
        <FilterSelect
          label="Année"
          options={options.annee.map(String).map(v => ({ label: v, value: v }))}
          selected={filters.annee.map(String)}
          onChange={(v) => onChange({ ...filters, annee: v.map(Number) })}
        />
      </div>
    </div>
  );
}
