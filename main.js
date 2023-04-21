const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

let tasks = [];
let win = null;
let addTaskWindow = null;

// TO DO: remover! apenas para teste:
// const newTask = {
//   name: "implement weather",
//   date: Date.now(),
//   status: "done",
// };
// tasks.push(newTask)
// const otherTask = {
//   name: "fetch weather every 2 hours",
//   date: Date.now(),
//   status: "to do",
// };
// tasks.push(otherTask)
//

function createWindow() {
  win = new BrowserWindow({
    width: 300,
    height: 300,
    frame: false,
    resizable: false,
    transparent: true,
    hasShadow: true,
    roundedCorners: true,
    radii: [5,5,5,5],
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  })

  win.loadFile('html/index.html')

  win.webContents.on('did-finish-load', () => {
    win.webContents.send('tasks', tasks)
  });

  /* DevTools - comment the line below to disable */
  win.webContents.openDevTools()

}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('quit-app', () => {
  app.quit()
})

function createAddTaskWindow() {
  if (addTaskWindow) {
    addTaskWindow.focus()
    return
  }
  addTaskWindow = new BrowserWindow({
    width: 262,
    height: 150,
    title: "addTaskWindow",
    resizable: false,
    frame: false,
    transparent: true,
    hasShadow: true,
    roundedCorners: true,
    parent: win,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
  })

  addTaskWindow.loadFile("html/add-task.html");
  addTaskWindow.show()

  addTaskWindow.on("closed", () => {
    addTaskWindow = null;
  })

}

function isWindowOpen(windowName) {
  const windows = BrowserWindow.getAllWindows();
  for (let window of windows) {
    if (window.title == windowName) {
      return true;
    }
  }
  return false;
}

ipcMain.on('is-open-task-window', (event) => {
  event.preventDefault()
  if (isWindowOpen('addTaskWindow')) {
    event.returnValue = true;
  } else {
    event.returnValue = false;
  }
})

ipcMain.on('open-add-task-window', () => {
  createAddTaskWindow()
})

ipcMain.on('close-add-task-window', () => {
  addTaskWindow.close()
})

ipcMain.on('add-task', (event, newTask) => {
  tasks.push(newTask);
  win.webContents.send('tasks', tasks);
})

