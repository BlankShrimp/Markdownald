const $ = require('jquery');
const $input = $('#input');
const rendered = $('#main')[0];
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

var timer = null;
editor.on("scroll", function(editor) {
    rendered.removeAttribute("onScroll");
    var scale = (editor.getScrollerElement().scrollHeight - editor.getScrollerElement().clientHeight) 
    / (rendered.scrollHeight - rendered.clientHeight)
    rendered.scrollTop = (editor.getScrollInfo().top / scale );
    clearTimeout(timer);
    timer = setTimeout(function() {
        rendered.setAttribute("onScroll", 'scrollRendered();');
    }, 300)
})

rendered.setAttribute("onScroll", "scrollRendered();");

function scrollRendered() {
    var scale = (editor.getScrollerElement().scrollHeight - editor.getScrollerElement().clientHeight) 
    / (rendered.scrollHeight - rendered.clientHeight);
    clearTimeout(timer);
    timer = setTimeout(function() {
        editor.getScrollerElement().scrollTop = (rendered.scrollTop * scale);
    }, 50)
}
