const fs = require('fs');
const client = require('../src/client')
const sqlite = require('sqlite')

const dbPromise = sqlite.open('data/markdownald.db', { Promise });
$(document).ready(async () => {
    try {
        const db = await dbPromise;
        var folderJson = await Promise.resolve(db.all(`select * from Directories`))
        for (var i = 0; i < folderJson.length; i++) {
            $('#selectfolder').append(`<option value="${folderJson[i].folderid}">${folderJson[i].foldername}</option>`)
            $('#selectparent').append(`<option value="${folderJson[i].folderid}">${folderJson[i].foldername}</option>`)
            $('#f' + folderJson[i].parentid).append('<li><div class="file is-dir"><span class="fname">'
                + folderJson[i].foldername + '</span><span class="delbutts" id="df' + folderJson[i].folderid +
                '" style="visibility:hidden; margin-left: 5px; display: inline-block; height:15px; width:15px; background: url(icons/delete.png) no-repeat;"></span><span class="editbutts" id="ef' + folderJson[i].folderid +
                '" style="visibility:hidden; margin-left: 5px; display: inline-block; height:15px; width:15px; background: url(icons/edit-square.png) no-repeat;"></span></div><ul id="f' + folderJson[i].folderid + '"></ul></li>');
        }

        var notesJson = await Promise.resolve(db.all(`select * from Notes`))
        for (var i = 0; i < notesJson.length; i++) {
            $('#f' + notesJson[i].folderid).append('<li id="n' + notesJson[i].noteid + '"><div class="file is-file"><span class="notename">'
                + notesJson[i].title + '</span><span class="delbutts" id="dn' + notesJson[i].noteid +
                '" style="visibility:hidden; margin-left: 5px; display: inline-block; height:15px; width:15px; background: url(icons/delete.png) no-repeat;"></span><span class="editbutts" id="en' + notesJson[i].noteid +
                '" style="visibility:hidden; margin-left: 5px; display: inline-block; height:15px; width:15px; background: url(icons/edit-square.png) no-repeat;"></span></div></li>')
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

        $(document).on('click', '.delbutts', async function () {
            mode = $(this).attr('id').slice(1, 2)
            id = parseInt($(this).attr('id').slice(2))
            if (mode == "f") {
                deleteFolder(db, id)
                $(this).parent().parent().remove()
            } else {
                await Promise.resolve(db.run(`delete from Notes where noteid=${id}`))
                $(this).parent().parent().remove()
                //这里有个bug，如果用户删除的是正在编辑的note，程序会崩溃。但是我实在是懒得改了
            }
        });

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
            await Promise.resolve(db.get(`update Support set Content="${currentID}" where Name = "MaxNote"`))
            await Promise.resolve(
                db.run(`insert into Notes (noteid, title, folderid, value, ModifyTime, ViewTime, upload) values(${currentID},"${notename}",${folderid},"",datetime('now','localtime'),datetime('now','localtime'), 0)`))
            currentNoteID = currentID
            ipcRenderer.send('opennew', notename, currentID)
        });

        $(document).on('click', '#confirmaddfolder', async function () {
            var parentid = parseInt($('#selectparent').val())
            var foldername = $('#addfolderpane input').val()
            var temp = await Promise.resolve(db.get(`select Content from Support where Name = "MaxFolder"`))
            var currentID = parseInt(temp.Content) + 1
            await Promise.resolve(db.get(`update Support set Content="${currentID}" where Name = "MaxFolder"`))
            await Promise.resolve(
                db.run(`insert into Directories (folderid, foldername, parentid, trace) values(${currentID},"${foldername}",${parentid},"")`))
            ipcRenderer.send('newfolder', editor.getValue(), currentNoteID)
        });

        $('#signup').click((event) => {
            if (this == event.target) {
                var account = $(this).parent().children('input [placeholder="ID"]')[0].val();
                alert(account)
            }
        })
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

async function deleteFolder(db, id) {
    alert(id)
    var childrenList = await Promise.resolve(db.all(`select folderid from Directories where parentid=${id}`))
    await Promise.resolve(db.run(`delete from Directories where folderid=${id}`))
    await Promise.resolve(db.run(`delete from Notes where folderid=${id}`))
    for (var i = 0; i < childrenList.length; i++) {
        deleteFolder(db, parseInt(childrenList[i].folderid))
    }
}