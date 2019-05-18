const $ = require('jquery');
const showdown = require('showdown');
const { ipcRenderer } = require('electron');
const $input = $('#input');
const rendered = $('#main')[0];

const dirs_butt = $('#list-btt')[0];
const dirs_icon  =$('#listicon')[0];
const account_butt = $('#account-btt')[0];
const add_butt = $('#add-btt')[0];
const del_butt = $('#del-btt')[0];
const sync_butt = $('#sync-btt')[0];


const addnote_butt = $('#addnote')[0];
const addfolder_butt = $('#addfolder')[0];

const cancel_addnote = $('#canceladdnote')[0];
const cancel_editnote = $('#canceleditnote')[0];
const cancel_addfolder = $('#canceladdfolder')[0];

const reg_butt = $('#registry')[0];
const signin_butt = $('#login')[0];
const cus_butt = $('#custimize')[0];
const stat = $('#account-stat')[0];

const cancel_reg = $('#cancelreg')[0];
const cancel_login = $('#cancellogin')[0];
const cancel_cus = $('#cancelcus')[0];

const closed_folder = 'M880 298.4H521L403.7 186.2c-1.5-1.4-3.5-2.2-5.5-2.2H144c-17.7 0-32 14.3-32 32v592c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V330.4c0-17.7-14.3-32-32-32zM840 768H184V256h188.5l119.6 114.4H840V768z';
const opened_folder = 'M928 444H820V330.4c0-17.7-14.3-32-32-32H473L355.7 186.2c-1.5-1.4-3.5-2.2-5.5-2.2H96c-17.7 0-32 14.3-32 32v592c0 17.7 14.3 32 32 32h698c13 0 24.8-7.9 29.7-20l134-332c1.5-3.8 2.3-7.9 2.3-12 0-17.7-14.3-32-32-32zM136 256h188.5l119.6 114.4H748V444H238c-13 0-24.8 7.9-29.7 20L136 643.2V256z m635.3 512H159l103.3-256h612.4L771.3 768z';

//flags
var saved = false
var logined = false
var atRegPage = false
var atLoginPage = false
var atCustomPage = false

var atAddnotePage = false
var atAddfolderPage = false

var delButtonDisplayed = false

