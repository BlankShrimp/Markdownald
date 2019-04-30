const $ = require('jquery');
const $input = $('#input');
const rendered = $('#main')[0];
const showdown = require('showdown');

//create editor object
var editor = CodeMirror.fromTextArea($input[0], {
    mode: "markdown",
    lineNumbers: true,
    theme: "monokai",
    cursorHeight: 0.85,
    lineWrapping:true,
    extraKeys: {
        //auto complete: table
        Enter: function() {
            var flag1 = true;
            var flag2 = true;
            var thisLine = editor.getLine(editor.getCursor().line);
            if (thisLine.startsWith("|") && thisLine.endsWith("|")) {
                var count = thisLine.split("|").length;
                if (editor.getCursor().line != editor.lastLine()) {
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
                if (flag1 || flag2) {
                    tableSeparator = "|"
                    for (let i = 2; i < count; i++) {
                        tableSeparator += "-----|";
                    }
                    editor.replaceSelection("\r\n" + tableSeparator);
                }
            }
            editor.replaceSelection("\r\n");
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

//auto complete: table