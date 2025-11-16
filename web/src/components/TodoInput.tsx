import { useState } from 'react';
import type { FormEvent } from 'react';

export const TodoInput = ({ onAdd }: { onAdd: (title: string) => void }) => {
  const [title, setTitle] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = title.trim();
    if (!v) return;
    onAdd(v);
    setTitle('');
  };
  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: 8 }}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add todo"
      />
      <button type="submit">Add</button>
    </form>
  );
};
