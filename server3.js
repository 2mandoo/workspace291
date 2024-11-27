//MySQL + Node.js 접속 코드
// const mysql = require('mysql');
// const conn = mysql.createConnection({
//     host : 'localhost', // 포트는 default 로 3306. 바꿀 시엔 명시해줘야 함
//     user : 'root',
//     password : '123456',
//     database : 'book_db' 
// });
// conn.connect();

//MongoDB + Node.js 접속 코드
const mongoClient = require('mongodb').MongoClient;
const ObjId = require('mongodb').ObjectId;
const url = 'mongodb+srv://mjgd:aksen9292ezr@cluster0.bhw0j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
let mydb;

mongoClient.connect(url)
.then(client => {
    console.log('몽고DB 접속 성공');

    mydb = client.db('myboard');

    app.listen(8080, function(){
        console.log('포트 8080으로 서버 대기중...');
    })
})
.catch(err => {
    console.log(err);
})


const express = require('express'); //express 라이브러리 통해 express import
const app = express(); //express 함수 통해 app 객체 (서버객체) 생성


const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true})) // 미들웨어 : use라는 메서드를 사용하는 라이브러리 

//ejs(템플릿 엔진) 설정
app.set('view engine', 'ejs');

app.use(express.static('public')); // 미들웨어. 정적인 파일들은 public(관습적 네이밍)으로!

// 세션 관리
let session = require('express-session');
// 미들웨어 설정
app.use(session({
    secret : 'qrqr23r', // 세션 아이디를 암호화 하기 위한 재료 값
    resave : false, // 세션 접속할 때 마다, 새로운 세션 식별자를 발급하지 않겠다
    saveUninitialized : true // 세션 사용 전에는 식별자 발급하지 않겠다
}))

app.get('/session', function(req, res){
    if(isNaN(req.session.milk)){ // 처음에 undefined
        req.session.milk = 0;
    }

    req.session.milk = req.session.milk = 1000;
    res.send('session : ' + req.session.milk + "원");
})
// 쿠키 기반으로 동작하기는 하지만, 데이터는 서버에 저장되어 있고 주고받지 않음

// default ip 127.0.0.1
// app.listen(8080, function(){
//     console.log('포트 8080으로 서버 대기중...');
// })

// get 방식의 라우터
app.get('/', function(req, res){
    // res.send('\
    //     <html>\
    //     <body>\
    //         <h1>홈입니다.</h1>\
    //         <marquee>트럼프님. 반갑습니다.</marquee>\
    //     </body>\
    //     </html>\
    //     ');

    // __dirname :: 현재 디렉토리
    res.render('index.ejs');
    // res.sendFile(__dirname + '/index.html');
    // res.send(__dirname + '\\index.html');
})

app.get('/book', function(req, res){
    res.send('도서 목록 관련 페이지입니다.');
})

app.get('/list', function(req, res){
    // conn.query("SELECT * FROM booklist", function(err, rows, field){
    //     if(err) throw err;
    //     console.log(rows);
    // })

    mydb.collection('post').find().toArray()
    .then(result => {
        console.log(result);
        res.render('list.ejs', { data : result }); // 템플릿 엔진에 의해 views/list.ejs 인식함
    })

    //res.sendFile(__dirname + '/list.html');
    
})

app.get('/enter', function(req, res){
    // sendFile은 html만 보낼 수 있음 (렌더링 하는 것이 아니라 파일만 보내는 것)
    // res.sendFile(__dirname + '/enter.html'); 
    res.render('enter.ejs');
})

