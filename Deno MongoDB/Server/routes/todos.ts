import { Router } from "https://deno.land/x/oak@v16.0.0/mod.ts";

const router = new Router();

interface Todo {
    id: string,
    text: string
}

let todos: Todo[] = [];

router.get("/todos", (ctx) => {
    ctx.response.body = {todos: todos};
})

router.post("/todos", async (ctx) => {
    const data = await ctx.request.body;
    const newTodo: Todo = {
        id: new Date().toISOString(),
        text: (await data.json()).text
    }
    todos.push(newTodo);

    ctx.response.body = {message: "Created todo!", todo: newTodo}
})

router.put("/todos/:todoId", async (ctx) => {
    const data = await ctx.request.body;
    const tid = ctx.params.todoId;
    const todoIndex = todos.findIndex(todo => {
        return todo.id === tid
    })
    todos[todoIndex] = {
        id: todos[todoIndex].id,
        text: (await data.json()).text
    }
    ctx.response.body = {message: "Updated todo!", todo: todos[todoIndex]}
})

router.delete("/todos/:todoId", (ctx) => {
    const tid = ctx.params.todoId;
    todos = todos.filter(todo => todo.id !== tid)
    ctx.response.body = {message: "Deleted todo!", todos: todos}
})

export default router;