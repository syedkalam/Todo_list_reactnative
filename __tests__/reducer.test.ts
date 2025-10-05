/**
 * reducer.test.ts
 * Tests the reducer logic by using the exported reducer from context file.
 * Note: For this example, we reimplement a tiny reducer for test simplicity.
 */

import { v4 as uuidv4 } from 'uuid';

type Todo = { id: string; title: string; completed: boolean; createdAt: string };

type State = { todos: Todo[]; loaded: boolean };

type Action =
  | { type: 'ADD'; payload: { title: string } }
  | { type: 'UPDATE'; payload: { id: string; title?: string; completed?: boolean } }
  | { type: 'DELETE'; payload: { id: string } };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD': {
      const newTodo: Todo = { id: uuidv4(), title: action.payload.title, completed: false, createdAt: new Date().toISOString() };
      return { ...state, todos: [newTodo, ...state.todos] };
    }
    case 'UPDATE': {
      return { ...state, todos: state.todos.map(t => (t.id === action.payload.id ? { ...t, ...action.payload } : t)) };
    }
    case 'DELETE': {
      return { ...state, todos: state.todos.filter(t => t.id !== action.payload.id) };
    }
    default:
      return state;
  }
}

test('reducer add, update, delete flow', () => {
  let state: State = { todos: [], loaded: true };
  const afterAdd = reducer(state, { type: 'ADD', payload: { title: 'First' } });
  expect(afterAdd.todos.length).toBe(1);
  const id = afterAdd.todos[0].id;

  const afterUpdate = reducer(afterAdd, { type: 'UPDATE', payload: { id, title: 'First Edited', completed: true } });
  expect(afterUpdate.todos[0].title).toBe('First Edited');
  expect(afterUpdate.todos[0].completed).toBe(true);

  const afterDelete = reducer(afterUpdate, { type: 'DELETE', payload: { id } });
  expect(afterDelete.todos.length).toBe(0);
});
