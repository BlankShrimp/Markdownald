var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');
const path = require('path');


// load(or create) db
// var db = new sqlite3.Database(path.join('../../data/','markdownald.db'));
//

// create table
function serialize(){
    var db = new sqlite3.Database(path.join('../../data/','markdownald.db'));
    db.serialize(function(){
        db.run(`
            create table if not exists Support(
                Name varchar(255) PRIMARY KEY,
                Content varchar(255)
            );`);
        db.run(`
            create table if not exists Persons (
                PersonId varchar(255) PRIMARY KEY,
                Name varchar(255) NOT NULL,
                Password varchar(255) NOT NULL
            );`);
        db.run(`
            create table if not exists Directories (
                FolderId int(3) PRIMARY KEY,
                FolderName varchar(255) NOT NULL,
                ParentId int(3) NOT NULL,
                key varchar(255) NOT NULL,
                level int(3) NOT NULL
            );`);
        db.run(`
            create table if not exists Notes(
                NoteId int(3) PRIMARY KEY, 
                Title varchar(255),
                data MEDIUMTEXT,
                FolderId int(3),
                ModifyTime DATETIME,
                ViewTime DATETIME
            );`);
    });
    db.close();
}

// serialize();
////Below are all sample calls
// addSupport(["MarkdownTutorial","Content1"]);
// addSupport(["ServerGuide","Content2"]);
// addPerson(["fordai","dzj","12345678"]);
// addPerson(["donk","hdk1","123456"]);
// addPerson(["miyaaa","lmy","1234567"]);
// addNote([1,"title1","data1",1],[1,"Year1",0,"0",1]);
// addNote([2,"title2","data2",2],[2,"Year2",0,"0",1]);
// addNote([3,"title3","data3",3],[3,"S1",1,"0-1",2]);
// addNote([4,"title4","data4",3],[3,"S1_",1,"0-1",2]);
// addNote([5,"title5","data5",4],[4,"S2",2,"0-2",2]);
// addNote([6,"title6","data6",5],[5,"EAP",3,"0-1-3",3]);
// addNote([7,"title7","data7",6],[6,"CCT",3,"0-1-3",3]);
// addNote([8,"title8","data8",7],[7,"S1",2,"0-2",2]);
// deletePerson(["fordai"]);
// deleteNote([2]);
// updateNoteTitle(["title1mod",1]);
// updateNoteDirectory([3,7],[3,"S1",1,"0-1",2]);
// updateNoteData(["data1mod",1]);
// updatePassword(["123mod","donk"]);
// updateName(["cold hdk","donk"]);
// updateViewtime([1]);
// renameFolder(["CSE",5]);
// selectNote([3]);
// selectAllnotes();
// viewsubFolder(3);
// viewFolderContent(3);
// viewrootFolder();


// //read file (Timeout may require)
// setTimeout(function(){
//     var data=fs.readFileSync('temp.txt','utf-8');
//     console.log(data);
//     return data;
// },500);




// add:
// add user  param:[PersonId, Name, Password]
function addPerson(param){
    var db = new sqlite3.Database(path.join('../../data/','markdownald.db'));
    db.run(`insert into Persons (PersonId, Name, Password) values(?, ?, ?)`,param);
    db.close();
}

// add note  param1:[NoteId, Title, data, FolderId]
//           param2:[FolderId, FolderName,ParentId,key,level]
function addNote(param1,param2){
    var db = new sqlite3.Database(path.join('../../data/','markdownald.db'));
    db.run(`insert into Notes (NoteId, Title, data, FolderId, ModifyTime,ViewTime) values(?, ?, ?, ?, datetime('now','localtime'),datetime('now','localtime'))`, param1);
    db.run(`insert OR ignore into Directories (FolderId, FolderName,ParentId,key,level) values(?,?,?,?,?)`, param2);
    db.close();
}

// add support documents    param:[Name, Content]
function addSupport(param){
    var db = new sqlite3.Database(path.join('../../data/','markdownald.db'));
    db.run(`insert OR ignore into Support (Name, Content) values(?, ?) `,param);
    db.close();
}




// delete:
// delete user  param:[Personid]
function deletePerson(param){
    var db = new sqlite3.Database(path.join('../../data/','markdownald.db'));
    db.run(`delete from Persons where Personid = ?`, param);
    db.close();
}

//delete note   param:[Noteid]
function deleteNote(param){
    var db = new sqlite3.Database(path.join('../../data/','markdownald.db'));
    db.run(`delete from Notes where Noteid = ?`, param);
    db.close();
}




// update
// update title     param:[Title,NoteId]
function updateNoteTitle(param){
    var db = new sqlite3.Database(path.join('../../data/','markdownald.db'));
    db.run(`update Notes set Title = ? ,ModifyTime = datetime('now','localtime') where NoteId = ?`, param);
    db.close();
}

// update directory     param1:[FolderId,NoteID]
//                      param2:[FolderId, FolderName,ParentId,key,level]
function updateNoteDirectory(param1,param2){
    var db = new sqlite3.Database(path.join('../../data/','markdownald.db'));
    db.run(`update Notes set FolderId=?, ModifyTime = datetime('now','localtime') where NoteID = ?`,param1);
    db.run(`insert OR ignore into Directories (FolderId, FolderName,ParentId,key,level) values(?,?,?,?,?)`, param2);
    db.close();
}

