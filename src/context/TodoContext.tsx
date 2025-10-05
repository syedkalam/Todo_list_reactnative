/**
 * TodoContext.tsx
 * - provides TodoContext to the app
 * - uses useReducer for predictable updates
 * - loads initial state from secure storage on mount
 * - persists on every change
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  ReactNode,
} from "react";
import { Todo, TodoState } from "../types";
import { loadTodos, saveTodos } from "../services/storage";
import { v4 as uuidv4 } from "uuid";

/* ACTION TYPES */
type Action =
  | { type: "LOAD"; payload: Todo[] }
  | { type: "ADD"; payload: { title: string } }
  | {
      type: "UPDATE";
      payload: { id: string; title?: string; completed?: boolean };
    }
  | { type: "DELETE"; payload: { id: string } }
  | { type: "CLEAR" };

/* REDUCER */
function reducer(state: TodoState, action: Action): TodoState {
  switch (action.type) {
    case "LOAD":
      return { ...state, todos: action.payload, loaded: true };
    case "ADD": {
      const newTodo: Todo = {
        id: uuidv4(),
        title: action.payload.title,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      return { ...state, todos: [newTodo, ...state.todos] };
    }
    case "UPDATE": {
      const todos = state.todos.map((t) =>
        t.id === action.payload.id ? { ...t, ...action.payload } : t
      );
      return { ...state, todos };
    }
    case "DELETE": {
      const todos = state.todos.filter((t) => t.id !== action.payload.id);
      return { ...state, todos };
    }
    case "CLEAR":
      return { todos: [], loaded: true };
    default:
      return state;
  }
}

/* CONTEXT */
const initialState: TodoState = { todos: [], loaded: false };
const TodoStateContext = createContext<TodoState | undefined>(undefined);
const TodoDispatchContext = createContext<React.Dispatch<Action> | undefined>(
  undefined
);

export function TodoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // load todos on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      const stored = await loadTodos();
      if (!mounted) return;
      dispatch({ type: "LOAD", payload: stored });
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // persist whenever todos change
  useEffect(() => {
    // do not persist until loaded
    if (!state.loaded) return;
    (async () => {
      try {
        await saveTodos(state.todos);
      } catch (err) {
        console.warn("Failed to persist todos", err);
      }
    })();
  }, [state.todos, state.loaded]);

  return (
    <TodoStateContext.Provider value={state}>
      <TodoDispatchContext.Provider value={dispatch}>
        {children}
      </TodoDispatchContext.Provider>
    </TodoStateContext.Provider>
  );
}

/* hooks for consumers */
export function useTodoState() {
  const ctx = useContext(TodoStateContext);
  if (!ctx) throw new Error("useTodoState must be used within TodoProvider");
  return ctx;
}

export function useTodoDispatch() {
  const ctx = useContext(TodoDispatchContext);
  if (!ctx) throw new Error("useTodoDispatch must be used within TodoProvider");
  return ctx;
}
