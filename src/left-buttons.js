const fs = require('fs');
const client = require('../src/client/client')
const sqlite = require('sqlite')

const dbPromise = sqlite.open('data/markdownald.db', { Promise });
$(document).ready(async () => {
    try {
        const db = await dbPromise;
        var folderJson = await Promise.resolve(db.all(`select * from Directories`))
        for (var i = 0; i < folderJson.length; i++) {
            $('#selectfolder').append(`<option value="${folderJson[i].folderid}">${folderJson[i].foldername}</option>`)
            $('#f' + folderJson[i].parentid).append('<li><div class="file is-dir"><span class="fname">'
                + folderJson[i].foldername + '</span><span class="delbutts" id="df' + folderJson[i].folderid +
                '" style="visibility:hidden; margin-left: 5px; display: inline-block; height:15px; width:15px; background: url(icons/delete.png) no-repeat;"></span></div><ul id="f' + folderJson[i].folderid + '"></ul></li>');
        }

        var notesJson = await Promise.resolve(db.all(`select * from Notes`))
        for (var i = 0; i < notesJson.length; i++) {
            $('#f' + notesJson[i].folderid).append('<li id="n' + notesJson[i].noteid + '"><div class="file is-file"><span class="notename">'
                + notesJson[i].title + '</span><span class="delbutts" id="dn' + notesJson[i].noteid +
                '" style="visibility:hidden; margin-left: 5px; display: inline-block; height:15px; width:15px; background: url(icons/delete.png) no-repeat;"></span></div></li>')
        }

        $('li ul').hide();
        $('li:not(:has(ul))')
            .css({ 'cursor': 'default', 'list-style-image': 'none' });
        $('li:has(ul)')
            .css({ 'cursor': 'pointer', 'list-style-image': 'url(../res/icons/caret-right.png)' });
        $('.is-dir').click(function (event) {
            if (this == event.target) {
                if ($(this).parent().children().is(':hidden')) {
                    $(this).parent()
                        .css('list-style-image', 'url(../res/icons/caret-down.png)')
                        .children().show();
                }
                else {
                    $(this).parent()
                        .css('list-style-image', 'url(../res/icons/caret-right.png)')
                        .children().hide();
                    $(this).show();
                }
            }
        })
        $('.fname').click(function (event) {
            if (this == event.target) {
                if ($(this).parent().parent().children().is(':hidden')) {
                    $(this).parent().parent()
                        .css('list-style-image', 'url(../res/icons/caret-down.png)')
                        .children().show();
                }
                else {
                    $(this).parent().parent()
                        .css('list-style-image', 'url(../res/icons/caret-right.png)')
                        .children().hide();
                    $(this).parent().show();
                }
            }
        })

        $('.delbutts').click((event) => {
            if (this == event.target) {
                mode = $(this).attr('id').slice(1, 2)
                id = parseInt($(this).attr('id').slice(2))
                if (mode == "f") {
                    db.deleteFolder(id)
                    $(this).parent().parent().remove()
                } else {
                    db.deleteNote(id)
                    $(this).parent().parent().remove()
                }
            }
        })

        $(document).on('click', '.is-file', async function () {
            var value = await Promise.resolve(db.get('select title, value from Notes where noteid=?', $(this).parent().attr('id').slice(1)))
            currentNoteID = parseInt($(this).parent().attr('id').slice(1))
            ipcRenderer.send('open', value.title, value.value)
        });

        $(document).on('click', '#confirmaddnote', async function () {
            var folderid = parseInt($('#selectfolder').val())
            var notename = $('#addnotepane input').val()
            var temp = await Promise.resolve(db.get(`select Content from Support where Name = "MaxNote"`))
            var currentID = parseInt(temp.Content) + 1
            await Promise.resolve(db.get(`update Support set Content="${currentID}"`))
            await Promise.resolve(
                db.run(`insert into Notes (noteid, title, folderid, value, ModifyTime, ViewTime, upload) values(${currentID},"${notename}",${folderid},"",datetime('now','localtime'),datetime('now','localtime'), 0)`))
            currentNoteID = currentID
            ipcRenderer.send('opennew', notename, currentID)
        });
    } catch (err) {
    }
})


ipcRenderer.on('saveNow', async () => {
    if (currentNoteID != 0) {
        const db = await dbPromise;
        await db.run(`update Notes set value= ? ,ModifyTime = datetime('now','localtime') where noteid = ?`, editor.getValue(), currentNoteID);
        saved = true
        stat.setAttribute('fill', 'green');
    }
})