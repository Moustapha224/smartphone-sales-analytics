import * as React from "react";
import { Check, ChevronsUpDown, X, ListFilter, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export interface FilterOption {
    label: string;
    value: string;
}

interface FilterSelectProps {
    label: string;
    options: FilterOption[];
    selected: string[];
    onChange: (v: string[]) => void;
}

export function FilterSelect({ label, options, selected, onChange }: FilterSelectProps) {
    const [open, setOpen] = React.useState(false);

    const handleSelect = (currentValue: string) => {
        if (selected.includes(currentValue)) {
            onChange(selected.filter((item) => item !== currentValue));
        } else {
            onChange([...selected, currentValue]);
        }
    };

    const handleRemove = (e: React.MouseEvent, valueToRemove: string) => {
        e.stopPropagation();
        onChange(selected.filter((item) => item !== valueToRemove));
    };

    const handleSelectAll = () => {
        onChange(options.map(o => o.value));
    };

    const handleClearAll = () => {
        onChange([]);
    };

    const displayMap = React.useMemo(() => {
        return options.reduce((acc, opt) => {
            acc[opt.value] = opt.label;
            return acc;
        }, {} as Record<string, string>);
    }, [options]);

    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground font-medium">{label}</label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between h-auto min-h-[38px] px-2 py-1.5 text-xs text-left font-normal bg-secondary/50 border-border hover:bg-secondary/80"
                    >
                        <div className="flex flex-wrap gap-1 items-center overflow-hidden">
                            {selected.length === 0 ? (
                                <span className="text-muted-foreground">Tous</span>
                            ) : (
                                selected.map((val) => (
                                    <Badge
                                        key={val}
                                        variant="secondary"
                                        className="px-1.5 py-0 min-h-[20px] rounded-sm text-[10px] font-normal flex items-center gap-1 bg-background"
                                    >
                                        <span className="truncate max-w-[80px]">{displayMap[val] || val}</span>
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            className="hover:bg-muted md:p-0.5 rounded-full cursor-pointer"
                                            onClick={(e) => handleRemove(e, val)}
                                        >
                                            <X className="h-3 w-3" />
                                        </div>
                                    </Badge>
                                ))
                            )}
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                    <Command>
                        <CommandInput placeholder={`Rechercher...`} className="h-9 text-xs" />
                        <CommandList>
                            <CommandEmpty className="text-xs py-4 text-center">Aucun résultat trouvé.</CommandEmpty>
                            <CommandGroup>
                                <div className="flex items-center justify-between px-2 py-1.5 border-b border-border/50">
                                    <button
                                        onClick={handleSelectAll}
                                        className="flex items-center gap-1.5 text-[10px] text-primary hover:text-primary/80 transition-colors font-medium"
                                    >
                                        <ListFilter size={12} /> Tout sél.
                                    </button>
                                    <button
                                        onClick={handleClearAll}
                                        className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors font-medium"
                                    >
                                        <RotateCcw size={12} /> Effacer
                                    </button>
                                </div>
                            </CommandGroup>
                            <CommandGroup className="max-h-64 overflow-y-auto">
                                {options.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        value={option.label} // Search by label
                                        onSelect={() => handleSelect(option.value)}
                                        className="text-xs"
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4 text-primary",
                                                selected.includes(option.value) ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <span className="truncate">{option.label}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
