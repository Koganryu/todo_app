import type { Filter } from '../types/todo';

type Props = { value: Filter; onChange: (f: Filter) => void };

export const FilterBar = ({ value, onChange }: Props) => (
  <div style={{ display: 'flex', gap: 8 }}>
    {(['all', 'active', 'completed'] as const).map((f) => (
      <button key={f} disabled={value === f} onClick={() => onChange(f)}>
        {f}
      </button>
    ))}
  </div>
);
