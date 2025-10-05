import { createSlice, PayloadAction, createAsyncThunk, ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { Todo, TodoState } from '../types';
import { loadTodos as storageLoad, saveTodos as storageSave } from '../services/storage';
import { v4 as uuidv4 } from 'uuid';

export const loadTodos = createAsyncThunk('todos/load', async () => {
  const todos = await storageLoad();
  return todos as Todo[];
});

// Whenever todos change we persist them. We'll export a helper thunk.
export const persistTodos = createAsyncThunk('todos/persist', async (todos: Todo[]) => {
  await storageSave(todos);
  return todos;
});

const initialState: TodoState = { todos: [], loaded: false };

const slice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    add(state: TodoState, action: PayloadAction<{ title: string }>) {
      const newTodo: Todo = {
        id: uuidv4(),
        title: action.payload.title,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      state.todos.unshift(newTodo);
    },
    update(state: TodoState, action: PayloadAction<{ id: string; title?: string; completed?: boolean }>) {
      state.todos = state.todos.map((t: Todo) => (t.id === action.payload.id ? { ...t, ...action.payload } : t));
    },
    remove(state: TodoState, action: PayloadAction<{ id: string }>) {
      state.todos = state.todos.filter((t: Todo) => t.id !== action.payload.id);
    },
    clear(state: TodoState) {
      state.todos = [];
    }
  },
  extraReducers: (builder: ActionReducerMapBuilder<TodoState>) => {
    builder.addCase(loadTodos.fulfilled, (state: TodoState, action: PayloadAction<Todo[]>) => {
      state.todos = action.payload;
      state.loaded = true;
    });
  }
});

export const { add, update, remove, clear } = slice.actions;

export default slice.reducer;
