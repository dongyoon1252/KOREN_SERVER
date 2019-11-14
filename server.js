var express = require('express')
,   http = require('http')
,   path = require('path');

var net = require('net');

var bodyParser = require('body-parser')
,   cookieParser = require('cookie-parser')
,   static = require('serve-static')
,   errorHandler = require('errorhandler');

var expressErrorHandler = require('express-error-handler');

var expressSession = require('express-session');

var app = express();

var server = net.createServer(function(socket){
    console.log(socket.address().address + "connected.");
    socket.write('server response.');
    

})

//server.on(router.route('/process/addsignal').post(), function(socket){
//        setInterval(function(){
//        socket.write(road01);
//        socket.write(road02);
//        socket.write(road03);
//        socket.write(road04);
//    }, 1000)
//})

server.on('error', function(err){
    console.log('err'+err);
});
server.listen(5000, function(){
    console.log('TCP server listening on port 5000');
    
    
    socket.write(road01 + '\n');
    socket.write(road02 + '\n');
    socket.write(road03 + '\n');
    socket.write(road04 + '\n');
})



app.set('port', process.env.PORT || 3000);
app.use(bodyParser.urlencoded({extended:false})); // 여기 빼먹어서 실행안됐었음 ㅅㅂ개 소름
app.use(bodyParser.json());
app.use('/public', static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(expressSession({
    secret:'my key',
    resave:true,
    saveUninitialized:true
}));

var MongoClient = require('mongodb').MongoClient;

var database;

function connectDB(){
    var databaseUrl = 'mongodb://localhost:27017/local.signal';
    
    MongoClient.connect(databaseUrl, function(err, db){
        if(err) throw err;
        
        console.log('데이터베이스에 연결되었습니다. : '+databaseUrl);
        
        database = db.db('local'); //mongodb 3.0 이후 버전은 DB명 명시해야 함 db.db('DB명');
        
    });
}

var router = express.Router();

router.route('/process/signal').post(function(req, res){
    console.log('/process/signal 호출됨');
    
    var road01 = req.body.road01 || req.query.road01;
    var road02 = req.body.road02 || req.query.road02;
    var road03 = req.body.road03 || req.query.road03;
    var road04 = req.body.road04 || req.query.road04;
    
    
    
    if(database){
        authUser(database, road01, road02, road03, road04, function(err, docs){
            if(err) {throw err;}
            
            if(docs){
                console.dir(docs);
                var username = docs[0].name;
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h1>신호 추가 성공</h1>');
                res.write('<div><p>1번 신호 : '+road01+'</p></div>');
                res.write('<div><p>2번 신호 : '+road02+'</p></div>');
                res.write('<div><p>3번 신호 : '+road03+'</p></div>');
                res.write('<div><p>4번 신호 : '+road04+'</p></div>');
                res.write("<br><br><a href='/public/signal.html'>신호 추가하기</a>");
                res.end();
            } else {
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h1>신호 추가 실패 실패</h1>');
                res.write('<div><p>신호를 다시 확인하십시오.</p></div>');
                res.write("<br><br><a href='/public/signal.html'>신호 추가하기</a>");
                res.end();
            }
        });
    } else {
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.write('<div><p>데이터베이스에 연결하지 못했습니다.</p></div>');
        res.end();
    }
});

router.route('/process/addsignal').post(function(req, res, socket){
    console.log('/process/addsignal 호출됨.');
    
    var road01 = req.body.road01 || req.query.road01;
    var road02 = req.body.road02 || req.query.road02;
    var road03 = req.body.road03 || req.query.road03;
    var road04 = req.body.road04 || req.query.road04;
    
//    socket.write(road01 + '\n');
//    socket.write(road02 + '\n');
//    socket.write(road03 + '\n');
//    socket.write(road04 + '\n');
    
    console.log('요청 파라미터 : '+road01+', '+road02+', '+road03 + ', '+road04);
    
    if(database){
        addSignal(database, road01, road02, road03, road04, function(err, result){
            if(err) {throw err};
            
            if(result){
                console.dir(result);
                console.log(result.insertedCount);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>신호 추가 성공</h2>');
                res.write('<h2>1번 도로 : ' + road01 + '</h2>');
                res.write('<h2>2번 도로 : ' + road02 + '</h2>');
                res.write('<h2>3번 도로 : ' + road03 + '</h2>');
                res.write('<h2>4번 도로 : ' + road04 + '</h2>');
                res.end();
                } else {
                console.dir(result);
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>신호 추가 실패</h2>');
                res.end();
            }
        });
    } else {
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.end();
    }
});

app.use('/', router);


var errorHandler = expressErrorHandler({
    static:{
        '404':'./public/404.html'
    }
});



var addSignal = function(database, road01, road02, road03, road04, callback){
    console.log('addSingal 호출됨 : ' + road01 + ', '+ road02+ ', '+ road03+', '+road04);
    
    var signal = new SignalModel({"road01":road01,"road02":road02,"road03":road03,"road04":road04});
    
    signal.save(function(err){
        if(err){
            callback(err,null);
            return;
        }
        console.log("신호 데이터 추가함.");
        callback(null, signal);
    });
};

var mongoose = require('mongoose');

var database;
var UserSchema;
var UserModel;
function connectDB(){
    var databaseUrl = 'mongodb://localhost:27017/local';
    
    console.log('데이터베이스 연결을 시도합니다.');
    mongoose.Promise = global.Promise;
    mongoose.connect(databaseUrl);
    database = mongoose.connection;
    
    database.on('error', console.error.bind(console, 'mongoose connection error.'));
    database.on('open', function(){
        console.log('데이터베이스에 연결되었습니다. : ' +databaseUrl);
        UserSchema = mongoose.Schema({
            road01: String,
            road02: String,
            road03: String,
            road04: String
        });
        console.log('UserSchema 정의함.');
        
        SignalModel = mongoose.model("signals", UserSchema);
        console.log('SignalModel 정의함.');
    });
    
    database.on('disconnected', function(){
        console.log('연결이 끊어졌습니다. 5초 후 다시 연결합니다.');
        setInterval(connectDB, 5000);
    });
}

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

//Server Start
http.createServer(app).listen(app.get('port'), function(){
    console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));
    
    connectDB();
});