var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');
const path = require('path');


// create table
function serialize(){
    var db = new sqlite3.Database(path.join('data/','markdownald.db'));
    db.serialize(function(){
        db.run(`
            create table if not exists Support(
                Name varchar(255) PRIMARY KEY,
                Content varchar(255)
            );`);
        db.run(`
            create table if not exists Persons (
                userid varchar(20) PRIMARY KEY,
                nickname varchar(20) NOT NULL,
                passwd varchar(20) NOT NULL
            );`);
        db.run(`
            create table if not exists Directories (
                folderid int(8) PRIMARY KEY,
                foldername varchar(255) NOT NULL,
                parentid int(8) NOT NULL,
                trace varchar(20) NOT NULL
            );`);
        db.run(`
            create table if not exists Notes(
                noteid int(8) PRIMARY KEY, 
                title varchar(255) NOT NULL,
                folderid int(8),
                value mediumtext,
                ModifyTime DATETIME,
                ViewTime DATETIME,
                upload boolean DEFAULT 0
            );`);
        db.run(`insert OR ignore into Support values("MaxNote",0)`);
        db.run(`insert OR ignore into Support values("MaxFolder",0)`);
    });
    db.close();
}



// add:
// addSupport(["MarkdownTutorial","Content1"]);
// addSupport(["ServerGuide","Content2"]);
// add support documents    param:[Name, Content]
function addSupport(param){
    var db = new sqlite3.Database(path.join('data/','markdownald.db'));
    db.run(`insert OR ignore into Support (Name, Content) values(?, ?) `,param);
    db.close();
}


// userRegister(["hdk","donk","123"]);
// userRegister(["dzj","fordai","123"]);
// add user  param:[userid, nickname, passwd]
function userRegister(param){
    var db = new sqlite3.Database(path.join('data/','markdownald.db'));
    db.run(`insert into Persons (userid, nickname, passwd) values(?, ?, ?)`,param);
    db.close();
}

// addFolder(["Year2",0]);
// addFolder(["Year2",2]);
// add folder param:[foldername,parentid]
function addFolder(param){
    var db = new sqlite3.Database(path.join('data/','markdownald.db'));
    db.get(`select Content from Support where Name = "MaxFolder"`,function(err,res){
        var fid=parseInt(res.Content)+1;
        if (param[1]==0) {
            trace = 0+"-"+fid;
            param.unshift(fid);
            param.push(trace);
            db.run(`insert into Directories values(?,?,?,?)`,param)
            db.run(`update Support set Content = ? where Name = "MaxFolder"`,fid)
        }else {
            db.get(`select trace from Directories where folderid = ?`,param[1],function(err,res){
                trace = res.trace +"-"+fid;
                param.unshift(fid);
                param.push(trace);
                db.run(`insert into Directories values(?,?,?,?)`,param)
                db.run(`update Support set Content = ? where Name = "MaxFolder"`,fid)
            })
        }
    })
    db.close();
}


// addNote(["t3",3,"v3"]);
// add note  param:[title, folderid, value]
function addNote(param){
    var db = new sqlite3.Database(path.join('data/','markdownald.db'));
    db.get(`select Content from Support where Name = "MaxNote"`,function(err,res){
        var nid=parseInt(res.Content)+1;
        param.unshift(nid);
        db.run(`insert into Notes (noteid, title, folderid, value, ModifyTime, ViewTime) values(?,?,?,?,datetime('now','localtime'),datetime('now','localtime'))`,param);
        db.run(`update Support set Content = ? where Name = "MaxNote"`,nid)
    })
    db.close();
    
    
}


// deleteUser("dzj");
// delete:
// delete user  param:[userid]
function deleteUser(param){
    var db = new sqlite3.Database(path.join('data/','markdownald.db'));
    db.run(`delete from Persons where userid = ?`, param);
    db.close();
}


// deleteNote(2)
//delete note   param:[noteid]
function deleteNote(param){
    var db = new sqlite3.Database(path.join('data/','markdownald.db'));
    db.run(`delete from Notes where noteid = ?`, param);
    db.close();
}

