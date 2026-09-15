import type { Dimensions } from '@/types/inventory';

interface DimensionsFieldsProps {
  label: string;
  value: Dimensions;
  onChange: (dimensions: Dimensions) => void;
}

const fields: { key: keyof Dimensions; label: string }[] = [
  { key: 'lengthCm', label: 'L (cm)' },
  { key: 'widthCm', label: 'W (cm)' },
  { key: 'heightCm', label: 'H (cm)' },
];

export function DimensionsFields({ label, value, onChange }: DimensionsFieldsProps) {
  const handleChange = (key: keyof Dimensions, raw: string) => {
    const parsed = raw === '' ? 0 : Number.parseFloat(raw);
    onChange({
      ...value,
      [key]: Number.isFinite(parsed) ? Math.max(0, parsed) : 0,
    });
  };

  return (
    <fieldset className="space-y-3">
      <legend className="font-display text-[11px] tracking-[0.16em] text-ink-muted uppercase">{label}</legend>
      <div className="grid gap-3 sm:grid-cols-3">
        {fields.map((field) => (
          <label key={field.key} className="block space-y-2">
            <span className="text-xs text-ink-muted">{field.label}</span>
            <input
              type="number"
              min={0}
              step="0.1"
              inputMode="decimal"
              value={value[field.key] || ''}
              onChange={(event) => handleChange(field.key, event.target.value)}
              className="inventory-input"
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
