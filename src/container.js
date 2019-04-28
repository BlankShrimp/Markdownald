const $ = require('jquery');
const $input = $('#input');
const showdown = require('showdown');

var editor = CodeMirror.fromTextArea($input[0], {
    mode: "markdown",
    lineNumbers: true,
    theme: "monokai",
    cursorHeight: 0.85,
    lineWrapping:true
});

var converter = new showdown.Converter({
    tables: true,
    strikethrough: true,
    tasklists: true
});

editor.on("change", function(editor, change) {
    text = editor.getValue();
    html = converter.makeHtml(text);
    insertPosition = document.getElementById("main")
    insertPosition.innerHTML = html;
})