const fs = require('fs');
const file = 'markdownald.db';
const exists = fs.existsSync(file);
const sqlite3 = require('sqlite3').verbose();


class HandleDB{
	constructor(options){
		this.databaseFile = options && options.databaseFile || '../../data/markdownald.db';
		this.db=null;
	}

	connectDataBase(){
		let _self = this;
		return new Promise((resolve,reject)=>{
			_self.db = new sqlite3.Database(_self.databaseFile,function(err){
				if(err) reject(new Error(err));
				resolve('connected');
			});
		});
	}


	createTable(sentence){
		let _self=this;
		return new Promise((resolve,reject)=>{
			_self.db.exec(sentence,function(err){
				if(err) reject(new Error(err));
				resolve('created successfully.')
			});
		});
	}

	sql(sql,param,mode){
		let _self = this;
		mode = mode=='all'?'all':mode=='get'?'get':'run';
		return new Promise((resolve,reject)=>{
			_self.db[mode](sql,param,
				function(err,data){
					if (err) {
						reject(new Error(err));
					}else{
						if(data){
							resolve(data);
						}else{
							resolve('success');
						};
					};
				}
			);
		});
	}

};

module.exports = HandleDB;





let db = new HandleDB({
    databaseFile: '../../data/markdownald.db',
});

db.connectDataBase().then((result)=>{

    // create(load) table

    let supportTable =`
        create table if not exists Support (
            Name varchar(255) PRIMARY KEY,
            Content varchar(255)
        );`;
        db.createTable(supportTable);

    let personTable =`
        create table if not exists Persons (
            PersonId varchar(255) PRIMARY KEY,
            Name varchar(255) NOT NULL,
            Password varchar(255) NOT NULL
        );`;
        db.createTable(personTable);
    
    let directoryTable =`
        create table if not exists Directories (
            FolderId int(3) PRIMARY KEY,
            FolderName varchar(255) NOT NULL,
            ParentId int(3) NOT NULL,
            key varchar(255) NOT NULL,
            level int(3) NOT NULL
        );`;
        db.createTable(directoryTable);

    let noteTable = `
       create table if not exists Notes(
            NoteId int(3) PRIMARY KEY, 
            Title varchar(255),
            data MEDIUMTEXT,
            FolderId int(3),
            ModifyTime DATETIME,
            ViewTime DATETIME
        );`;
    return db.createTable(noteTable);

}).then((result)=>{
    doSql();
}).catch((err)=>{
    console.error(err);
});

let doSql = function() {
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
    // selectAllnotes();
    // recentNotes(5);
    // selectNote([3]);
    // updataViewtime([1]);
    // renameFolder(["CSE",5]);
    // viewsubFolder(3);
    // viewFolderContent(3);
}

    // add
	function addPerson(param){
	    db.sql(`insert into Persons (PersonId, Name, Password) values(?, ?, ?)`,
	        param).catch((err)=>{
	        console.log(err);
	    });
	}

    function addNote(param1,param2){
        db.sql(`insert into Notes (NoteId, Title, data, FolderId, ModifyTime,ViewTime) values(?, ?, ?, ?, datetime('now','localtime'),datetime('now','localtime'))`, param1)
        .catch((err)=>{
                console.log(err);
            });
        db.sql(`insert OR ignore into Directories (FolderId, FolderName,ParentId,key,level) values(?,?,?,?,?)`, param2)
        .catch((err)=>{
            console.log(err);
        });
    }
    
    function addSupport(param){
        db.sql(`insert OR ignore into Support (Name, Content) values(?, ?) `,param).catch((err)=>{
            console.log(err);
        });
    }
    // delete
    function deletePerson(param){
        db.sql(`delete from Persons where Personid = ?`, param).catch((err)=>{
            console.log(err);
        });
    }

	function deleteNote(param){
	    db.sql(`delete from Notes where Noteid = ?`, param).catch((err)=>{
	        console.log(err);
	    });
	}
    

    // update
    function updateNoteTitle(param){
        db.sql(`update Notes set Title = ? ,ModifyTime = datetime('now','localtime') where NoteId = ?`, param).catch((err)=>{
            console.log(err);
        });
    }

    function updateNoteDirectory(param1,param2){
        db.sql(`update Notes set FolderId=?, ModifyTime = datetime('now','localtime') where NoteID = ?`,param1).catch((err)=>{
            console.log(err);
        });
        db.sql(`insert OR ignore into Directories (FolderId, FolderName,ParentId,key,level) values(?,?,?,?,?)`, param2).catch((err)=>{
            console.log(err);
        });
    }

	function updateNoteData(param){  
	    db.sql(`update Notes set data= ? ,ModifyTime = datetime('now','localtime') where NoteId = ?`, param).catch((err)=>{
	        console.log(err);
	    });
	}

    function updataViewtime(param){
        db.sql(`update Notes set ViewTime= datetime('now','localtime') where NoteId = ?`, param).catch((err)=>{
            console.log(err);
        });
    }

    function updateName(param){
        db.sql(`update Persons set Name = ? where PersonId = ?`, param).catch((err)=>{
            console.log(err);
        });
    }

    function updatePassword(param){
        db.sql(`update Persons set Password = ? where PersonId = ?`, param).catch((err)=>{
            console.log(err);
        });
    }

    function renameFolder(param){
        db.sql(`update Directories set FolderName = ? where FolderId = ?`,param).catch((err)=>{
            console.log(err);
        });
    }

    // select
    function selectNote(param){
        db.sql(`select NoteId,Title,data from Notes where NoteId = ?`, param,'get').then((res)=>{
            var res_str = JSON.stringify(res);
            console.log(res_str);
        }).catch((err)=>{
            console.log(err);
        });
    }

    function recentNotes(param){
        db.sql(`select NoteId,Title,data from Notes ORDER BY ModifyTime DESC limit ?`,param,'all').then((res)=>{
            var res_str = JSON.stringify(res);
            console.log(res_str);
        }).catch((err)=>{
            console.log(err);
        });
    }

    function selectAllnotes(param){
        db.sql(`select NoteId,Title,data from Notes`,param,'all').then((res)=>{
            var res_str = JSON.stringify(res);
            console.log(res_str);
        }).catch((err)=>{
            console.log(err);
        });
    }

    function viewsubFolder(param){
        db.sql(`select FolderId,key,level from Directories where FolderId = ?`,param,'get').then((res)=>{
            var pattern = res.key+'-'+res.FolderId;
            db.sql(`select FolderId,FolderName from Directories where key LIKE ?`,pattern,'all').then((res)=>{
                console.log(res);
            })
        }).catch((err)=>{
            console.log(err);
        });

    }
 
    function viewFolderContent(param){
        db.sql(`select NoteId,Title,data from Notes where FolderId = ?`,param,'all').then((res)=>{
            var res_str = JSON.stringify(res);
            console.log(res_str);
        }).catch((err)=>{
            console.log(err);
        });
    }




