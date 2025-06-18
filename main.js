const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let notesPath = path.join(app.getPath('userData'), 'notes.json');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, 'notewaffle.ico') // optional
  });

  win.loadFile('index.html');
}

// 🧠 IPC handlers
ipcMain.handle('save-notes', (event, notes) => {
  fs.writeFileSync(notesPath, JSON.stringify(notes));
});

ipcMain.handle('load-notes', () => {
  if (fs.existsSync(notesPath)) {
    return JSON.parse(fs.readFileSync(notesPath));
  }
  return [];
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
