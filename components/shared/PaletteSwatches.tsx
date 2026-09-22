interface PaletteSwatchesProps {
  colors: string[];
}

export function PaletteSwatches({ colors }: PaletteSwatchesProps) {
  return (
    <div className="flex shrink-0 gap-[3px]">
      {colors.map((color, i) => (
        <span
          key={`${color}-${i}`}
          className="app-swatch"
          style={{ background: color }}
        />
      ))}
    </div>
  );
}
