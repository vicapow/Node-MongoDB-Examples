/**
  * Just a simple example using node mongdb-native
  * @author Victor Powell
  */

GLOBAL.DEBUG = true;

sys = require("sys");
assert = require("assert");

//change this to wherever you have mongodb-native installed
MONGODB_PATH = '/Users/victor/Documents/javascript_includes/nodejs/mongodb-native';

var Db = 	require(MONGODB_PATH).Db,
  			Connection = require(MONGODB_PATH).Connection,
			Server = require(MONGODB_PATH).Server,
			// BSON = require('../lib/mongodb').BSONPure;
			BSON = require(MONGODB_PATH).BSONNative;


var stdin = process.openStdin();
var stdout = process.stdout;
stdin.setEncoding('utf8');


//db connection variables
var db = null;
var db_name = "";
var host = process.env['MONGO_NODE_DRIVER_HOST'] != null ? process.env['MONGO_NODE_DRIVER_HOST'] : 'localhost';
var port = process.env['MONGO_NODE_DRIVER_PORT'] != null ? process.env['MONGO_NODE_DRIVER_PORT'] : Connection.DEFAULT_PORT;

//connection variables
var current_collection_name = "";
var current_collection = null;


var input_enabled = true;

function show_prompt(){ 
	stdout.write('prompt: '); 
}

stdin.on('data', function (chunk) {
	if(input_enabled)
	{
		//break apart the chunk of data
		items = chunk.split(/[\s]+/);
		
		//establish a connection to a db
		if(items[0]=="connect" && items[1]=="to")
		{
			db_name = items[2];
			
			
			//get the host paramater
			if(items[3]=="host"){
				host = items[4];
			}else if(items[5]=="host"){
				host = items[6];
			}
			
			//get the port paramater
			if(items[3]=="port"){
				port = items[4];
			}else if(items[5]=="port"){
				port = items[6];
			}
			
			stdout.write('trying to connect to db: '+db_name+' on host: '+host+' using port: '+port+'\n');
			
			db = new Db(db_name, new Server(host, port, {}), {native_parser:true});
			
			input_enabled = false;
			db.open(function(err, db) {
				stdout.write('connected to db: '+db_name+'\n');
				input_enabled = true;
				show_prompt();
			});
			
			
			
		}
		else if(items[0]=="set" && items[1] == "collection" )
		{
			if(db!=null)
			{
				input_enabled = false;
				current_collection_name = items[2];
				stdout.write('tring to set current collection: '+current_collection_name+'\n');
				db.collection(current_collection_name,function(err, collection)
				{
					if(!err)
					{
						current_collection = collection;
						stdout.write("current collection: "+current_collection_name+"\n");
						input_enabled = true;
						show_prompt();
					}
				
					//an error happened
					else
					{
						stdout.write(err+"\n");
					}
				});
			}
			else
			{
				stdout.write("you need to connect to a db before setting a collection\n");
				show_prompt();
			}
		}
		else if(items[0]=="ls"){
			if(current_collection!=null)
			{
				input_enabled = false;
					current_collection.find(function(err, cursor) {
					cursor.each(function(err, item) {
						if(item!=null){
							stdout.write('item: '+JSON.stringify(item)+'\n');
						}else{
							input_enabled = true;
							show_prompt();
						}
					});
				});
			}
			else
			{
				stdout.write("no collection is currently selected\n");
				show_prompt();
			}
		}
		else if(items[0]=="disconnect" || items[0] == "exit")
		{
			stdout.write("closing db connection\n");
			process.exit();
			db.close();
		}
		else
		{
			stdout.write("unrecognized command\n");
			show_prompt();
		}
	}
	else{
		stdout.write("hold up. I'm still working on something else.\n");
	}
});

show_prompt();//show the first prompt message

