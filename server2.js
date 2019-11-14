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
    
        
    socket.write(00030000000100010 + '\n');
    socket.write(00030010010100001 + '\n');
    socket.write(00030020010200000 + '\n');
    socket.write(00030030010300001 + '\n');
    

})

server.on('error', function(err){
    console.log('err'+err);
});
server.listen(5000, function(){
    console.log('TCP server listening on port 5000');
    

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




var router = express.Router();

router.route('/process/signal').post(function(req, res){
    console.log('/process/signal 호출됨');
    
    var road01 = req.body.road01 || req.query.road01;
    var road02 = req.body.road02 || req.query.road02;
    var road03 = req.body.road03 || req.query.road03;
    var road04 = req.body.road04 || req.query.road04;
    
    
});

router.route('/process/addsignal').post(function(req, res, socket){
    console.log('/process/addsignal 호출됨.');
    
    var road01 = req.body.road01 || req.query.road01;
    var road02 = req.body.road02 || req.query.road02;
    var road03 = req.body.road03 || req.query.road03;
    var road04 = req.body.road04 || req.query.road04;
    
    console.log('요청 파라미터 : '+road01+', '+road02+', '+road03 + ', '+road04);
    
    
    addSignal(road01, road02, road03, road04, function(err, result){
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

});

app.use('/', router);


var errorHandler = expressErrorHandler({
    static:{
        '404':'./public/404.html'
    }
});







app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

//Server Start
http.createServer(app).listen(app.get('port'), function(){
    console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));
    
   
});