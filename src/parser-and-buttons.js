const fs = require('fs');
const sqlite = require('sqlite');
const dbPromise = sqlite.open('data/markdownald.db', { Promise });
const net = require('net');
var db
$(document).ready(async () => {
    try {
        db = await dbPromise;
        var acc = await Promise.resolve(db.get(`select * from Persons`))
        if (acc) {
            logined = true
            account = acc.userid
            nickname = acc.nickname
            $('#accountstatpane h1').html(account)
        } else {
            stat.setAttribute('fill', 'grey');
            if (saved) account_butt.setAttribute('title', 'Offline - Saved.')
            else {
                account_butt.setAttribute('title', 'Offline - Not saved.')
            }
        }

        var folderJson = await Promise.resolve(db.all(`select * from Directories`))
        for (var i = 0; i < folderJson.length; i++) {
            $('#selectfolder').append(`<option value="${folderJson[i].folderid}">${folderJson[i].foldername}</option>`)
            $('#selectparent').append(`<option value="${folderJson[i].folderid}">${folderJson[i].foldername}</option>`)
            $('#editnotepane select').append(`<option value="${folderJson[i].folderid}">${folderJson[i].foldername}</option>`)
            $('#f' + folderJson[i].parentid).append('<li><div class="file is-dir"><span class="fname">'
                + folderJson[i].foldername + '</span><span title="Delete" class="delbutts" id="df' + folderJson[i].folderid +
                '" style="visibility:hidden; margin-left: 5px; display: inline-block; height:15px; width:15px; background: url(icons/delete.png) no-repeat;"></span><span title="Edit" class="editbutts" id="ef' + folderJson[i].folderid +
                '" style="visibility:hidden; margin-left: 5px; display: inline-block; height:15px; width:15px; background: url(icons/edit-square.png) no-repeat;"></span></div><ul id="f' + folderJson[i].folderid + '"></ul></li>');
        }

        var notesJson = await Promise.resolve(db.all(`select * from Notes`))
        for (var i = 0; i < notesJson.length; i++) {
            $('#f' + notesJson[i].folderid).append('<li id="n' + notesJson[i].noteid + '"><div class="file is-file"><span class="notename">'
                + notesJson[i].title + '</span><span title="Delete" class="delbutts" id="dn' + notesJson[i].noteid +
                '" style="visibility:hidden; margin-left: 5px; display: inline-block; height:15px; width:15px; background: url(icons/delete.png) no-repeat;"></span><span title="Edit" class="editbutts" id="en' + notesJson[i].noteid +
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
            var mode = $(this).attr('id').slice(1, 2)
            var id = parseInt($(this).attr('id').slice(2))
            if (mode == "f") {
                deleteFolder(db, id)
                $(this).parent().parent().remove()
            } else {
                await Promise.resolve(db.run(`delete from Notes where noteid=${id}`))
                $(this).parent().parent().remove()
                //这里有个bug，如果用户删除的是正在编辑的note，程序会崩溃。但是我实在是懒得改了
            }
        });

        $(document).on('click', '.editbutts', async function () {
            var mode = $(this).attr('id').slice(1, 2)
            if (mode == "n") {
                currentEditNote = parseInt($(this).attr('id').slice(2))
                // var folderid = $(this).parent().parent().attr('id')
                // alert(folderid)
                $('#editnotepane')[0].setAttribute("style", "visibility:visible; top: calc(50% - 150px); left: 20px;")
                // 这里本来要做默认选中当前文件夹的，但是怎么都获取不到父元素的id，很怪
                // $('#editnotepane select option[value="4"]')[0].setAttribute('selected', 'selected');
            } else {
                currentEditFolder = parseInt($(this).attr('id').slice(2))
                $('#editnotepane')[0].setAttribute("style", "visibility:visible; top: calc(50% - 150px); left: 20px;")
            }
        });

        $(document).on('click', '#confirmeditnote', async function () {
            if (currentEditNote != 0) {
                var folderid = parseInt($('#editnotepane select').val())
                var notename = $('#editnotepane input').val()
                db.run(`update Notes set folderid=${folderid}, title="${notename}" where noteid=${currentEditNote}`)
                currentEditNote = 0
                //这里没有刷新
            } else {
                var folderid = parseInt($('#editnotepane select').val())
                var foldername = $('#editnotepane input').val()
                db.run(`update Directories set parentid=${folderid}, foldername="${foldername}" where folderid=${currentEditFolder};`)
                currentEditFolder = 0
            }
            $('#editnotepane input').val("")
            $('#editnotepane')[0].setAttribute("style", "visibility:hidden;")
        });

        $(document).on('click', '.is-file', async function () {
            var value = await Promise.resolve(db.get('select title, value from Notes where noteid=?', $(this).parent().attr('id').slice(1)))
            currentNoteID = parseInt($(this).parent().attr('id').slice(1))
            ipcRenderer.send('open', value.title, value.value)
            //这里有一个bug，已经修改的note不会被保存
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

        $(document).on('click', '#signup', async function () {
            var userid = $('#regpane input[placeholder="ID"]').val()
            var nickname = $('#regpane input[placeholder="Nickname"]').val()
            var passwd = $('#regpane input[placeholder="Password"]').val()
            var conpasswd = $('#regpane input[placeholder="Confirm passwd"]').val()
            if (userid == "") {
                $('#regpane input[placeholder="ID"]').addClass('wrongpassword');
                setTimeout(() => {
                    $('#regpane input[placeholder="ID"]').removeClass('wrongpassword');
                }, 500)
            } else {
                if (passwd == conpasswd) {
                    db.run(`insert into Persons values("${userid}", "${nickname}", "${passwd}")`)
                    $('#loadingacc')[0].setAttribute('style','visibility:visible;')
                    $('#accountstatpane h1').html(nickname)
                    setTimeout(() => {
                        logined = true
                        $('#loadingacc')[0].setAttribute('style','visibility:hidden;')
                        $('#regpane')[0].setAttribute('style', 'visibility:hidden');
                        atRegPage = false
                        $('#accountstatpane').addClass('display-acc');
                        $('#accountstatpane')[0].setAttribute('style', 'visibility:visible');
                        stat.setAttribute('fill', 'green');
                        if (saved) account_butt.setAttribute('title', 'Logined - Saved.')
                        else {
                            stat.setAttribute('fill', 'orange');
                            account_butt.setAttribute('title', 'Logined - Not saved.')
                        }
                    }, 1500)
                } else {
                    $('#regpane input[placeholder="Confirm passwd"]').addClass('wrongpassword');
                    setTimeout(() => {
                        $('#regpane input[placeholder="Confirm passwd"]').removeClass('wrongpassword');
                    }, 500)
                }
            }
        });

        $(document).on('click', '#confirmcus', async function () {
            var userid = $('#customizepane input[placeholder="ID"]').val()
            var nickname = userid
            var passwd = $('#customizepane input[placeholder="Password"]').val()
            db.run(`insert into Persons values("${userid}", "${nickname}", "${passwd}")`)
            $('#loadingacc')[0].setAttribute('style','visibility:visible;')
            $('#accountstatpane h1').html(nickname)
            setTimeout(() => {
                logined = true
                $('#loadingacc')[0].setAttribute('style','visibility:hidden;')
                $('#customizepane')[0].setAttribute('style', 'visibility:hidden');
                atCustomePage = false
                $('#accountstatpane').addClass('display-acc');
                $('#accountstatpane')[0].setAttribute('style', 'visibility:visible');
                stat.setAttribute('fill', 'green');
                if (saved) account_butt.setAttribute('title', 'Logined - Saved.')
                else {
                    stat.setAttribute('fill', 'orange');
                    account_butt.setAttribute('title', 'Logined - Not saved.')
                }
            }, 1500)
        });

        $(document).on('click', '#confirmlogin', async function () {
            var userid = $('#loginpane input[placeholder="ID"]').val()
            var nickname = userid
            var passwd = $('#loginpane input[placeholder="Password"]').val()
            db.run(`insert into Persons values("${userid}", "${nickname}", "${passwd}")`)
            $('#loadingacc')[0].setAttribute('style','visibility:visible;')
            $('#accountstatpane h1').html(nickname)
            setTimeout(() => {
                logined = true
                $('#loadingacc')[0].setAttribute('style','visibility:hidden;')
                $('#loginpane')[0].setAttribute('style', 'visibility:hidden');
                atLoginPage = false
                $('#accountstatpane').addClass('display-acc');
                $('#accountstatpane')[0].setAttribute('style', 'visibility:visible');
                stat.setAttribute('fill', 'green');
                if (saved) account_butt.setAttribute('title', 'Logined - Saved.')
                else {
                    stat.setAttribute('fill', 'orange');
                    account_butt.setAttribute('title', 'Logined - Not saved.')
                }
            }, 1500)
        });

        $(document).on('click', '#logout', async function () {
            db.run(`delete from Persons`)
            $('#loadingacc')[0].setAttribute('style','visibility:visible;')
            setTimeout(() => {
                logined = false
                $('#loadingacc')[0].setAttribute('style','visibility:hidden;')
                $('#welcomepane').addClass('display-acc');
                $('#welcomepane')[0].setAttribute('style', 'visibility:visible');
                $('#accountstatpane')[0].setAttribute('style', 'visibility:hidden');
                stat.setAttribute('fill', 'grey');
                if (saved) account_butt.setAttribute('title', 'Offline - Saved.')
                else {
                    account_butt.setAttribute('title', 'Offline - Not saved.')
                }
            }, 1500)
        });
    } catch (err) {
    }
})


ipcRenderer.on('saveNow', async () => {
    if (currentNoteID != 0) {
        const db = await dbPromise;
        await db.run(`update Notes set value= ? ,ModifyTime = datetime('now','localtime') where noteid = ?`, editor.getValue(), currentNoteID);
        saved = true
        if (logined) {
            stat.setAttribute('fill', 'green');
            account_butt.setAttribute('title', 'Logined - Saved.')
        } else account_butt.setAttribute('title', 'Offline - Saved.')
    }
})

ipcRenderer.on('openMDT', async () => {
    var value = await Promise.resolve(db.get('select Content from Support where Name="MarkdownTutorial"'))
    ipcRenderer.send('open', "Markdown Tutorial", value.Content)
})

async function deleteFolder(db, id) {
    var childrenList = await Promise.resolve(db.all(`select folderid from Directories where parentid=${id}`))
    await Promise.resolve(db.run(`delete from Directories where folderid=${id}`))
    await Promise.resolve(db.run(`delete from Notes where folderid=${id}`))
    for (var i = 0; i < childrenList.length; i++) {
        deleteFolder(db, parseInt(childrenList[i].folderid))
    }
}