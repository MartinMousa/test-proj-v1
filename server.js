// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost/todo_list_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define schemas
const TodoSchema = new mongoose.Schema({
  text: String,
  completed: Boolean,
  dueDate: String,
  priority: String,
});

const ListSchema = new mongoose.Schema({
  name: String,
  todos: [TodoSchema],
});

// Define models
const List = mongoose.model('List', ListSchema);

// Routes
app.get('/api/lists', async (req, res) => {
  try {
    const lists = await List.find();
    res.json(lists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/lists', async (req, res) => {
  const list = new List({
    name: req.body.name,
    todos: [],
  });

  try {
    const newList = await list.save();
    res.status(201).json(newList);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/lists/:listId/todos', async (req, res) => {
  try {
    const list = await List.findById(req.params.listId);
    if (!list) return res.status(404).json({ message: 'List not found' });

    list.todos.push({
      text: req.body.text,
      completed: false,
      dueDate: req.body.dueDate,
      priority: req.body.priority,
    });

    const updatedList = await list.save();
    res.status(201).json(updatedList);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/lists/:listId/todos/:todoId', async (req, res) => {
  try {
    const list = await List.findById(req.params.listId);
    if (!list) return res.status(404).json({ message: 'List not found' });

    const todo = list.todos.id(req.params.todoId);
    if (!todo) return res.status(404).json({ message: 'Todo not found' });

    todo.text = req.body.text || todo.text;
    todo.completed = req.body.completed !== undefined ? req.body.completed : todo.completed;
    todo.dueDate = req.body.dueDate || todo.dueDate;
    todo.priority = req.body.priority || todo.priority;

    const updatedList = await list.save();
    res.json(updatedList);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/lists/:listId/todos/:todoId', async (req, res) => {
  try {
    const list = await List.findById(req.params.listId);
    if (!list) return res.status(404).json({ message: 'List not found' });

    list.todos.pull({ _id: req.params.todoId });
    const updatedList = await list.save();
    res.json(updatedList);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/lists/:listId', async (req, res) => {
  try {
    const list = await List.findByIdAndDelete(req.params.listId);
    if (!list) return res.status(404).json({ message: 'List not found' });
    res.json({ message: 'List deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
