import { useState, useMemo, useCallback, useEffect } from "react";
import { Filters, emptyFilters } from "@/lib/types";
import { loadData, initData, computeRecord, applyFilters, getUniqueValues } from "@/lib/data-store";
import KPICards from "@/components/dashboard/KPICards";
import BrandAnalysis from "@/components/dashboard/BrandAnalysis";
import GeoAnalysis from "@/components/dashboard/GeoAnalysis";
import ProductAnalysis from "@/components/dashboard/ProductAnalysis";
import POSAnalysis from "@/components/dashboard/POSAnalysis";
import DashboardFilters from "@/components/dashboard/DashboardFilters";
import AddDataForm from "@/components/dashboard/AddDataForm";
import DataExport from "@/components/dashboard/DataExport";
import SalesDataTable from "@/components/dashboard/SalesDataTable";
import { Database, ChevronDown, ChevronUp } from "lucide-react";

const Index = () => {
  const [version, setVersion] = useState(0);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [showAddData, setShowAddData] = useState(false);

  useEffect(() => {
    initData().then(() => setVersion((v) => v + 1));
  }, []);

  const rawData = useMemo(() => loadData(), [version]);
  const computedData = useMemo(() => rawData.map(computeRecord), [rawData]);
  const filteredData = useMemo(() => applyFilters(computedData, filters), [computedData, filters]);
  const filterOptions = useMemo(() => getUniqueValues(filteredData), [filteredData]);

  const handleDataAdded = useCallback(() => setVersion((v) => v + 1), []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border/60 bg-card/90 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo-youcoul.png"
              alt="Youcoul International"
              className="h-10 w-auto object-contain rounded-md"
            />
            <div className="hidden sm:block h-8 w-px bg-border/60" />
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-foreground tracking-tight leading-tight">
                Smartphone Sales Analytics
              </h1>
              <p className="text-[11px] text-muted-foreground">
                {rawData.length.toLocaleString("fr-FR")} enregistrements · {new Set(rawData.map((d) => d.brand)).size} marques
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DataExport data={filteredData} />
            <button
              onClick={() => setShowAddData(!showAddData)}
              className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-xs font-medium hover:brightness-110 transition-all shadow-sm"
            >
              <Database size={14} />
              <span className="hidden sm:inline">{showAddData ? "Masquer" : "Données"}</span>
              {showAddData ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Add Data (collapsible) */}
        {showAddData && (
          <div className="animate-in slide-in-from-top-2 duration-300">
            <AddDataForm onDataAdded={handleDataAdded} />
          </div>
        )}

        {/* Filters */}
        <DashboardFilters filters={filters} onChange={setFilters} options={filterOptions} />

        {/* KPI Cards */}
        <KPICards data={filteredData} />

        {/* Brand Analysis */}
        <section>
          <BrandAnalysis data={filteredData} />
        </section>

        {/* POS Analysis */}
        <section>
          <POSAnalysis data={filteredData} />
        </section>

        {/* Geo Analysis */}
        <section>
          <GeoAnalysis data={filteredData} />
        </section>

        {/* Product Analysis */}
        <section>
          <ProductAnalysis data={filteredData} />
        </section>

        {/* Raw Data Table */}
        <section>
          <SalesDataTable data={filteredData} />
        </section>

        {/* Footer */}
        <footer className="text-center py-6 border-t border-border/40">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <img src="/logo-youcoul.png" alt="Youcoul" className="h-5 w-auto object-contain opacity-60" />
            <span>Youcoul International · Smartphone Sales Analytics</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
