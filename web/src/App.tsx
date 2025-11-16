import './App.css'
import { TodoInput } from './components/TodoInput'
import { TodoList } from './components/TodoList'
import { FilterBar } from './components/FilterBar'
import { useTodos } from './hooks/useTodos'

function App() {
  const { filtered, filter, setFilter, add, toggle, remove } = useTodos()
  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', display: 'grid', gap: 12 }}>
      <h1>Todo</h1>
      <TodoInput onAdd={add} />
      <FilterBar value={filter} onChange={setFilter} />
      <TodoList todos={filtered} onToggle={toggle} onRemove={remove} />
    </div>
  )
}

export default App
