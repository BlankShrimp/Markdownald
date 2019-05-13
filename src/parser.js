

var selection = [{
    folderID: 1,
    parentID: 0,
    folderName: "Year1"
}, {
    folderID: 2,
    parentID: 1,
    folderName: "CSE208"
}, {
    folderID: 3,
    parentID: 2,
    folderName: "Tutorial"
}, {
    folderID: 4,
    parentID: 3,
    folderName: "b"
}, {
    folderID: 5,
    parentID: 4,
    folderName: "b"
}, {
    folderID: 6,
    parentID: 5,
    folderName: "b"
}, {
    folderID: 7,
    parentID: 6,
    folderName: "b"
}, {
    folderID: 8,
    parentID: 7,
    folderName: "b"
}]

for (var i = 0; i < selection.length; i++) {
    $('#f' + selection[i].parentID).append('<li><div class="file is-dir"><span class="fname">'
        + selection[i].folderName + '</span><span class="delbutts" id="df'+selection[i].folderID+
        '" style="visibility:hidden; margin-left: 5px; display: inline-block; height:15px; width:15px; background: url(icons/delete.png) no-repeat;"></span></div><ul id="f' + selection[i].folderID + '"></ul></li>');
}

var notes = [{
    noteID: 1,
    title: "aNote",
    folderID: 2
}, {
    noteID: 2,
    title: "aNote",
    folderID: 8
}, {
    noteID: 3,
    title: "aNote",
    folderID: 2
}, {
    noteID: 4,
    title: "aNote",
    folderID: 6
}, {
    noteID: 5,
    title: "aNote",
    folderID: 5
}, {
    noteID: 6,
    title: "aNote",
    folderID: 3
}, {
    noteID: 7,
    title: "aNote",
    folderID: 8
}]

for (var i = 0; i < notes.length; i++) {
    $('#f' + notes[i].folderID).append('<li id="n' + notes[i].noteID + '"><div class="file is-file"><span class="notename">'
        + notes[i].title + '</span><span class="delbutts" id="dn'+selection[i].noteID+
        '" style="visibility:hidden; margin-left: 5px; display: inline-block; height:15px; width:15px; background: url(icons/delete.png) no-repeat;"></span></div></li>')
}

//ipcrender样板
$('.is-dir').addClass('collapse');
$(document).on('click', '.is-file', function () {
    ipcRenderer.send('open', $(this).parent().attr('id'), $(this).parent().attr('id'))
});

$(document).ready(function () {
    //加载时隐藏子菜单
    $('li ul').hide();
    //不包含子菜单时鼠标指针和项目图标
    $('li:not(:has(ul))')
        .css({ 'cursor': 'default', 'list-style-image': 'none' });
    //包含子菜单时鼠标指针和项目图标
    $('li:has(ul)')
        .css({ 'cursor': 'pointer', 'list-style-image': 'url(../res/icons/caret-right.png)' });
    //单击含子菜单的项
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
})