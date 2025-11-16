import type { Todo } from '../types/todo';

type Props = {
  todo: Todo;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
};

export const TodoItem = ({ todo, onToggle, onRemove }: Props) => (
  <li style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
    <input
      type="checkbox"
      checked={todo.completed}
      onChange={() => onToggle(todo.id)}
    />
    <span style={{ textDecoration: todo.completed ? 'line-through' : 'none', flex: 1 }}>
      {todo.title}
    </span>
    <button onClick={() => onRemove(todo.id)}>Delete</button>
  </li>
);
