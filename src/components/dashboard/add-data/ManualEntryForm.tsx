import { SalesRecord } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fields, emptyRecord } from "./import-utils";
import { useState } from "react";

interface ManualEntryFormProps {
    onAdd: (record: SalesRecord) => void;
}

export function ManualEntryForm({ onAdd }: ManualEntryFormProps) {
    const [record, setRecord] = useState<SalesRecord>({ ...emptyRecord });

    const handleSubmit = () => {
        if (!record.codePOS || !record.nameOfPOS || !record.product || record.sellOut <= 0) {
            return;
        }
        onAdd(record);
        setRecord({ ...emptyRecord });
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {fields.map(({ key, label, type }) => (
                    <div key={key} className="flex flex-col gap-1.5">
                        <Label htmlFor={key} className="text-xs text-muted-foreground">{label}</Label>
                        <Input
                            id={key}
                            type={type}
                            value={record[key] as string | number}
                            onChange={(e) => setRecord({ ...record, [key]: type === "number" ? parseFloat(e.target.value) || 0 : e.target.value })}
                            className="h-9 text-sm"
                        />
                    </div>
                ))}
            </div>
            <Button onClick={handleSubmit} className="w-full sm:w-auto">
                Ajouter la ligne
            </Button>
        </div>
    );
}
