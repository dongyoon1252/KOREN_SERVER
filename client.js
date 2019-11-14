var net = require('net');

var socket = net.connect({port:5000});
socket.on('connect', function(){
    
});

socket.on('data', function(chunk){
    console.log(chunk);
});

socket.on('end', function(){
    console.log('disconnected.');
});

socket.on('err', function(err){
    console.log(err);
});

socket.on('timeout', function(){
    console.log('connection timeout.');
});