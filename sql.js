var fs = require('fs');
var file = 'markdownald.db';
var exists = fs.existsSync(file);
var sqlite3 = require('sqlite3').verbose();


class HandleDB{
	constructor(options){
		this.databaseFile = options && options.databaseFile || './data/markdownald.db';
		this.tableName = options && options.tableName || 'notes';
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
    databaseFile: './data/markdownald.db',
    tableName: 'notes'
});

db.connectDataBase().then((result)=>{
    console.log(result);
    // create table
    let sentence = `
       create table if not exists ${db.tableName}(
            Note_id int(50) PRIMARY KEY, 
            Username varchar(255),
            Notename varchar(255),
            Notepath varchar(255),
            Contents varchar(255)

        );`;
    return db.createTable(sentence);
}).then((result)=>{
    console.log(result);
    doSql();
}).catch((err)=>{
    console.error(err);
});

let doSql = function() {

    // Add(['1', 'hdk', 'note1', '/CSE208','hdk cold']);
    // Add(['2', 'dkh', 'sep', '/CSE204','cold cold']);
    // Add(['3', 'hdk', 'note2', '/GRE', 'so so cold']);
    // Select('hdk');
    // Delete(1);
    // Update(['modified cold',2]);
    // Select('dkh');
}

	function Add(param){
	    db.sql(`insert into ${db.tableName} (Note_id, Username, Notename, Notepath, Contents) values(?, ?, ?, ?, ?)`,
	        param).then((res)=>{
	        console.log(res);
	    }).catch((err)=>{
	        console.log(err);
	    });
	}
   
    // delete
	function Delete(param){
	    db.sql(`delete from ${db.tableName} where Note_id = ?`, param).then((res)=>{
	        console.log(res);
	    }).catch((err)=>{
	        console.log(err);
	    });
	}
    
    // update
	function Update(param){  
	    db.sql(`update ${db.tableName} set Contents= ? where Note_id = ?`, param).then((res)=>{
	        console.log(res);
	    }).catch((err)=>{
	        console.log(err);
	    });
	}
    // select
	function Select(param){
	    db.sql(`select * from ${db.tableName} where Username = ?`, param, 'all').then((res)=>{
	        console.log(res);
	    }).catch((err)=>{
	        console.log(err);
	    });
	};







