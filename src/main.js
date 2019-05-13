
const { app, BrowserWindow, ipcMain } = require('electron')
const pkg = require('../package.json')
const path = require('path')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
var currentNoteID = 0

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 800,
    minHeight: 600,
    webPreferences: { nodeIntegration: true },
  })

  win.loadFile('res/editor.html')
  // Open the DevTools.
  win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })

  win.on('blur', () => {
    if (win.getTitle().startsWith("* ") && currentNoteID != 0) {
      win.setTitle(win.getTitle().substr(2));
      win.webContents.send('saveNow')
    }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

//ipcmain样板
ipcMain.on('open', (event, ...args) => {
  win.setTitle(args[0] + " - MarkDownald")
  win.webContents.send('content', args[1]);
})

ipcMain.on('opennew', (event, ...args) => {
  win.setTitle(args[0] + " - MarkDownald")
  currentNoteID = parseInt(args[1])
  win.loadFile('res/editor.html')
  win.webContents.on('did-finish-load', () => {
    win.webContents.send('opennew', currentNoteID)
  })
})

ipcMain.on('change', (event, args) => {
  currentNoteID = parseInt(args)
  if (!win.getTitle().startsWith("* ")) win.setTitle("* " + win.getTitle())
})

ipcMain.on('about', () => {
  let about = new BrowserWindow({
    parent: win,
    width: 480,
    height: 320,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    frame: false,
    title: "About - MarkDownald"
  })
  about.loadFile('res/about.html');
  about.on('blur', () => {
    about.close();
  })
})