import todosReducer, { add, remove } from '../src/store/todosSlice';
import { TodoState } from '../src/types';

describe('todos slice', () => {
  it('should add and remove todos', () => {
    const initial: TodoState = { todos: [], loaded: true };
    const state1 = todosReducer(initial, add({ title: 'Test item' } as any));
    expect(state1.todos.length).toBe(1);
    const id = state1.todos[0].id;
    const state2 = todosReducer(state1, remove({ id } as any));
    expect(state2.todos.length).toBe(0);
  });
});