// addFolder(["Year3",4]);
// addNote(["t3",4,"v3"]);
// deleteFolder(0);
//delete folder    param:[folderid]
function deleteFolder(param){
    var db = new sqlite3.Database(path.join('data/','markdownald.db'));
    if (param==0) {
        var pattern = "0-%";
        db.run(`delete from Notes where folderid = 0`);
        db.each(`select folderid from Directories where trace LIKE ?`,pattern,function(err,res){
            var fid = res.folderid;
            db.run(`delete from Directories where folderid = ?`,fid);
            db.each(`select noteid from Notes where folderid = ?`,fid,function(err,res){
                var nid=res.noteid;
                db.run(`delete from Notes where noteid = ?`, nid)
            })
        })  
    }else{
        db.get(`select trace from Directories where folderid = ?`,param,function(err,res){
            var pattern = res.trace+"%";
            db.each(`select folderid from Directories where trace LIKE ?`,pattern,function(err,res){
                var fid = res.folderid;
                db.run(`delete from Directories where folderid = ?`,fid);
                db.each(`select noteid from Notes where folderid = ?`,fid,function(err,res){
                    var nid=res.noteid;
                    db.run(`delete from Notes where noteid = ?`, nid);
                })
            })
        })
    }
    db.close();
}


//delete user   param:[userid]
function deleteUser(param){
    var db = new sqlite3.Database(path.join('data/','markdownald.db'));
    db.run(`delete from Persons where userid = ?`,param);
    db.close();
}


// deleteAllnotes()
// delete all notes
function deleteAllnotes(){
    var db = new sqlite3.Database(path.join('data/','markdownald.db'));
    db.run(`delete from Notes`);
}

// deleteAll()
//delete all notes and folder
function deleteAll(){
    var db = new sqlite3.Database(path.join('data/','markdownald.db'));
    db.run(`delete from Notes`);
    db.run(`delete from Directories`);
}


// updateNoteTitle(["mod",5]);
// update
// update title     param:[title,noteid]
function updateNoteTitle(param){
    var db = new sqlite3.Database(path.join('data/','markdownald.db'));
    db.run(`update Notes set title = ? ,ModifyTime = datetime('now','localtime') where noteid = ?`, param);
    db.close();
}

// moveNote([5,5]);
// move note     param:[folderid,noteid]                
function moveNote(param){
    var db = new sqlite3.Database(path.join('data/','markdownald.db'));
    db.run(`update Notes set folderid=?, ModifyTime = datetime('now','localtime') where noteid = ?`,param);
    db.close();
}

// updateNoteData(["mod",5]);
// update note content  param:[value,noteid]
function updateNoteData(param){
    var db = new sqlite3.Database(path.join('data/','markdownald.db'));  
    db.run(`update Notes set value= ? ,ModifyTime = datetime('now','localtime') where noteid = ?`, param);
    db.close();
}

// changeUploadstate(5);
// use when note upload successfully(change from 0 to 1)   param:[noteid]
function changeUploadstate(param){
    var db = new sqlite3.Database(path.join('data/','markdownald.db')); 
    db.run(`update Notes set upload = 1 where noteid = ?`, param);
    db.close();
}



// updateViewtime(5);
// update last view time    param:[noteid]
function updateViewtime(param){
    var db = new sqlite3.Database(path.join('data/','markdownald.db'));
    db.run(`update Notes set ViewTime= datetime('now','localtime') where noteid = ?`, param);
    db.close();
}


// changeNickname(["donkkk","hdk"]);
// update  user's nickname  param:[nickname,userid]
function changeNickname(param){
    var db = new sqlite3.Database(path.join('data/','markdownald.db'));
    db.run(`update Persons set nickname = ? where userid = ?`, param);
    db.close();
}


// changePassword(["mod","hdk"]);
// update  user's password  param:[passwd,userid]
function changePassword(param){
    var db = new sqlite3.Database(path.join('data/','markdownald.db'));
    db.run(`update Persons set passwd = ? where userid = ?`, param);
    db.close();
}


