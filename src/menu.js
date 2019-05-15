const { clipboard, remote } = require('electron');

let win
var editor = $('.CodeMirror')[0].CodeMirror;
let menuTemplate = [{
    label: 'File',
    submenu: [{
        label: 'exit',
        accelerator: 'Alt+F4',
        role: 'quit'
    }]
}, {
    label: 'Edit',
    submenu: [{
        label: 'Undo',
        accelerator: 'Ctrl+Z',
        click: (item, focusedWindow) => {
            editor.undo();
            editor.focus();
        }
    }, {
        label: 'Redo',
        accelerator: 'Shift+Ctrl+Z',
        click: (item, focusedWindow) => {
            editor.redo();
            editor.focus();
        }
    }, {
        type: 'separator'
    }, {
        label: 'Cut',
        accelerator: 'Ctrl+X',
        click: (item, focusedWindow) => {
            cut();
            editor.focus();
        }
    }, {
        label: 'Copy',
        accelerator: 'Ctrl+C',
        click: (item, focusedWindow) => {
            copy();
            editor.focus();
        }
    }, {
        label: 'Paste',
        accelerator: 'Ctrl+V',
        click: (item, focusedWindow) => {
            editor.replaceSelection(clipboard.readText());
            editor.focus();
        }
    }, {
        label: 'Delete',
        click: (item, focusedWindow) => {
            editor.replaceSelection('');
            editor.focus();
        }
    }, {
        type: 'separator'
    }, {
        label: 'Bold',
        accelerator: 'Ctrl+B',
        click: (item, focusedWindow) => {
            boldEditor();
            editor.focus();
        }
    }, {
        label: 'Italic',
        accelerator: 'Ctrl+I',
        click: (item, focusedWindow) => {
            italicEditor();
            editor.focus();
        }
    }, {
        type: 'separator'
    }, {
        label: 'selectAll',
        accelerator: 'Ctrl+A',
        click: (item, focusedWindow) => {
            editor.execCommand('selectAll');
            editor.focus();
        }
    }]
}, {
    label: 'View',
    submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
    ]
}, {
    role: 'Help',
    submenu: [{
        label: 'Markdown Tutorial'
    }, {
        label: 'Server Build Guide'
    }, {
        label: "What's new"
    }, {
        type: 'separator'
    }, {
        label: 'About',
        click: (item, focusedWindow) => {
            ipcRenderer.send('about')
        }
    }]
}];

var menu = remote.Menu.buildFromTemplate(menuTemplate);
remote.Menu.setApplicationMenu(menu)

function cut() {
    text = editor.getSelection();
    if (text) {
        clipboard.writeText(text);
        editor.replaceSelection('');
    }
}

function copy() {
    text = editor.getSelection();
    if (text) {
        clipboard.writeText(text);
    }
}

function boldEditor() {
    text = editor.getSelection();
    if (text) {
        str = '**' + text + '**';
        editor.replaceSelection(str);
    } else {
        editor.replaceSelection('****');
        var { line, ch } = editor.getCursor();
        editor.setCursor(line, ch - 2);
    }
}

function italicEditor() {
    text = editor.getSelection();
    if (text) {
        str = '*' + text + '*';
        editor.replaceSelection(str);
    } else {
        editor.replaceSelection('**');
        var { line, ch } = editor.getCursor();
        editor.setCursor(line, ch - 1);
    }
}