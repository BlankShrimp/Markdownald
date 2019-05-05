const {ipcRenderer} = require('electron');
const $ = require('jquery');

var newNote = $("#newnote")[0];

newNote.addEventListener("click", function() {
    ipcRenderer.send("open", "Untitled Note", "");
});