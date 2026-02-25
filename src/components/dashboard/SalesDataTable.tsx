import { useState, useMemo } from "react";
import { ComputedRecord } from "@/lib/types";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

interface SalesDataTableProps {
    data: ComputedRecord[];
}

export default function SalesDataTable({ data }: SalesDataTableProps) {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const filteredData = useMemo(() => {
        if (!search.trim()) return data;
        const lowerSearch = search.toLowerCase();
        return data.filter(
            (item) =>
                item.nameOfPOS.toLowerCase().includes(lowerSearch) ||
                item.codePOS.toLowerCase().includes(lowerSearch) ||
                item.product.toLowerCase().includes(lowerSearch) ||
                item.brand.toLowerCase().includes(lowerSearch) ||
                item.zone.toLowerCase().includes(lowerSearch)
        );
    }, [data, search]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
    const currentData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="bg-card rounded-xl border border-border p-5 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-foreground">Détail des Ventes</h2>
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher (POS, produit, marque, zone...)"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="pl-9 bg-background h-9 text-sm"
                    />
                </div>
            </div>

            <div className="rounded-md border border-border bg-background overflow-x-auto">
                <Table>
                    <TableHeader className="bg-muted/50 whitespace-nowrap">
                        <TableRow>
                            <TableHead>Code POS</TableHead>
                            <TableHead className="min-w-[150px]">Nom POS</TableHead>
                            <TableHead>Zone</TableHead>
                            <TableHead>Marque</TableHead>
                            <TableHead className="min-w-[150px]">Produit</TableHead>
                            <TableHead className="text-right">Vol.</TableHead>
                            <TableHead className="text-right">Prix Min</TableHead>
                            <TableHead className="text-right">CA</TableHead>
                            <TableHead>Mois</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center h-32 text-muted-foreground">
                                    Aucun résultat trouvé pour "{search}"
                                </TableCell>
                            </TableRow>
                        ) : (
                            currentData.map((row, i) => (
                                <TableRow key={`${row.codePOS}-${i}`} className="whitespace-nowrap hover:bg-muted/30">
                                    <TableCell className="font-medium text-xs">{row.codePOS}</TableCell>
                                    <TableCell className="text-xs truncate max-w-[200px]" title={row.nameOfPOS}>
                                        {row.nameOfPOS}
                                    </TableCell>
                                    <TableCell className="text-xs">{row.zone}</TableCell>
                                    <TableCell className="text-xs">{row.brand}</TableCell>
                                    <TableCell className="text-xs truncate max-w-[200px]" title={row.product}>
                                        {row.product}
                                    </TableCell>
                                    <TableCell className="text-right text-xs font-medium">{row.sellOut}</TableCell>
                                    <TableCell className="text-right text-xs">
                                        {row.salePrice.toLocaleString("fr-FR", { style: "currency", currency: "USD" })}
                                    </TableCell>
                                    <TableCell className="text-right text-xs font-medium text-primary">
                                        {row.ca.toLocaleString("fr-FR", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
                                    </TableCell>
                                    <TableCell className="text-xs">{row.mois.substring(0, 3)}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="text-xs text-muted-foreground">
                    Affichage de <span className="font-medium text-foreground">{filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> à{" "}
                    <span className="font-medium text-foreground">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> sur{" "}
                    <span className="font-medium text-foreground">{filteredData.length}</span> résultats
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="w-8 h-8 p-0"
                    >
                        <ChevronLeft size={16} />
                    </Button>
                    <span className="text-xs font-medium w-14 text-center">
                        {currentPage} / {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="w-8 h-8 p-0"
                    >
                        <ChevronRight size={16} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
