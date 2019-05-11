var sqlite3 = require('sqlite3').verbose();
const path = require('path');
var db = new sqlite3.Database(path.join('../../data/','markdownald.db'));
var fs = require('fs');

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

addSupport(["MarkdownTutorial","Content1"]);
addSupport(["ServerGuide","Content2"]);
// addPerson(["donk","hdk1","123456"]);
// addPerson(["miyaaa","lmy","1234567"]);
// addPerson(["fordai","dzj","12345678"]);
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
// updataViewtime([1]);
// renameFolder(["CSE",5]);
// selectNote([3]);
// selectAllnotes();
// var a=JSON.stringify(getResult());
// console.log(a);
// deleteTemp();
// viewsubFolder(3);
// viewFolderContent(3);

// setTimeout(function(){
//     var data=fs.readFileSync('temp.txt','utf-8');
//     console.log(data);
//     return data;
// },500);




// add:
function addPerson(param){
    db.run(`insert into Persons (PersonId, Name, Password) values(?, ?, ?)`,param);
}

function addNote(param1,param2){
    db.run(`insert into Notes (NoteId, Title, data, FolderId, ModifyTime,ViewTime) values(?, ?, ?, ?, datetime('now','localtime'),datetime('now','localtime'))`, param1);
    db.run(`insert OR ignore into Directories (FolderId, FolderName,ParentId,key,level) values(?,?,?,?,?)`, param2);
}

function addSupport(param){
    db.run(`insert OR ignore into Support (Name, Content) values(?, ?) `,param);
}


// delete:
function deletePerson(param){
    db.run(`delete from Persons where Personid = ?`, param);
}

function deleteNote(param){
    db.run(`delete from Notes where Noteid = ?`, param);
}


//update
function updateNoteTitle(param){
    db.run(`update Notes set Title = ? ,ModifyTime = datetime('now','localtime') where NoteId = ?`, param);
}

function updateNoteDirectory(param1,param2){
    db.run(`update Notes set FolderId=?, ModifyTime = datetime('now','localtime') where NoteID = ?`,param1);
    db.run(`insert OR ignore into Directories (FolderId, FolderName,ParentId,key,level) values(?,?,?,?,?)`, param2);
}

function updateNoteData(param){  
    db.run(`update Notes set data= ? ,ModifyTime = datetime('now','localtime') where NoteId = ?`, param);
}

function updataViewtime(param){
    db.run(`update Notes set ViewTime= datetime('now','localtime') where NoteId = ?`, param);
}

function updateName(param){
    db.run(`update Persons set Name = ? where PersonId = ?`, param);
}

function updatePassword(param){
    db.run(`update Persons set Password = ? where PersonId = ?`, param);
}

function renameFolder(param){
    db.run(`update Directories set FolderName = ? where FolderId = ?`,param);
}

// select

function selectNote(param){
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
}

function recentNotes(param){
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
}      

function selectAllnotes(param){
    db.all(`select NoteId,Title,data from Notes`,param,
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
}

    
function viewsubFolder(param){
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
    }
 
function viewFolderContent(param){
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
}


function getResult(){
    var data=fs.readFileSync('temp.txt','utf-8');
    return data;
}


function deleteTemp(){
    fs.unlink('temp.txt',function(error){
    if(error){
        console.log(error);
        return false;
    }
    console.log('deleted');
});

}


