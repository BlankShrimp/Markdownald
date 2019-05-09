const $ = require('jquery');
const $input = $('#input');
const rendered = $('#main')[0];
const showdown = require('showdown');
const { ipcRenderer } = require('electron')

var saved = false
//create editor object
var editor = CodeMirror.fromTextArea($input[0], {
    mode: "markdown",
    lineNumbers: true,
    theme: "monokai",
    cursorHeight: 0.85,
    lineWrapping:true,
    styleActiveLine: true,
    matchBrackets: true,
    autoCloseBrackets: true,
    extraKeys: {
        Enter: function() {
            var flag1 = true;
            var flag2 = true;
            var thisLine = editor.getLine(editor.getCursor().line);
            if (thisLine.startsWith("|") && thisLine.endsWith("|")) { //auto complete: table
                var count = thisLine.split("|").length;
                if (count <= 2) {
                    flag1= false
                    flag2= false
                }
                else if (editor.getCursor().line != editor.lastLine()) {
                    flag1 = false;
                    var nextLine = editor.getLine(editor.getCursor().line + 1).split("|");
                    for (var i= 0; i < nextLine.length; i++) {
                        var period = nextLine[i];
                        if (period.search("-----") > -1) {
                            flag2 = false
                            break;
                        }
                    }
                }
                var previousLine = "a"
                if (editor.getCursor().line > 1) {
                    previousLine = editor.getLine(editor.getCursor().line - 1);
                }
                if (previousLine.startsWith("|")) {
                    flag1 = false
                    flag2 = false
                }
                if (flag1 || flag2) {
                    tableSeparator = "|"
                    for (let i = 2; i < count; i++) {
                        tableSeparator += "-----|";
                    }
                    editor.replaceSelection("\r\n" + tableSeparator + "\r\n|");
                } else {
                    editor.replaceSelection("\r\n");
                }
            } else if (thisLine.startsWith("* ")) { //auto complete: list
                if (thisLine.length == 2)
                    editor.replaceRange("\r\n", {line: editor.getCursor().line, ch: 0}, {line: editor.getCursor().line, ch: 2});
                else
                editor.replaceSelection("\r\n* ");
            } else if (thisLine.split(". ")[0].search(/\d/) == 0) { //auto complete: ordered list
                var period = thisLine.split(". ");
                var newNumber = parseInt(period[0]) + 1
                if (period.length == 2 && period[1] == "")
                    editor.replaceRange("\r\n", {line: editor.getCursor().line, ch: 0}, {line: editor.getCursor().line + 1, ch: 0});
                else
                    editor.replaceSelection("\r\n" + newNumber + ". ");
            } else {
                editor.replaceSelection("\r\n");
            }
        }
    }
});

//create rendered object
var converter = new showdown.Converter({
    tables: true,
    strikethrough: true,
    tasklists: true
});

//call render when sth changed in editor
editor.on("change", function(editor, change) {
    text = editor.getValue();
    html = converter.makeHtml(text);
    insertPosition = document.getElementById("main")
    insertPosition.innerHTML = html;

    ipcRenderer.send('change')
    saved = false
})

//set simultaneous scroll
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
};

ipcRenderer.on('content', (event, arg) => {
    editor.setValue(arg);
})

ipcRenderer.on('saveNow', () => {
    saved = true
})