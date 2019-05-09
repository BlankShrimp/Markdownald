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
    console.log(result);
    // create(load) table

    let supportTable =`
        create table if not exists Support (
            Name varchar(255) PRIMARY KEY,
            Content varchar(255)
        );`;
        db.createTable(supportTable);

    let personTable =`
        create table if not exists Persons (
            PersonId int(3) PRIMARY KEY,
            Name varchar(255) NOT NULL,
            Password varchar(255) NOT NULL
        );`;
        db.createTable(personTable);
    
    let directoryTable =`
        create table if not exists Directories (
            id int(3) PRIMARY KEY,
            Value varchar(255) NOT NULL,
            NoteId int(3) UNIQUE,
            ParentId int(3) NOT NULL,
            key varchar(255) NOT NULL,
            level int(3) NOT NULL,
            FOREIGN KEY(NoteId) REFERENCES Notes(NoteId) on delete cascade on update cascade
        );`;
        db.createTable(directoryTable);

    let noteTable = `
       create table if not exists Notes(
            NoteId int(3) PRIMARY KEY, 
            Title varchar(255),
            data MEDIUMTEXT,
            Datetime DATETIME
        );`;
    return db.createTable(noteTable);

}).then((result)=>{
    console.log(result);

    doSql();

}).catch((err)=>{
    console.error(err);
});

let doSql = function() {
    addSupport(["MarkdownTutorial","Content1"]);
    addSupport(["ServerGuide","Content2"]);
    // addPerson([1,"hdk1","123456"]);
    // addPerson([2,"hdk2","1234567"]);
    // addPerson([3,"hdk3","12345678"]);
    // addNote([1,"title1","data1"],[1,"gf1",1,0,"0",1]);
    // addNote([2,"title2","data2"],[2,"gf2",2,0,"0",1]);
    // addNote([3,"title3","data3"],[3,"f1_1",3,1,"0-1",2]);
    // addNote([4,"title4","data4"],[4,"f1_2",4,1,"0-1",2]);
    // addNote([5,"title5","data5"],[5,"f2_1",5,2,"0-2",2]);
    // addNote([6,"title6","data6"],[6,"s1_1_1",6,3,"0-1-3",3]);
    // addNote([7,"title7","data7"],[7,"s1_1_2",7,3,"0-1-3",3]);
    // deletePerson([3]);
    // deleteNote([2]);
    // updateNoteTitle(["title1mod",1]);
    // updateNoteDirectory(["s2_1_1",5,"0-2-5",3,7],[7]);
    // updateNoteData(["data1mod",1]);
    // updatePassword(["123mod",1]);
    // selectNote([3]);
    // selectAllnotes();
    // recentNotes(5);

}

    // add
	function addPerson(param){
	    db.sql(`insert into Persons (PersonId, Name, Password) values(?, ?, ?)`,
	        param).then((res)=>{
	        console.log(res);
	    }).catch((err)=>{
	        console.log(err);
	    });
	}

    function addNote(param1,param2){
        db.sql(`insert into Notes (NoteId, Title, data, Datetime) values(?, ?, ?, datetime('now','localtime'))`, param1).then((res)=>{
                console.log(res);
            }).catch((err)=>{
                console.log(err);
            });
        db.sql(`insert into Directories (id, Value, NoteId,ParentId,key,level) values(?,?,?,?,?,?)`, param2).then((res)=>{
            console.log(res);
        }).catch((err)=>{
            console.log(err);
        });
    }
    
    function addSupport(param){
        db.sql(`insert OR ignore into Support (Name, Content) values(?, ?) `,param).then((res)=>{
            console.log(res);
        }).catch((err)=>{
            console.log(err);
        });
    }
    // delete
    function deletePerson(param){
        db.sql(`delete from Persons where Personid = ?`, param).then((res)=>{
            console.log(res);
        }).catch((err)=>{
            console.log(err);
        });
    }

	function deleteNote(param){
	    db.sql(`delete from Notes where Noteid = ?`, param).then((res)=>{
	        console.log(res);
	    }).catch((err)=>{
	        console.log(err);
	    });
	}
    

    // update
    function updateNoteTitle(param){
        db.sql(`update Notes set Title = ? ,Datetime = datetime('now','localtime') where NoteId = ?`, param).then((res)=>{
            console.log(res);
        }).catch((err)=>{
            console.log(err);
        });
    }

    function updateNoteDirectory(param1,param2){
        db.sql(`update Directories set Value = ? ,ParentId= ?, key=?,level=? where NoteId = ?`, param1);
        db.sql(`update Notes set Datetime = datetime('now','localtime') where NoteID = ?`,param2).then((res)=>{
            console.log(res);
        }).catch((err)=>{
            console.log(err);
        });
    }

	function updateNoteData(param){  
	    db.sql(`update Notes set data= ? ,Datetime = datetime('now','localtime') where NoteId = ?`, param).then((res)=>{
	        console.log(res);
	    }).catch((err)=>{
	        console.log(err);
	    });
	}

    function updatePassword(param){
        db.sql(`update Persons set Password= ? where PersonId = ?`, param).then((res)=>{
            console.log(res);
        }).catch((err)=>{
            console.log(err);
        });
    }

    // select
    function selectNote(param){
        db.sql(`select * from Notes where NoteId = ?`, param,'get').then((res)=>{
            console.log(res);
        }).catch((err)=>{
            console.log(err);
        });
    }

    function recentNotes(param){
        db.sql(`select * from Notes ORDER BY Datetime DESC limit ?`,param,'all').then((res)=>{
            console.log(res);
        }).catch((err)=>{
            console.log(err);
        });
    }

    function selectAllnotes(param){
        db.sql(`select * from Notes`,param,'all').then((res)=>{
            console.log(res);
        }).catch((err)=>{
            console.log(err);
        });
    }






