// DOM Elements
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList"); // Liste des tâches en cours
const taskListCompleted = document.getElementById("taskListCompleted"); // Liste des tâches terminées

// Écouteurs d'événements pour initialiser l'application et ajouter une tâche
document.addEventListener("DOMContentLoaded", initializeApp);
addTaskBtn.addEventListener("click", handleAddTask);

// Gère l'initialisation du thème (clair/sombre) à partir du stockage local et permet de basculer entre les thèmes.
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  const themeToggleBtn = document.querySelector('.theme-toggle-btn');
  
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  
  themeToggleBtn.addEventListener('click', toggleTheme);
}

function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  
  if (isDark) {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  }
}

// Initialization
function initializeApp() {
  initializeTheme();
  fetchTasks();
}

// Appels API
async function fetchTasks() {
  try {
    const response = await fetch("/tasks");
    const tasks = await response.json();
    renderAllTasks(tasks); // Affiche toutes les tâches récupérées
  } catch (error) {
    handleError(error, "Erreur lors du chargement des tâches");
  }
}

async function addTask(taskName) {
  try {
    const response = await fetch("/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: taskName }),
    });
    const task = await response.json();
    taskInput.value = "";
    renderTask(task);
  } catch (error) {
    handleError(error, "Erreur lors de l'ajout de la tâche");
  }
}

async function updateTask(id, data) {
  try {
    const response = await fetch(`/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    handleError(error, "Erreur lors de la mise à jour de la tâche");
  }
}

async function deleteTaskRequest(id) {
  try {
    const response = await fetch(`/tasks/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }
    return true;
  } catch (error) {
    handleError(error, "Erreur lors de la suppression de la tâche");
    return false;
  }
}

async function completeTask(id) {
  try {
    const response = await fetch(`/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: true }),
    });
    return await response.json();
  } catch (error) {
    handleError(error, "Erreur lors de la complétion de la tâche");
  }
}

async function unfinishTask(id) {
  try {
    const response = await fetch(`/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: false }),
    });
    const updatedTask = await response.json();
    s
    const taskEl = document.querySelector(`#taskListCompleted li[data-id="${id}"]`);
    if (taskEl) taskEl.remove();
    renderTask(updatedTask);
  } catch (error) {
    handleError(error, "Erreur lors de la modification de la tâche");
  }
}


// Affiche les tâches terminées et non terminées
function renderAllTasks(tasks) {
  const completedTasks = tasks.filter(task => task.completed);
  completedTasks.forEach(task => renderTaskCompleted(task));
  tasks.forEach(task => renderTask(task));
}

function renderTask(task) {
  if (task.completed) return;
  const existingTask = document.querySelector(`#taskList li[data-id="${task.id}"]`);
  const li = existingTask || document.createElement("li");
  li.dataset.id = task.id;
  li.className = "";

  li.innerHTML = `
    <span>${task.name} ✗</span>
    <button onclick="showDeleteConfirmation('${task.id}')">🗑️ Supprimer</button>
    <button onclick="showCompleteConfirmation('${task.id}')">✓ Terminer</button>
    <button onclick="showEditModal('${task.id}', '${task.name.replace(/'/g, "\\'").replace(/"/g, "&quot;")}')">✏️ Modifier</button>
  `;

  if (!existingTask) {
    taskList.appendChild(li);
  }
}

function renderTaskCompleted(task) {
  if (!task.completed) return;

  const existingTask = document.querySelector(`#taskListCompleted li[data-id="${task.id}"]`);
  const li = existingTask || document.createElement("li");
  li.dataset.id = task.id;
  li.className = "completed";

  li.innerHTML = `
    <span>${task.name} ✓</span>
    <button onclick="showDeleteConfirmation('${task.id}')">🗑️ Supprimer</button>
    <button onclick="unfinishTask('${task.id}')">❌ Pas terminé</button>
  `;

  if (!existingTask) {
    taskListCompleted.appendChild(li);
  }
}

// Modal Management
function createModal(content, className) {
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  
  const modal = document.createElement('div');
  modal.className = className;
  modal.innerHTML = content;
  
  document.body.appendChild(overlay);
  document.body.appendChild(modal);
  
  return { overlay, modal };
}

function removeModal(overlay, modal) {
  document.body.removeChild(overlay);
  document.body.removeChild(modal);
}

// Ajoute une nouvelle tâche si un nom est fourni, sinon affiche un avertissement
function handleAddTask() {
  const taskName = taskInput.value.trim();
  if (taskName) {
    addTask(taskName);
  } else {
    showEmptyTaskAlert();
  }
}

