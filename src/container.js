const $ = require('jquery');
const $input = $('#input');

var editor = CodeMirror.fromTextArea($input[0], {
    mode: "markdown",
    lineNumbers: true,
    theme: "monokai",
    cursorHeight: 0.85,
    lineWrapping:true
});