var currentNoteID = 0
var currentEditNote = 0
var account = "zhende "
var nickname
//create editor object
var editor = CodeMirror.fromTextArea($input[0], {
    mode: "markdown",
    lineNumbers: true,
    theme: "monokai",
    cursorHeight: 0.85,
    lineWrapping: true,
    styleActiveLine: true,
    matchBrackets: true,
    autoCloseBrackets: true,
    extraKeys: {
        Enter: function () {
            var flag1 = true;
            var flag2 = true;
            var thisLine = editor.getLine(editor.getCursor().line);
            if (thisLine.startsWith("|") && thisLine.endsWith("|")) { //auto complete: table
                var count = thisLine.split("|").length;
                if (count <= 2) {
                    flag1 = false
                    flag2 = false
                }
                else if (editor.getCursor().line != editor.lastLine()) {
                    flag1 = false;
                    var nextLine = editor.getLine(editor.getCursor().line + 1).split("|");
                    for (var i = 0; i < nextLine.length; i++) {
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
                    editor.replaceRange("\r\n", { line: editor.getCursor().line, ch: 0 }, { line: editor.getCursor().line, ch: 2 });
                else
                    editor.replaceSelection("\r\n* ");
            } else if (thisLine.split(". ")[0].search(/\d/) == 0) { //auto complete: ordered list
                var period = thisLine.split(". ");
                var newNumber = parseInt(period[0]) + 1
                if (period.length == 2 && period[1] == "")
                    editor.replaceRange("\r\n", { line: editor.getCursor().line, ch: 0 }, { line: editor.getCursor().line + 1, ch: 0 });
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
    tasklists: true,
    underline: true,
    emoji: true,
    simpleLineBreaks: true
});

//call render when sth changed in editor
editor.on("change", function (editor, change) {
    text = editor.getValue();
    html = converter.makeHtml(text);
    insertPosition = document.getElementById("main")
    insertPosition.innerHTML = html;

    ipcRenderer.send('change', currentNoteID)
    saved = false
    if (logined) {
        stat.setAttribute('fill', 'orange');
        account_butt.setAttribute('title', 'Logined - Not saved.')
    }
    else account_butt.setAttribute('title', 'Offline - Not saved.')
})

//set simultaneous scroll
var timer = null;
editor.on("scroll", function (editor) {
    rendered.removeAttribute("onScroll");
    var scale = (editor.getScrollerElement().scrollHeight - editor.getScrollerElement().clientHeight)
        / (rendered.scrollHeight - rendered.clientHeight)
    rendered.scrollTop = (editor.getScrollInfo().top / scale);
    clearTimeout(timer);
    timer = setTimeout(function () {
        rendered.setAttribute("onScroll", 'scrollRendered();');
    }, 300)
})

function scrollRendered() {
    var scale = (editor.getScrollerElement().scrollHeight - editor.getScrollerElement().clientHeight)
        / (rendered.scrollHeight - rendered.clientHeight);
    clearTimeout(timer);
    timer = setTimeout(function () {
        editor.getScrollerElement().scrollTop = (rendered.scrollTop * scale);
    }, 50)
};
rendered.setAttribute("onScroll", "scrollRendered();");

ipcRenderer.on('content', (event, arg) => {
    editor.setValue(arg);
})

ipcRenderer.on('opennew', (event, arg) => {
    currentNoteID = parseInt(arg)
})

ipcRenderer.on('opennewfolder', (event, ...arg) => {
    editor.setValue(arg[0]);
    currentNoteID = parseInt(arg[1]);
})


function toggleNavigation() {
    if ($('body').hasClass('display-nav')) {
        dirs_icon.setAttribute('d', closed_folder);
        $('body').removeClass('display-nav');
        dirs_butt.removeAttribute('style');
    } else {
        dirs_icon.setAttribute('d', opened_folder);
        dirs_butt.setAttribute('style', 'background: #f0f0f0');
        $('body').addClass('display-nav');
    }
}
dirs_butt.setAttribute('onClick', 'toggleNavigation();');

function toggleAddchoosePane(){
    if(atAddnotePage){
        $('#addnotepane')[0].setAttribute('style', 'visibility:hidden');
        atAddnotePage = false
        $('#addchoosepane').removeClass('display-acc');
        add_butt.removeAttribute('style');
    }else if (atAddfolderPage) {
        $('#addfolderpane')[0].setAttribute('style', 'visibility:hidden');
        atAddfolderPage = false
        $('#addchoosepane').removeClass('display-acc');
        add_butt.removeAttribute('style');
    }else{
        if ($('#addchoosepane').hasClass('display-acc')) {
                $('#addchoosepane')[0].setAttribute('style', 'visibility:hidden');
                $('#addchoosepane').removeClass('display-acc');
                add_butt.removeAttribute('style');
            }else{
                $('#addchoosepane').addClass('display-acc');
                $('#addchoosepane')[0].setAttribute('style', 'visibility:visible');
                add_butt.setAttribute('style', 'background: #f0f0f0');
            }
    }
}
add_butt.setAttribute('onClick', 'toggleAddchoosePane();');

function sync(){
    ipcRenderer.send('savenow')
}
sync_butt.setAttribute('onClick', 'sync();');

function addNoteButton() {
    $('#addchoosepane')[0].setAttribute('style', 'visibility:hidden');
    $('#addnotepane')[0].setAttribute('style', 'visibility:visible');
    atAddnotePage = true
}
addnote_butt.setAttribute('onClick', 'addNoteButton();');

function canceladdNoteButton() {
    $('#addnotepane')[0].setAttribute('style', 'visibility:hidden');
    $('#addchoosepane')[0].setAttribute('style', 'visibility:visible');
    atAddnotePage = false
}
cancel_addnote.setAttribute('onClick', 'canceladdNoteButton();');

function cancelEditNoteButton() {
    $('#editnotepane')[0].setAttribute('style', 'visibility:hidden; top: calc(50% - 150px); left: 20px;');
    currentEditNote = 0
}
cancel_editnote.setAttribute('onClick', 'cancelEditNoteButton();');


function addFolderButton(){
    $('#addchoosepane')[0].setAttribute('style', 'visibility:hidden');
    $('#addfolderpane')[0].setAttribute('style', 'visibility:visible');
    atAddfolderPage = true
}
addfolder_butt.setAttribute('onClick', 'addFolderButton();');

function canceladdFolderButton() {
    $('#addfolderpane')[0].setAttribute('style', 'visibility:hidden');
    $('#addchoosepane')[0].setAttribute('style', 'visibility:visible');
    atAddfolderPage = false
}
cancel_addfolder.setAttribute('onClick', 'canceladdFolderButton();');

function toggleDelButton() {
    if (delButtonDisplayed) {
        $('.delbutts').attr('style', 'visibility:hidden;');
        $('.editbutts').attr('style', 'visibility:hidden;');
        del_butt.removeAttribute('style')
        delButtonDisplayed = false
    } else {
        $('.delbutts').attr('style', 'visibility:visible; margin-left: 5px; display: inline-block; vertical-align: middle; height:15px; width:15px; background: url(icons/delete.png) no-repeat;');
        $('.editbutts').attr('style', 'visibility:visible; margin-left: 5px; display: inline-block; vertical-align: middle; height:15px; width:15px; background: url(icons/edit-square.png) no-repeat;');
        del_butt.setAttribute('style', 'background: #f0f0f0');
        delButtonDisplayed = true
    }
}
del_butt.setAttribute('onClick', 'toggleDelButton();');




function toggleAccountPane() {
    if (logined) {
        if ($('#accountstatpane').hasClass('display-acc')) {
            $('#accountstatpane')[0].setAttribute('style', 'visibility:hidden');
            $('#accountstatpane').removeClass('display-acc');
            account_butt.removeAttribute('style');
        } else {//这里的逻辑需要小心
            $('#accountstatpane').addClass('display-acc');
            $('#accountstatpane')[0].setAttribute('style', 'visibility:visible');
            account_butt.setAttribute('style', 'background: #f0f0f0');
        }
    } else if (atRegPage) {
        $('#regpane')[0].setAttribute('style', 'visibility:hidden');
        atRegPage = false
        $('#welcomepane').removeClass('display-acc');
        account_butt.removeAttribute('style');
    } else if (atLoginPage) {
        $('#loginpane')[0].setAttribute('style', 'visibility:hidden');
        atLoginPage = false
        $('#welcomepane').removeClass('display-acc');
        account_butt.removeAttribute('style');
    } else if (atCustomPage) {
        $('#customizepane')[0].setAttribute('style', 'visibility:hidden');
        atCustomPage = false
        $('#welcomepane').removeClass('display-acc');
        account_butt.removeAttribute('style');
    } else {
        if ($('#welcomepane').hasClass('display-acc')) {
            $('#welcomepane')[0].setAttribute('style', 'visibility:hidden');
            $('#welcomepane').removeClass('display-acc');
            account_butt.removeAttribute('style');
        } else {
            $('#welcomepane').addClass('display-acc');
            $('#welcomepane')[0].setAttribute('style', 'visibility:visible');
            account_butt.setAttribute('style', 'background: #f0f0f0');
        }
    }
}
account_butt.setAttribute('onClick', 'toggleAccountPane();');

function registryButton() {
    $('#welcomepane')[0].setAttribute('style', 'visibility:hidden');
    $('#regpane')[0].setAttribute('style', 'visibility:visible');
    atRegPage = true
}
reg_butt.setAttribute('onClick', 'registryButton();');

function cancelRegButton() {
    $('#regpane')[0].setAttribute('style', 'visibility:hidden');
    $('#welcomepane')[0].setAttribute('style', 'visibility:visible');
    atRegPage = false
}
cancel_reg.setAttribute('onClick', 'cancelRegButton();');

function signinButton() {
    $('#welcomepane')[0].setAttribute('style', 'visibility:hidden');
    $('#loginpane')[0].setAttribute('style', 'visibility:visible');
    atLoginPage = true
}
signin_butt.setAttribute('onClick', 'signinButton();');

function cancelSigninButton() {
    $('#loginpane')[0].setAttribute('style', 'visibility:hidden');
    $('#welcomepane')[0].setAttribute('style', 'visibility:visible');
    atLoginPage = false
}
cancel_login.setAttribute('onClick', 'cancelSigninButton();');

function customButton() {
    $('#welcomepane')[0].setAttribute('style', 'visibility:hidden');
    $('#customizepane')[0].setAttribute('style', 'visibility:visible');
    atCustomPage = true
}
cus_butt.setAttribute('onClick', 'customButton();');

function cancelCusButton() {
    $('#customizepane')[0].setAttribute('style', 'visibility:hidden');
    $('#welcomepane')[0].setAttribute('style', 'visibility:visible');
    atCustomPage = false
}
cancel_cus.setAttribute('onClick', 'cancelCusButton();');