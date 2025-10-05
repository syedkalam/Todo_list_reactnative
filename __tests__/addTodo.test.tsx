import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import AddTodo from "../src/components/addTodo/AddTodo";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import todosReducer from "../src/store/todosSlice";

function renderWithStore(ui: React.ReactElement) {
  const store = configureStore({ reducer: { todos: todosReducer } });
  return {
    ...render(<Provider store={store}>{ui}</Provider>),
    store,
  };
}

test("AddTodo allows typing and pressing add", () => {
  const onAuthenticated = jest.fn();
  const { getByPlaceholderText, getByText, store } = renderWithStore(
    <AddTodo
      editingTodo={null}
      clearEditing={() => {}}
      authenticated={true}
      onAuthenticated={onAuthenticated}
    />
  );

  const input = getByPlaceholderText("Add a todo...");
  fireEvent.changeText(input, "Hello test");
  const addBtn = getByText("ADD");
  fireEvent.press(addBtn);

  const state = store.getState();
  expect(state.todos.todos.length).toBe(1);
});