// renameFolder(["year2",4])
// rename the folder    param:[foldername,folderid]
function renameFolder(param){
    var db = new sqlite3.Database(path.join('data/','markdownald.db'));
    db.run(`update Directories set foldername = ? where folderid = ?`,param);
    db.close();
}



// select (each is done by write data into a 'temp.txt' file,
//         need to read the file for further process)

// selectNote(5);
// selectNote(6,"title");
// select a perticular note      param:[noteid]   mode:"title" for just title "value" for just value
function selectNote(param,mode){
    var db = new sqlite3.Database(path.join('data/','markdownald.db'));
    db.get(`select noteid,title,folderid,value,upload from Notes where noteid = ?`, param,function(err,res){
        if (mode=="title") {
            var result=res.title;
            fs.writeFile('temp.txt',result,function(err){});
        }else if(mode == "value"){
            var result=res.value;
            fs.writeFile('temp.txt',result,function(err){});
        }else{
            var result=JSON.stringify(res);
            fs.writeFile('temp.txt',result,function(err){});
        };
    });
    db.close();
}

// recentNotes(5);
// view recent notes    param:[number of notes required]
function recentNotes(param){
    var db = new sqlite3.Database(path.join('data/','markdownald.db'));
      db.all(`select noteid,title,folderid,value,upload from Notes ORDER BY ModifyTime DESC limit ?`,param,
        function(err,res){
        var result = JSON.stringify(res);
        fs.writeFile('temp.txt',result,function(err){});
    });
    db.close();  
}      

// allNotes();
// all notes    
function allNotes(){
    var db = new sqlite3.Database(path.join('data/','markdownald.db'));
    db.all(`select noteid,title,folderid,value,upload from Notes`,
        function(err,res){
        var result = JSON.stringify(res);
        fs.writeFile('temp.txt',result,function(err){});
    });
    db.close();
}

// allFolders();
// all folders
function allFolders(){
    var db = new sqlite3.Database(path.join('data/','markdownald.db'));
    db.all(`select folderid,foldername,parentid from Directories`,
        function(err,res){
        var result = JSON.stringify(res);
        fs.writeFile('temp.txt',result,function(err){});
    });
    db.close();
}


// viewsubFolder(0);
// view all the sub-folders of the current folder
//    param:[folderid] 0 for root folder
function viewsubFolder(param){
    var db = new sqlite3.Database(path.join('data/','markdownald.db'));
    db.all(`select folderid,foldername from Directories where parentid = ?`,param,function(err,res){
        var result = JSON.stringify(res);
        fs.writeFile('temp.txt',result,function(err){});
    });
    db.close();
}
 

// viewfolderContent(4)
// view all the notes in the current folder
//  param:[folderid]
function viewfolderContent(param){
    var db = new sqlite3.Database(path.join('data/','markdownald.db'));
    db.all(`select noteid,title,value,upload from Notes where folderid = ?`,param,function(err,res){
        var result=JSON.stringify(res);
        fs.writeFile('temp.txt',result,function(err){});
    });
    db.close();
}


// viewSupportDoc("MarkdownTutorial")
// view the particular support documents    param:[Name]
function viewSupportDoc(param){
    var db = new sqlite3.Database(path.join('data/','markdownald.db'));
    db.get(`select Content from Support where Name = ?`, param,function(err,res){
        var result=res.Content;
        fs.writeFile('temp.txt',result,function(err){});
    });
    db.close();
}


function selectUser(param){
    var db = new sqlite3.Database(path.join('data/','markdownald.db'));
    db.get(`select * from Persons where userid = ?`,param,function(err,res){
        var result = JSON.stringify(res);
        fs.writeFile('temp.txt',result,function(err){});
    });
    db.close();
}




module.exports={
    serialize,
    addSupport,
    userRegister,
    addFolder,
    addNote,
    deleteUser,
    deleteNote,
    deleteFolder,
    updateNoteTitle,
    moveNote,
    updateNoteData,
    changeUploadstate,
    updateViewtime,
    changeNickname,
    changePassword,
    renameFolder,
    selectNote,
    recentNotes,
    allNotes,
    allFolders,
    viewsubFolder,
    viewfolderContent,
    viewSupportDoc
}