function showEmptyTaskAlert() {
  const { overlay, modal } = createModal(`
    <p>Veuillez entrer un nom pour la tâche</p>
    <div class="confirmation-alert-buttons">
      <button class="cancel-btn">OK</button>
    </div>
  `, 'confirmation-alert');
  
  modal.querySelector('.cancel-btn').addEventListener('click', () => {
    removeModal(overlay, modal);
    taskInput.focus();
  });
  
  setupEscapeKey(modal, overlay);
}

function showDeleteConfirmation(id) {
  const { overlay, modal } = createModal(`
    <p>Êtes-vous sûr de vouloir supprimer cette tâche ?</p>
    <div class="confirmation-alert-buttons">
      <button class="cancel-btn">Annuler</button>
      <button class="confirm-btn">Supprimer</button>
    </div>
  `, 'confirmation-alert');
  
  modal.querySelector('.cancel-btn').addEventListener('click', () => removeModal(overlay, modal));
  modal.querySelector('.confirm-btn').addEventListener('click', async () => {
    const success = await deleteTaskRequest(id);
    if (success) {
      const taskEl = document.querySelector(`li[data-id="${id}"]`);
      if (taskEl) taskEl.remove();
    }
    removeModal(overlay, modal);
  });
  
  setupEscapeKey(modal, overlay);
}

function showCompleteConfirmation(id) {
  const { overlay, modal } = createModal(`
    <p>Êtes-vous sûr de vouloir marquer cette tâche comme terminée ?</p>
    <div class="confirmation-alert-buttons">
      <button class="cancel-btn">Annuler</button>
      <button class="confirm-btn">Terminer</button>
    </div>
  `, 'confirmation-alert');
  
  modal.querySelector('.cancel-btn').addEventListener('click', () => removeModal(overlay, modal));
  modal.querySelector('.confirm-btn').addEventListener('click', async () => {
    const updatedTask = await completeTask(id);
    if (updatedTask) {
      const taskEl = document.querySelector(`#taskList li[data-id="${id}"]`);
      if (taskEl) taskEl.remove();
      renderTaskCompleted(updatedTask);
    }
    removeModal(overlay, modal);
  });
  
  setupEscapeKey(modal, overlay);
}

function showEditModal(id, currentName) {
  const { overlay, modal } = createModal(`
    <h3>Modifier la tâche</h3>
    <input type="text" id="editTaskInput" value="${currentName}" autofocus>
    <div class="edit-task-modal-buttons">
      <button class="cancel-btn">Annuler</button>
      <button class="save-btn">Enregistrer</button>
    </div>
  `, 'edit-task-modal');
  
  const input = modal.querySelector('#editTaskInput');
  input.focus();
  input.select();
  
  modal.querySelector('.cancel-btn').addEventListener('click', () => removeModal(overlay, modal));
  modal.querySelector('.save-btn').addEventListener('click', async () => {
    const newName = input.value.trim();
    if (newName) {
      const updatedTask = await updateTask(id, { name: newName });
      if (updatedTask) {
        const taskEl = document.querySelector(`li[data-id="${id}"]`);
        if (taskEl) {
          if (updatedTask.completed) {
            renderTaskCompleted(updatedTask);
          } else {
            renderTask(updatedTask);
          }
        }
      }
      removeModal(overlay, modal);
    } else {
      input.focus();
    }
  });
  
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      modal.querySelector('.save-btn').click();
    }
  });
  
  setupEscapeKey(modal, overlay);
}

// Utility Functions
function setupEscapeKey(modal, overlay) {
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      removeModal(overlay, modal);
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

function handleError(error, message = "Une erreur est survenue") {
  console.error(message, error);
  alert(message);
}

// Filtre et affiche les tâches selon le type de filtre ('all', 'inProgress', 'completed')
function filterTasks(filterType) {
  const pasTermineSection = document.querySelector(".pasTermine");
  const termineSection = document.querySelector(".termine");
  
  switch(filterType) {
    case 'all':
      pasTermineSection.style.display = 'block';
      termineSection.style.display = 'block';
      break;
    case 'inProgress':
      pasTermineSection.style.display = 'block';
      termineSection.style.display = 'none';
      break;
    case 'completed':
      pasTermineSection.style.display = 'none';
      termineSection.style.display = 'block';
      break;
  }
  
  document.querySelectorAll('.filter-buttons button').forEach(button => {
    button.classList.remove('active');
  });
  event.target.classList.add('active');
}

const btn = document.querySelector('.container-btn');

btn.addEventListener("click", () => {
  const result = btn.classList.toggle("end");

  if(result){
    document.body.classList.add("dark");
    document.getElementById("app").classList.add("dark")

  }else{
    document.body.classList.remove("dark")
    document.getElementById("app").classList.remove("dark")
  }

})  