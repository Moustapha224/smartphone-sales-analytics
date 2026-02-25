import React, { useRef } from "react";
import { Download } from "lucide-react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function ChartContainer({ title, children, className = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!containerRef.current) return;

    try {
      // Add a temporary class or style to ensure better quality/background
      const dataUrl = await toPng(containerRef.current, {
        backgroundColor: "hsl(var(--card))",
        cacheBust: true,
        style: {
          borderRadius: '12px'
        }
      });

      const link = document.createElement("a");
      link.download = `${title.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = dataUrl;
      link.click();
      
      toast.success("Graphique téléchargé avec succès");
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Erreur lors du téléchargement du graphique");
    }
  };

  return (
    <div ref={containerRef} className={`bg-card rounded-xl border border-border p-4 relative group ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleDownload}
          title="Télécharger en PNG"
        >
          <Download size={14} className="text-muted-foreground" />
        </Button>
      </div>
      {children}
    </div>
  );
}
