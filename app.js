const express = require('express');
const app = express();
app.use(express.json());
const path = require('path');
const cors = require('cors');
app.use(cors());

let todos = [];
let id = 1;
const fs = require('fs');
const TODOS_FILE = 'todos.json';

// Helper to load todos from file
function loadTodos() {
  try {
    const data = fs.readFileSync(TODOS_FILE, 'utf8');
    const parsed = JSON.parse(data);
    todos = parsed.todos || [];
    id = parsed.id || 1;
  } catch (err) {
    todos = [];
    id = 1;
  }
}

// Helper to save todos to file
function saveTodos() {
  fs.writeFileSync(TODOS_FILE, JSON.stringify({ todos, id }, null, 2));
}

// Load todos on startup
loadTodos();

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, 'client')));

// Serve index.html for the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// Get all todos
app.get('/todos', (req, res) => {
  res.json(todos);
});

// Add a new todo
app.post('/todos', express.json(), (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }
  const todo = { id: id++, text, done: false };
  todos.push(todo);
  saveTodos();
  res.status(201).json(todo);
});

// Update a todo
app.put('/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === parseInt(req.params.id));
  if (!todo) return res.status(404).send('Not found');
  todo.text = req.body.text !== undefined ? req.body.text : todo.text;
  todo.done = req.body.done !== undefined ? req.body.done : todo.done;
  saveTodos();
  res.json(todo);
});

// Delete a todo by id
app.delete('/todos/:id', (req, res) => {
  const todoId = parseInt(req.params.id, 10);
  const index = todos.findIndex(t => t.id === todoId);
  if (index === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  const deleted = todos.splice(index, 1);
  saveTodos();
  res.json(deleted[0]);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 