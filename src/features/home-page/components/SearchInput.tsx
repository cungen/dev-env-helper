import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onFocus: () => void;
  onBlur: () => void;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onFocus,
  onBlur,
  onChange,
  placeholder = "Spotlight Search",
}: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        value={value}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "pl-10 pr-4 py-3 rounded-lg border",
          "focus:ring-2 focus:ring-ring focus:ring-offset-0",
          "transition-all duration-200"
        )}
        aria-label="Search"
      />
    </div>
  );
}