// update note content  param:[data,NoteId]
function updateNoteData(param){
    var db = new sqlite3.Database(path.join('../../data/','markdownald.db'));  
    db.run(`update Notes set data= ? ,ModifyTime = datetime('now','localtime') where NoteId = ?`, param);
    db.close();
}

// update last view time    param:[NoteId]
function updateViewtime(param){
    var db = new sqlite3.Database(path.join('../../data/','markdownald.db'));
    db.run(`update Notes set ViewTime= datetime('now','localtime') where NoteId = ?`, param);
    db.close();
}

// update  user's nickname  param:[Name,PersonId]
function updateName(param){
    var db = new sqlite3.Database(path.join('../../data/','markdownald.db'));
    db.run(`update Persons set Name = ? where PersonId = ?`, param);
    db.close();
}

// update  user's password  param:[Password,PersonId]
function updatePassword(param){
    var db = new sqlite3.Database(path.join('../../data/','markdownald.db'));
    db.run(`update Persons set Password = ? where PersonId = ?`, param);
    db.close();
}

// rename the folder(note class)    param:[FolderName,FolderId]
function renameFolder(param){
    var db = new sqlite3.Database(path.join('../../data/','markdownald.db'));
    db.run(`update Directories set FolderName = ? where FolderId = ?`,param);
    db.close();
}



// select (each is done by write data into a 'temp.txt' file,
//         need to read the file for further process)

// select note      param:[NoteId]
function selectNote(param){
    var db = new sqlite3.Database(path.join('../../data/','markdownald.db'));
    db.get(`select NoteId,Title,data from Notes where NoteId = ?`, param,function(err,res){
        var result=JSON.stringify(res);

        fs.writeFile('temp.txt',result,function(err){
            if (err) {
                console.log(err);
            }else{
                console.log("finish");
            }
        })
    });
    db.close();
}

// view recent notes    param:[number of notes required]
function recentNotes(param){
    var db = new sqlite3.Database(path.join('../../data/','markdownald.db'));
      db.all(`select NoteId,Title,data from Notes ORDER BY ModifyTime DESC limit ?`,param,
        function(err,res){
        var result = JSON.stringify(res);
        fs.writeFile('temp.txt',result,function(err){
            if(err){
                console.log(err);
            }else{
                console.log("finish");
            }
        })
    });
    db.close();  
}      

// all notes    
function selectAllnotes(){
    var db = new sqlite3.Database(path.join('../../data/','markdownald.db'));
    db.all(`select NoteId,Title,data from Notes`,
        function(err,res){
        var result = JSON.stringify(res);
        fs.writeFile('temp.txt',result,function(err){
            if(err){
                console.log(err);
            }else{
                console.log("finish");
            }
        })
    });
    db.close();
}

// view all the Folder in the root index
function viewrootFolder(){
    var db = new sqlite3.Database(path.join('../../data/','markdownald.db'));
    db.all(`select FolderId from Directories where ParentId = 0`,function(err,res){
        var result= JSON.stringify(res);
        fs.writeFile('temp.txt',result,function(err){
            if(err){
                console.log(err);
            }else{
                console.log("finish")
            }
        });
    });
    db.close();
}

// view all the sub-folders of the current folder
//    param:[FolderId] 
function viewsubFolder(param){
    var db = new sqlite3.Database(path.join('../../data/','markdownald.db'));
    db.get(`select FolderId,key,level from Directories where FolderId = ?`,param,function(err,res){
            var pattern = res.key+'-'+res.FolderId;
            db.all(`select FolderId,FolderName from Directories where key LIKE ?`,pattern,function(err,res){
                var result= JSON.stringify(res);
                fs.writeFile('temp.txt',result,function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("finish");
                    }
                })
        });    
    });
    db.close();
}
 
// view all the notes in the current folder
//  param:[FolderId]
function viewFolderContent(param){
    var db = new sqlite3.Database(path.join('../../data/','markdownald.db'));
    db.all(`select NoteId,Title,data from Notes where FolderId = ?`,param,function(err,res){
        var result=JSON.stringify(res);
        fs.writeFile('temp.txt',result,function(err){
            if(err){
                console.log(err);
            }else{
                console.log("finish");
            }
        })
    });
    db.close();
}

// view the particular support documents    param:[Name]
function viewSupportDoc(param){
    var db = new sqlite3.Database(path.join('../../data/','markdownald.db'));
    db.get(`select Content from Notes where Name = ?`, param,function(err,res){
        var result=JSON.stringify(res);
        fs.writeFile('temp.txt',result,function(err){
            if (err) {
                console.log(err);
            }else{
                console.log("finish");
            }
        })
    });
    db.close();
}


// read the 'temp.txt' file
function getResult(){
    var data=fs.readFileSync('temp.txt','utf-8');
    return data;
}


// delete the 'temp.txt' file
function deleteTemp(){
    fs.unlink('temp.txt',function(error){
    if(error){
        console.log(error);
        return false;
    }
    console.log('deleted');
});
}


module.exports={
    serialize,
    addPerson,
    addNote,
    addSupport,
    deletePerson,
    deleteNote,
    updateNoteTitle,
    updateNoteDirectory,
    updateNoteData,
    updateViewtime,
    updateName,
    updatePassword,
    renameFolder,
    selectNote,
    recentNotes,
    selectAllnotes,
    viewrootFolder,
    viewsubFolder,
    viewFolderContent,
    viewSupportDoc,
    getResult,
    deleteTemp
}
