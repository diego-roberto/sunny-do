const { ipcRenderer } = require('electron');

const taskForm = document.getElementById('task-form');

taskForm.addEventListener('submit', (event) => {
  event.preventDefault()

  var nameInput = document.getElementById("task-name-input").value.trim();
  var dateInput = document.getElementById("task-date-input").valueAsDate;
  var statusInput = document.getElementById("task-status-input").value;

  if (nameInput < 5) {
    alert("task must be at least 5 characters long")
    return;
  }

  if (!dateInput) {
    dateInput = "--/--/----";
  }

  var newTask = {
    name: nameInput,
    date: dateInput,
    status: statusInput,
  };
  ipcRenderer.send('add-task', newTask)
  closeAddTaskWindow()
})

function closeAddTaskWindow() {
  ipcRenderer.send('close-add-task-window')
}

//custom close button
document.getElementById('close-button').addEventListener('click', () => {
  closeAddTaskWindow()
})