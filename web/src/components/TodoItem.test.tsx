import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoItem } from './TodoItem'

test('toggle and delete buttons work', async () => {
  const user = userEvent.setup()
  const onToggle = vi.fn()
  const onRemove = vi.fn()
  render(
    <TodoItem
      todo={{ id: '1', title: 'A', completed: false }}
      onToggle={onToggle}
      onRemove={onRemove}
    />
  )

  await user.click(screen.getByRole('checkbox'))
  expect(onToggle).toHaveBeenCalledWith('1')

  await user.click(screen.getByRole('button', { name: /delete/i }))
  expect(onRemove).toHaveBeenCalledWith('1')
})
