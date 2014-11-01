var app = require('express')();
var http = require('http').Server(app);
http.listen(3000, '127.0.0.1');

app.get('/', function(req, res){
    res.sendfile('index.html');
});

console.log('Server running at http://127.0.0.1:3000/');