app.post('/save', function(req, res){
    // 1. 데이터 수신
    //console.log(req.body);
    // 2. 데이터 파싱
    console.log(req.body.title);
    console.log(req.body.content);
    console.log(req.body.someDate);
    // 3. 데이터 저장 (mysql)
    // let query = "insert into booklist values (id, ?, ?, NOW(), 1)";
    // let params = [req.body.title, req.body.content];
    // conn.query(query, params, function(err, result){
    //     if(err) throw err;
    //     console.log('데이터 추가 성공');
    // })

    // 3. 데이터 저장 (mongodb)
    mydb.collection('post').insertOne({
        title : req.body.title,
        content : req.body.content,
        someDate : req.body.someDate
    }).then(result => {
        console.log(result);
        console.log('데이터 추가 성공');
    })
    
    // res.send('데이터 추가 성공');
    res.redirect("/list");
})

app.post('/delete', function(req, res){
    console.log(req.body._id);
    
    req.body._id = new ObjId(req.body._id);
    console.log(req.body._id);

    mydb.collection('post').deleteOne(req.body)
    .then(result => {
        console.log("삭제 완료");
        res.status(200).send();

    }).catch(err => {
        console.log(err);
        res.status(500).send();
    })

})

app.get('/content/:id', function(req, res){
    console.log(req.params.id);
    req.params.id = new ObjId(req.params.id); // 문자열 id를 ObjectId 로 바꿔서 덮어쓰기

    mydb.collection('post')
    .findOne({_id : req.params.id})
    .then(result => {
        console.log(result);
        res.render('content.ejs', {data : result});
    })
})

app.get('/edit/:id', function(req, res){
    console.log(req.params.id);

    // id 로 디비에서 데이터 조회
    req.params.id = new ObjId(req.params.id);

    mydb.collection('post')
    .findOne({_id : req.params.id})
    .then(result => {
        console.log(result);
        res.render('edit.ejs', {data : result});
    })

})

app.post('/edit', function(req, res){
    req.body.id = new ObjId(req.body.id);

    mydb.collection('post').updateOne(
        {
            _id : req.body.id
        }, 
        {
            $set : {title : req.body.title, 
                    content : req.body.content, 
                    someDate : req.body.someDate}
        }
    ).then(result => {
        console.log(result);
        console.log('데이터 수정 성공');
    })
    
    // res.send('데이터 추가 성공');
    res.redirect("/list");
})

// 쿠키 사용
let cookieParser = require('cookie-parser');

// app.use(cookieParser()); // 미들웨어
app.use(cookieParser('qrqr23r')); // 쿠키 암호화

app.get('/cookie', function(req, res){
    let milk = parseInt(req.signedCookies.milk) + 1000;  // 쿠키 암호화
    // let milk = parseInt(req.cookies.milk) + 1000; 

    // 처음 milk가 undefined 이면 + 1000 했을 때 Nan 이 return 되므로 검사 조건 추가
    // undefined + 1000 // NaN
    if(isNaN(milk)) {
        milk = 0;
    }

    res.cookie('milk', milk, {signed : true}); // 쿠키 암호화
    //res.cookie('milk', milk, {maxAge : 1000}); // 쿠키에 값 저장 (1초 동안)
    // res.clearCookie('milk'); // 잘 사용하지는 않음
    res.send('product : ' + milk + "원");
})


app.get('/login', function(req, res){
    console.log(req.session); // user: { userid: 'admin', userpw: 'admin1234' }
    if(req.session.user) {
        console.log("세션 유지");
        res.send('로그인되었습니다.');
    } else {
        res.render('login.ejs');
    }
})

app.post('/login', function(req, res){
    let id = req.body.userid;
    let pw = req.body.userpw;

    mydb.collection('account')
    .findOne({userid : id})
    .then(result => {
        if(result.userpw === pw){
            req.session.user = req.body; // userid, userpw 들어 있는 정보를 세션 객체의 user 에 대입
            console.log("새로운 로그인");
            // res.send('로그인되었습니다.');
            res.render("index.ejs", {user : req.session.user});
        } else {
            res.render('login.ejs');
        }
        console.log(result);
    })
    .catch(err => {
        res.send('존재하지 않는 아이디입니다.');
    })

})
// 로그아웃
app.get('/logout', function(req, res){
    console.log("로그아웃");
    req.session.destroy();
    res.render("index.ejs", {user : null});
})