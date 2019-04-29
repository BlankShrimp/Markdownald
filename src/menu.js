const { clipboard, remote } = require('electron');

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
        }
    }, {
        label: 'Redo',
        accelerator: 'Shift+Ctrl+Z',
        click: (item, focusedWindow) => {
            editor.redo();
        }
    }, { 
        type: 'separator' 
    }, {
        label: 'Cut',
        accelerator: 'Ctrl+X',
        click: (item, focusedWindow) => {
            cut();
        }
    }, {
        label: 'Copy',
        accelerator: 'Ctrl+C',
        click: (item, focusedWindow) => {
            copy();
        }
    }, {
        label: 'Paste',
        accelerator: 'Ctrl+V',
        click: (item, focusedWindow) => {
            editor.replaceSelection(clipboard.readText());
        }
    }, {
        label: 'Delete',
        click: (item, focusedWindow) => {
            editor.replaceSelection('');
        }
    },
    { type: 'separator' }, {
        label: 'Bold',
        accelerator: 'Ctrl+B',
        click: (item, focusedWindow) => {
            boldEditor();
        }
    }, {
        label: 'Italic',
        accelerator: 'Ctrl+I',
        click: (item, focusedWindow) => {
            italicEditor();
        }
    }, { 
        type: 'separator' 
    }, { 
        label: 'selectAll', 
        accelerator: 'Ctrl+A',
        click: (item, focusedWindow) => {
            editor.execCommand('selectAll');
        }
    }]
}, {
    label: 'View',
    submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
    ]
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