import { SalesRecord } from "@/lib/types";

export const emptyRecord: SalesRecord = {
    codePOS: "", index: 0, nameOfPOS: "", categoryOfPOS: "RETAILER", typeOfPOS: "SHOP",
    zone: "", district: "", distributionChannel: "", brand: "", segment: "SMARTPHONE",
    product: "", sellOut: 0, purchasePrice: 0, salePrice: 0, status: "MCS",
    codeWeek: "", annee: 2025, mois: "", quarter: "",
};

export const fields: { key: keyof SalesRecord; label: string; type: "text" | "number" }[] = [
    { key: "codePOS", label: "Code POS", type: "text" },
    { key: "index", label: "Index", type: "number" },
    { key: "nameOfPOS", label: "Nom du POS", type: "text" },
    { key: "categoryOfPOS", label: "Catégorie POS", type: "text" },
    { key: "typeOfPOS", label: "Type POS", type: "text" },
    { key: "zone", label: "Zone", type: "text" },
    { key: "district", label: "District", type: "text" },
    { key: "distributionChannel", label: "Canal Distribution", type: "text" },
    { key: "brand", label: "Marque", type: "text" },
    { key: "segment", label: "Segment", type: "text" },
    { key: "product", label: "Produit", type: "text" },
    { key: "sellOut", label: "Sell Out", type: "number" },
    { key: "purchasePrice", label: "Prix Achat ($)", type: "number" },
    { key: "salePrice", label: "Prix Vente ($)", type: "number" },
    { key: "status", label: "Statut", type: "text" },
    { key: "codeWeek", label: "Code Semaine", type: "text" },
    { key: "annee", label: "Année", type: "number" },
    { key: "mois", label: "Mois", type: "text" },
    { key: "quarter", label: "Trimestre", type: "text" },
];

export const COLUMN_ALIASES: Record<string, keyof SalesRecord> = {
    codepos: "codePOS", code_pos: "codePOS", "code pos": "codePOS", code: "codePOS",
    index: "index", idx: "index",
    nameofpos: "nameOfPOS", name_of_pos: "nameOfPOS", "name of pos": "nameOfPOS", "nom du pos": "nameOfPOS", nom: "nameOfPOS", name: "nameOfPOS",
    categoryofpos: "categoryOfPOS", category_of_pos: "categoryOfPOS", "category of pos": "categoryOfPOS", category: "categoryOfPOS", categorie: "categoryOfPOS", "catégorie pos": "categoryOfPOS", "catégorie": "categoryOfPOS",
    typeofpos: "typeOfPOS", type_of_pos: "typeOfPOS", "type of pos": "typeOfPOS", type: "typeOfPOS", "type pos": "typeOfPOS",
    zone: "zone", district: "district",
    distributionchannel: "distributionChannel", distribution_channel: "distributionChannel", "distribution channel": "distributionChannel", "canal distribution": "distributionChannel", canal: "distributionChannel",
    brand: "brand", marque: "brand", segment: "segment", product: "product", produit: "product",
    sellout: "sellOut", sell_out: "sellOut", "sell out": "sellOut", ventes: "sellOut", quantite: "sellOut", quantité: "sellOut",
    purchaseprice: "purchasePrice", purchase_price: "purchasePrice", "purchase price": "purchasePrice", "prix achat": "purchasePrice", "prix d'achat": "purchasePrice", prixachat: "purchasePrice",
    saleprice: "salePrice", sale_price: "salePrice", "sale price": "salePrice", "prix vente": "salePrice", "prix de vente": "salePrice", prixvente: "salePrice",
    status: "status", statut: "status",
    codeweek: "codeWeek", code_week: "codeWeek", "code week": "codeWeek", "code semaine": "codeWeek", semaine: "codeWeek",
    annee: "annee", année: "annee", year: "annee", an: "annee",
    mois: "mois", month: "mois", quarter: "quarter", trimestre: "quarter",
};

export function normalizeHeader(header: string): string {
    return header.trim().toLowerCase().replace(/[_\-\.]/g, " ").replace(/\s+/g, " ");
}

export function mapHeaders(headers: string[]): Record<number, keyof SalesRecord> {
    const mapping: Record<number, keyof SalesRecord> = {};
    const usedKeys = new Set<keyof SalesRecord>();

    for (let i = 0; i < headers.length; i++) {
        const normalized = normalizeHeader(headers[i]);
        const matchedKey = COLUMN_ALIASES[normalized];
        if (matchedKey && !usedKeys.has(matchedKey)) {
            mapping[i] = matchedKey;
            usedKeys.add(matchedKey);
        }
    }
    return mapping;
}

export function parseExcelValue(value: unknown, fieldType: "text" | "number"): string | number {
    if (value == null || value === "") return fieldType === "number" ? 0 : "";
    if (fieldType === "number") {
        const str = String(value).replace(/[$€\s]/g, "").replace(",", ".");
        return parseFloat(str) || 0;
    }
    return String(value).trim();
}

export function rowToSalesRecord(
    row: unknown[],
    headerMapping: Record<number, keyof SalesRecord>,
): SalesRecord {
    const record: SalesRecord = { ...emptyRecord };
    const fieldTypeMap = new Map(fields.map((f) => [f.key, f.type]));

    for (const [colIdx, fieldKey] of Object.entries(headerMapping)) {
        const idx = parseInt(colIdx);
        const fType = fieldTypeMap.get(fieldKey) || "text";
        const parsed = parseExcelValue(row[idx], fType);
        (record as any)[fieldKey] = parsed;
    }
    return record;
}
