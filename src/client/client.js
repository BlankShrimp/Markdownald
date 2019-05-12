var net = require('net');

// loginReq("hdk","hdk");
function loginReq(pid,password){

	var client = new net.Socket();
	var request = `{"operate":"login", "pid":"${pid}", "password":"${password}"}`;

	client.connect(9997,'101.132.106.166',function(){
		client.write(request);
	});


	client.on('data',function(data){
		console.log('from server'+ data);
	});

	client.on('error',function(error){

	  console.log('error:'+error);
	  client.destroy();
	});

	client.on('close',function(){
	  console.log('Connection closed');
	});
}


// addNoteReq(7,"hdkk","cold","hdkdh","hdk");
function addNoteReq(nid,title,noteclass,data,pid){
	var client = new net.Socket();
	var request = `{"operate":"addNote", "nid":${nid}, "title":"${title}", "class":"${noteclass}", "data":"${data}", "pid":"${pid}"}`;
	
	client.connect(9997,'101.132.106.166',function(){
		client.write(request);
	});


	client.on('data',function(data){
		console.log('from server'+ data);
	});

	client.on('error',function(error){

	  console.log('error:'+error);
	  client.destroy();
	});

	client.on('close',function(){
	  console.log('Connection closed');
	});
}

// registerReq("lmy","miyaaa","123abc");
function registerReq(pid,name,password){
	var client = new net.Socket();
	var request = `{"operate":"register", "pid":"${pid}", "name":"${name}", "password":"${password}"}`;
	
	client.connect(9997,'101.132.106.166',function(){
		client.write(request);
	});


	client.on('data',function(data){
		console.log('from server'+ data);
	});

	client.on('error',function(error){

	  console.log('error:'+error);
	  client.destroy();
	});

	client.on('close',function(){
	  console.log('Connection closed');
	});
}


// updateNoteReq(0,"dzjmodhdk","goo","dyhdqwdaewvsfervgs");
function updateNoteReq(nid,title,classname,data){
	var client = new net.Socket();
	var request = `{"operate":"updateNote", "nid":${nid}, "title":"${title}", "class":"${classname}", "data":"${data}"}`;
	
	client.connect(9997,'101.132.106.166',function(){
		client.write(request);
	});


	client.on('data',function(data){
		console.log('from server'+ data);
	});

	client.on('error',function(error){

	  console.log('error:'+error);
	  client.destroy();
	});

	client.on('close',function(){
	  console.log('Connection closed');
	});
}

module.exports={
	loginReq,
	addNoteReq,
	registerReq,
	updateNoteReq
}

// var request = `{
// 					"operate":"ogin", 
// 					"pid":"hdk", 
// 					"password":"hdk"
// 				}`;