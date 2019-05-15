
const { app, BrowserWindow, ipcMain } = require('electron')
const pkg = require('../package.json')
const path = require('path')
const sqlite = require('sqlite')
const dbPromise = sqlite.open('data/markdownald.db', { Promise });
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
app.on('ready', async () => {
  try {
    const db = await dbPromise;
    await Promise.resolve(db.run(`
            create table if not exists Support(
                Name varchar(255) PRIMARY KEY,
                Content varchar(255)
            );`))
    await Promise.resolve(db.run(`
            create table if not exists Persons (
                userid varchar(20) PRIMARY KEY,
                nickname varchar(20) NOT NULL,
                passwd varchar(20) NOT NULL
            );`))

    await Promise.resolve(db.run(`
            create table if not exists Directories (
                folderid int(8) PRIMARY KEY,
                foldername varchar(255) NOT NULL,
                parentid int(8) NOT NULL,
                trace varchar(20) NOT NULL
            );`))
    await Promise.resolve(db.run(`
            create table if not exists Notes(
                noteid int(8) PRIMARY KEY, 
                title varchar(255) NOT NULL,
                folderid int(8),
                value mediumtext,
                ModifyTime DATETIME,
                ViewTime DATETIME,
                upload boolean DEFAULT 0
            );`))
    await Promise.resolve(db.run(`insert OR ignore into Support values("MaxNote",0)`))
    await Promise.resolve(db.run(`insert OR ignore into Support values("MaxFolder",0)`))
  } catch (err) {
  }
})

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

ipcMain.on('savenow', (event, ...args) => {
  if (win.getTitle().startsWith("* ") && currentNoteID != 0) {
    win.setTitle(win.getTitle().substr(2));
    win.webContents.send('saveNow')
  }
})

ipcMain.on('opennew', (event, ...args) => {
  win.setTitle(args[0] + " - MarkDownald")
  currentNoteID = parseInt(args[1])
  win.loadFile('res/editor.html')
  win.webContents.on('did-finish-load', () => {
    win.webContents.send('opennew', currentNoteID)
  })
})

ipcMain.on('openMDT', (event, ...args) => {
  currentNoteID = 0
  win.webContents.send('openMDT');
})

ipcMain.on('newfolder', (event, ...args) => {
  currentNoteID = parseInt(args[1])
  win.loadFile('res/editor.html')
  win.webContents.on('did-finish-load', () => {
    win.webContents.send('opennewfolder', args[0], currentNoteID)
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