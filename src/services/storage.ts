 

import * as SecureStore from 'expo-secure-store';
import { Todo } from '../types';

const STORAGE_KEY = 'secure_todos_v1';

export async function saveTodos(todos: Todo[]): Promise<void> {
  try {
    const raw = JSON.stringify(todos);
    await SecureStore.setItemAsync(STORAGE_KEY, raw, { keychainAccessible: SecureStore.ALWAYS_THIS_DEVICE_ONLY });
  } catch (err) {
    console.warn('saveTodos error', err);
    throw err;
  }
}

export async function loadTodos(): Promise<Todo[]> {
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Todo[];
  } catch (err) {
    console.warn('loadTodos error', err);
    return [];
  }
}

export async function clearTodos(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
  } catch (err) {
    console.warn('clearTodos error', err);
  }
}
