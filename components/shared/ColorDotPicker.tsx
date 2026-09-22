interface ColorDotPickerProps {
  colors: readonly string[];
  selected: string;
  onSelect: (color: string) => void;
}

export function ColorDotPicker({ colors, selected, onSelect }: ColorDotPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          className={`app-color-dot${selected === color ? " selected" : ""}`}
          style={{ background: color }}
          onClick={() => onSelect(color)}
          aria-label={`Select color ${color}`}
        />
      ))}
    </div>
  );
}
