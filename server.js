const express = require('express');
const fs = require('fs');
const app = express();
const port = 3015;

let tasks = JSON.parse(fs.readFileSync('./data/tasks.json', 'utf8'));

// Configuration
app.use(express.json());
app.use(express.static('public'));


let currentId = 2;

// Helper Functions
function findTaskById(id) {
  return tasks.find(task => task.id === id);
}

function findTaskIndexById(id) {
  return tasks.findIndex(task => task.id === id);
}

function validateTaskName(name) {
  if (!name || name.trim() === '') {
    return {
      isValid: false,
      error: {
        status: 400,
        message: "Le nom de la tâche est obligatoire"
      }
    };
  }
  return { isValid: true };
}

// Route Handlers
function getAllTasks(req, res) {
  res.json(tasks);
}

function createTask(req, res) {
  const validation = validateTaskName(req.body.name);
  if (!validation.isValid) {
    return res.status(validation.error.status).json(validation.error);
  }

  const task = {
    id: currentId++,
    name: req.body.name.trim(),
    completed: false
  };

  tasks.push(task);
  saveTasksToFile(); // Sauvegarde dans le fichier
  console.log('Nouvelle tâche créée:', JSON.stringify(task, null, 2));
  res.status(201).json(task);
}

function deleteTask(req, res) {
  const id = parseInt(req.params.id);
  console.log(`Suppression de la tâche avec ID: ${id}`);

  const initialLength = tasks.length;
  tasks = tasks.filter(task => task.id !== id);

  if (tasks.length < initialLength) {
    saveTasksToFile();
    res.status(200).json({ message: "Tâche supprimée" });
  } else {
    res.status(404).json({ message: "Tâche non trouvée" });
  }
}

function updateTask(req, res) {
  const id = parseInt(req.params.id);
  const taskIndex = findTaskIndexById(id);

  if (taskIndex === -1) {
    return res.status(404).json({ message: "Tâche non trouvée" });
  }

  if (req.body.name !== undefined) {
    const validation = validateTaskName(req.body.name);
    if (!validation.isValid) {
      return res.status(validation.error.status).json(validation.error);
    }
  }

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    name: req.body.name !== undefined ? req.body.name.trim() : tasks[taskIndex].name,
    completed: req.body.completed !== undefined ? req.body.completed : tasks[taskIndex].completed
  };

  saveTasksToFile(); // Sauvegarde dans le fichier
  console.log(`Tâche ${id} mise à jour via PUT`);
  res.json(tasks[taskIndex]);
}

function patchTask(req, res) {
  const id = parseInt(req.params.id);
  const taskIndex = findTaskIndexById(id);

  if (taskIndex === -1) {
    return res.status(404).json({ message: "Tâche non trouvée" });
  }

  if (req.body.name !== undefined) {
    const validation = validateTaskName(req.body.name);
    if (!validation.isValid) {
      return res.status(validation.error.status).json(validation.error);
    }
    req.body.name = req.body.name.trim();
  }

  tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
  saveTasksToFile(); // Sauvegarde dans le fichier
  res.json(tasks[taskIndex]);
}


// Save data file
function saveTasksToFile() {
  try {
    fs.writeFileSync('./data/tasks.json', JSON.stringify(tasks, null, 2), 'utf8');
    console.log('Fichier tasks.json mis à jour avec succès');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du fichier tasks.json:', error);
  }
}

// Routes
app.get('/tasks', getAllTasks);
app.post('/tasks', createTask);
app.delete('/tasks/:id', deleteTask);
app.put('/tasks/:id', updateTask);
app.patch('/tasks/:id', patchTask);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Une erreur interne est survenue" });
});

// Start Server
app.listen(port, () => console.log(`Serveur démarré sur http://localhost:${port}`));