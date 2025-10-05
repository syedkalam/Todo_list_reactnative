
export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
};

export type TodoState = {
  todos: Todo[];
  loaded: boolean;
};
