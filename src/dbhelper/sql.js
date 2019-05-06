var fs = require('fs');
var file = 'markdownald.db';
var exists = fs.existsSync(file);
var sqlite3 = require('sqlite3').verbose();


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
    // create table

    let personTable =`
        create table if not exists Persons (
            PersonId int(3) PRIMARY KEY,
            Name varchar(255) NOT NULL,
            Password varchar(255) NOT NULL,
            phone varchar(255) NOT NULL
        );`;
        db.createTable(personTable);

    let noteTable = `
       create table if not exists Notes(
            NoteId int(3) PRIMARY KEY, 
            Title varchar(255),
            Class varchar(255),
            data MEDIUMTEXT,
            PersonId int(3),
            FOREIGN KEY (PersonId) REFERENCES Persons
        );`;
    return db.createTable(noteTable);

}).then((result)=>{
    console.log(result);
    doSql();
}).catch((err)=>{
    console.error(err);
});

let doSql = function() {

    // addPerson([1,"hdk1","123456","123"]);
    // addPerson([2,"hdk2","1234567","1234"]);
    // addPerson([3,"hdk3","12345678","12345"]);
    // addNote([1,"title1","class1","data1",1]);
    // addNote([2,"title2","class2","data2",2]);
    // addNote([3,"title3","class2","data3",2]);
    // deletePerson([3]);
    // deleteNote([2]);
    // updateNoteTitle(["title1mod",1]);
    // updateNoteClass(["class2mod",3]);
    // updateNoteData(["data1mod",1]);
    // updatePassword(["123mod",1]);
    // updatePhone(["12345mod",3]);
    // updatePhone(["1234mod",2]);
    // selectUser([1]);
    // selectNote([3]);

}

    // add
	function addPerson(param){
	    db.sql(`insert into Persons (PersonId, Name, Password, phone) values(?, ?, ?, ?)`,
	        param).then((res)=>{
	        console.log(res);
	    }).catch((err)=>{
	        console.log(err);
	    });
	}

    function addNote(param){
        db.sql(`insert into Notes (NoteId, Title, Class, data, PersonId) values(?, ?, ?, ?, ?)`,
            param).then((res)=>{
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
        db.sql(`update Notes set Title= ? where NoteId = ?`, param).then((res)=>{
            console.log(res);
        }).catch((err)=>{
            console.log(err);
        });
    }

    function updateNoteClass(param){
        db.sql(`update Notes set Class= ? where NoteId = ?`, param).then((res)=>{
            console.log(res);
        }).catch((err)=>{
            console.log(err);
        });
    }

	function updateNoteData(param){  
	    db.sql(`update Notes set data= ? where NoteId = ?`, param).then((res)=>{
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

    function updatePhone(param){
        db.sql(`update Persons set phone= ? where PersonId = ?`, param).then((res)=>{
            console.log(res);
        }).catch((err)=>{
            console.log(err);
        });
    }

    // select
	function selectUser(param){
	    db.sql(`select * from Notes where PersonId = ?`, param, 'all').then((res)=>{
	        console.log(res);
	    }).catch((err)=>{
	        console.log(err);
	    });
	};

    function selectNote(param){
        db.sql(`select * from Notes where NoteId = ?`, param, 'all').then((res)=>{
            console.log(res);
        }).catch((err)=>{
            console.log(err);
        });
    }







