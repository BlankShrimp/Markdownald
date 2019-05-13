var net = require('net');
const { ipcRenderer } = require('electron')
var fs = require('fs');

function reg(userid, passwd, nickname) {
	var client = new net.Socket();
	var msg = `{"instruction":"reg", "userid":"${userid}", "passwd":"${passwd}", "nickname":"${nickname}"}`;
	client.connect(4687, '101.132.106.166', () => {
		client.write(msg);
	})

	client.on('data', function (data) {
		fs.writeFile('temp.txt', data, function (err) {
		})
	});

	client.on('error', function (error) {
		client.destroy();
	});

	client.on('close', function () {
	});
}

function addNote(userid, passwd, noteid, title, folderid, value) {
	var client = new net.Socket();
	var msg = `{"instruction":"add_note", "userid":"${userid}", "passwd":"${passwd}", "noteid":${noteid}, "title":"${title}", "folderid":${folderid}, "value":"${value}"}`;
	client.connect(4687, '101.132.106.166', () => {
		client.write(msg);
	})

	client.on('data', function (data) {
		fs.writeFile('temp.txt', data, function (err) {
		})
	});

	client.on('error', function (error) {
		client.destroy();
	});

	client.on('close', function () {
	});
}

function delNote(userid, passwd, noteid) {
	var client = new net.Socket();
	var msg = `{"instruction":"del_note", "userid":"${userid}", "passwd":"${passwd}", "noteid":${noteid}}`;
	client.connect(4687, '101.132.106.166', () => {
		client.write(msg);
	})

	client.on('data', function (data) {
		fs.writeFile('temp.txt', data, function (err) {
		})
	});

	client.on('error', function (error) {
		client.destroy();
	});

	client.on('close', function () {
	});
}

function selNote(userid, passwd, noteid) {
	var client = new net.Socket();
	var msg = `{"instruction":"sel_note", "userid":"${userid}", "passwd":"${passwd}", "noteid":${noteid}}`;
	client.connect(4687, '101.132.106.166', () => {
		client.write(msg);
	})

	client.on('data', function (data) {
		fs.writeFile('temp.txt', data, function (err) {
		})
	});

	client.on('error', function (error) {
		client.destroy();
	});

	client.on('close', function () {
	});
}

function upNote(userid, passwd, noteid, title, folderid, value) {
	var client = new net.Socket();
	var msg = `{"instruction":"up_note", "userid":"${userid}", "passwd":"${passwd}", "noteid":${noteid}, "title":"${title}", "folderid":${folderid}, "value":"${value}"}`;
	client.connect(4687, '101.132.106.166', () => {
		client.write(msg);
	})

	client.on('data', function (data) {
		fs.writeFile('temp.txt', data, function (err) {
		})
	});

	client.on('error', function (error) {
		client.destroy();
	});

	client.on('close', function () {
	});
}

function addFolder(userid, passwd, folderid, foldername, parentid) {
	var client = new net.Socket();
	var msg = `{"instruction":"add_folder", "userid":"${userid}", "passwd":"${passwd}", "folderid":${folderid}, "foldername":"${foldername}", "parentid":${parentid} }`;
	client.connect(4687, '101.132.106.166', () => {
		client.write(msg);
	})

	client.on('data', function (data) {
		fs.writeFile('temp.txt', data, function (err) {
		})
	});

	client.on('error', function (error) {
		client.destroy();
	});

	client.on('close', function () {
	});
}

function delFolder(userid, passwd, folderid) {
	var client = new net.Socket();
	var msg = `{"instruction":"del_folder", "userid":"${userid}", "passwd":"${passwd}", "folderid":${folderid}}`;
	client.connect(4687, '101.132.106.166', () => {
		client.write(msg);
	})

	client.on('data', function (data) {
		fs.writeFile('temp.txt', data, function (err) {
		})
	});

	client.on('error', function (error) {
		client.destroy();
	});

	client.on('close', function () {
	});
}

function selFolder(userid, passwd, folderid) {
	var client = new net.Socket();
	var msg = `{"instruction":"sel_folder", "userid":"${userid}", "passwd":"${passwd}", "folderid":${folderid}}`;
	client.connect(4687, '101.132.106.166', () => {
		client.write(msg);
	})

	client.on('data', function (data) {
		fs.writeFile('temp.txt', data, function (err) {
		})
	});

	client.on('error', function (error) {
		client.destroy();
	});

	client.on('close', function () {
	});
}

function upFolder(userid, passwd, folderid, foldername, parentid) {
	var client = new net.Socket();
	var msg = `{"instruction":"up_folder", "userid":"${userid}", "passwd":"${passwd}", "folderid":${folderid}, "foldername":"${foldername}", "parentid":${parentid} }`;
	client.connect(4687, '101.132.106.166', () => {
		client.write(msg);
	})

	client.on('data', function (data) {
		fs.writeFile('temp.txt', data, function (err) {
		})
	});

	client.on('error', function (error) {
		client.destroy();
	});

	client.on('close', function () {
	});
}

function selNotes(userid, passwd) {
	var client = new net.Socket();
	var msg = `{"instruction":"sel_notes", "userid":"${userid}", "passwd":"${passwd}" }`;
	client.connect(4687, '101.132.106.166', () => {
		client.write(msg);
	})

	client.on('data', function (data) {
		fs.writeFile('temp.txt', data, function (err) {
		})
	});

	client.on('error', function (error) {
		client.destroy();
	});

	client.on('close', function () {
	});
}

function selFolders(userid, passwd) {
	var client = new net.Socket();
	var msg = `{"instruction":"sel_folders", "userid":"${userid}", "passwd":"${passwd}" }`;
	client.connect(4687, '101.132.106.166', () => {
		client.write(msg);
	})

	client.on('data', function (data) {
		fs.writeFile('temp.txt', data, function (err) {
		})
	});

	client.on('error', function (error) {
		client.destroy();
	});

	client.on('close', function () {
	});
}

module.exports = {
	reg,
	addNote,
	delNote,
	selNote,
	upNote,
	addFolder,
	delFolder,
	selFolder,
	upFolder,
	selNotes,
	selFolders
}
