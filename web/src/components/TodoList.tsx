import type { Todo } from '../types/todo';
import { TodoItem } from './TodoItem';

type Props = {
  todos: Todo[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
};

export const TodoList = ({ todos, onToggle, onRemove }: Props) => (
  <ul style={{ padding: 0, listStyle: 'none' }}>
    {todos.map((t) => (
      <TodoItem key={t.id} todo={t} onToggle={onToggle} onRemove={onRemove} />
    ))}
  </ul>
);
