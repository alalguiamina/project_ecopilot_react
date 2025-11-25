import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import "./SearchableCombobox.css";

interface SearchableComboboxProps {
  items: { value: number | string; label: string }[];
  value: number | string | null;
  placeholder?: string;
  onChange: (value: number | string) => void;
}
export const SearchableCombobox: React.FC<SearchableComboboxProps> = ({
  items,
  value,
  placeholder,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered =
    query.length === 0
      ? items
      : items.filter((i) =>
          i.label.toLowerCase().includes(query.toLowerCase()),
        );

  const handleSelect = (v: string | number) => {
    onChange(v);
    setOpen(false);
    setQuery("");
  };

  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, []);

  return (
    <div className="combo" ref={ref}>
      <button className="combo-trigger" onClick={() => setOpen((o) => !o)}>
        <span>
          {items.find((i) => i.value === value)?.label || placeholder}
        </span>
        <ChevronDown size={18} />
      </button>

      {open && (
        <div className="combo-panel">
          <input
            className="combo-search"
            placeholder="Rechercher..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="combo-list">
            {filtered.length === 0 && (
              <div className="combo-empty">Aucun résultat</div>
            )}
            {filtered.map((item) => (
              <div
                key={item.value}
                className="combo-item"
                onClick={() => handleSelect(item.value)}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default SearchableCombobox;
