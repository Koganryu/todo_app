import { useEffect, useMemo, useState } from 'react';
import type { Todo, Filter } from '../types/todo';

const STORAGE_KEY = 'todos:v1';

const load = (): Todo[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>(load());
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const filtered = useMemo(() => {
    switch (filter) {
      case 'active':
        return todos.filter((t) => !t.completed);
      case 'completed':
        return todos.filter((t) => t.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  const add = (title: string) =>
    setTodos((prev) => [
      { id: crypto.randomUUID(), title, completed: false },
      ...prev,
    ]);

  const toggle = (id: string) =>
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );

  const remove = (id: string) =>
    setTodos((prev) => prev.filter((t) => t.id !== id));

  return { todos, filtered, filter, setFilter, add, toggle, remove };
};
