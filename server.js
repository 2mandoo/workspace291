//MySQL + Node.js 접속 코드
// const mysql = require('mysql');
// const conn = mysql.createConnection({
//     host : 'localhost', // 포트는 default 로 3306. 바꿀 시엔 명시해줘야 함
//     user : 'root',
//     password : '123456',
//     database : 'book_db' 
// });
// conn.connect();
const dotenv = require('dotenv').config();


//MongoDB + Node.js 접속 코드
const mongoClient = require('mongodb').MongoClient;
const ObjId = require('mongodb').ObjectId;
const url = process.env.DB_URL;
let mydb;

mongoClient.connect(url)
.then(client => {
    console.log('몽고DB 접속 성공');

    mydb = client.db('myboard');

    // app.listen(process.env.PORT, function(){
    //     console.log('포트 8080으로 서버 대기중...');
    // })
    http.listen(process.env.PORT, function(){
        console.log('포트 8080으로 서버 대기중...');
    })
})
.catch(err => {
    console.log(err);
})

// 변수
let imagePath = '';

const express = require('express');
const app = express();

// 소켓 io 세팅
const http = require('http').createServer(app);
const {Server} = require('socket.io');
const io = new Server(http);

// 암호화
const sha = require('sha256');

//0-1024, 65535
//body-parser 라이브러리 추가
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true})); //미들웨어
//ejs 설정
app.set('view engine', 'ejs');
app.use("/public", express.static('public'));

// 라우터 설정
// 사용자 요청이 들어왔을 때 이 경로의 파일을 참조해라
app.use('/', require('./routes/post.js'));
app.use('/', require('./routes/auth.js'));
app.use('/', require('./routes/add.js'));


//세션 관리
let session = require('express-session');

//미들웨어 설정
app.use(session({
    secret : '39fd09u29fh0937r90f',
    resave : false,
    saveUnintialized : true 
}))

app.get('/session', function(req, res){
    if(isNaN(req.session.milk)){
        req.session.milk = 0;
    }

    req.session.milk = req.session.milk + 1000;
    res.send("session : " + req.session.milk + "원");
})




app.get('/book', function(req, res){
    res.send('도서 목록 관련 페이지입니다.');
})

// app.get('/list', function(req, res){
//     // conn.query("select * from booklist", function(err, rows, field){
//     //     if(err) throw err;
//     //     console.log(rows);
//     // });
//     mydb.collection('post').find().toArray().then(result=>{
//         console.log(result);
//         res.render('list.ejs',{ data : result } );
//     })
//     // res.sendFile(__dirname + '/list.html');
// })

//홈입니다.
app.get('/', function(req, res){
    // res.sendFile(__dirname + '/index.html');
    
    if (req.session.user) {
        console.log("세션 유지");
        //res.send('로그인 되었습니다.');
        res.render("index.ejs", { user: req.session.user });
      } else {
        console.log("user : null");
        res.render("index.ejs", { user: null });
      }
})

// app.get('/enter', function(req, res){
//     // res.sendFile(__dirname + '/enter.ejs');
//     res.render('enter.ejs');
// })

app.post('/save', function(req, res){
    console.log('저장완료');
    // 1. 데이터 수신
    console.log(req.body);
    // 2. 데이터 파싱
    console.log(req.body.title);
    console.log(req.body.content);
    console.log(req.body.someDate);
    // 3. MySQL DB 저장
    // let sql = "insert into booklist (title, description, created, author_id) values (?, ?, NOW(), 1)";
    // let params = [req.body.title, req.body.content];
    // conn.query(sql, params, function(err, result){
    //     if(err) throw err;
    //     console.log('데이터 추가 성공');
    // });
    //4. 몽고DB에 저장
    mydb.collection('post').insertOne(
        {
            title : req.body.title, 
            content : req.body.content, 
            someDate : req.body.someDate,
            path : imagePath 
        }
    )
    .then(result=>{
        console.log(result);
        console.log('데이터 추가 성공');
    });

    res.redirect('/list');
});

app.post('/delete', function(req, res){
    console.log(req.body._id);

    req.body._id = new ObjId(req.body._id);
    
    mydb.collection('post').deleteOne(req.body)
    .then(result=>{
        console.log('삭제 완료');
        res.status(200).send();
    }).catch(err=>{
        console.log(err);
        res.status(500).send();
    })
})

// app.get('/content/:id', function(req, res){
//     console.log(req.params.id);

//     req.params.id = new ObjId(req.params.id);
//     mydb.collection('post')
//     .findOne({_id : req.params.id})
//     .then((result)=>{
//         console.log(result);
//         res.render('content.ejs', {data : result});
//     })
// })

// app.get('/edit/:id', function(req, res){
//     console.log(req.params.id);

//     //몽고DB id를 통해서 게시물 조회
//     req.params.id = new ObjId(req.params.id);
//     mydb.collection('post')
//     .findOne({_id : req.params.id})
//     .then((result)=>{
//         console.log(result);
//         res.render('edit.ejs', {data : result});
//     })
// })


app.post('/edit', function(req, res){
    console.log('수정완료');

    console.log(req.body.id);
    req.body.id = new ObjId(req.body.id);

    //4. 몽고DB에 저장
    mydb.collection('post').updateOne(
        {_id : req.body.id}, 
        {$set : {title : req.body.title, 
            content : req.body.content, someDate : req.body.someDate
        }}
    )
    .then(result=>{
        console.log(result);
        console.log('데이터 수정 성공');
    });

    res.send('데이터 수정 성공');
});

//쿠키 사용
let cookieParser = require('cookie-parser');

app.use(cookieParser('dkfjaskdhjsdhfklhsafkj')); //미들웨어

app.get('/cookie', function(req, res){

    let milk = parseInt(req.signedCookies.milk) + 1000;
    
    if(isNaN(milk)){
        milk = 0;
    }

    res.cookie('milk', milk, {signed : true});
    res.send('product : ' + milk + "원");
})



app.get('/login', function(req, res){
    console.log(req.session);
    if(req.session.user){
        console.log('세션 유지')
        res.render('index.ejs', { user : req.session.user })
    }else{
        res.render('login.ejs');
    }
    
})

app.post('/login', function(req, res){
    console.log(req.body.userid);
    console.log(req.body.userpw);

    mydb.collection('account')
    .findOne({userid : req.body.userid})
    .then((result)=>{
        if(result.userpw == sha(req.body.userpw)){
            req.session.user = req.body;
            console.log('새로운 로그인');
            res.render('index.ejs', { user : req.session.user })
        }else{
            res.render('login.ejs');
        }
    }).catch(err=>{
        console.log('아이디가 틀렸습니다.')
        res.render('login.ejs');
    })
})

app.get('/logout', function(req, res){
    console.log("로그아웃");
    req.session.destroy();
    res.render('index.ejs', {user : null});
})
//================================================11/25
app.get('/signup', function(req, res){
    res.render('signup.ejs');
})

app.post('/signup', function(req, res){
    console.log(req.body.userid);
    console.log(req.body.userpw);

    mydb.collection('account').insertOne({
        userid : req.body.userid, 
        userpw : sha(req.body.userpw), 
        usergroup : req.body.usergroup,
        useremail : req.body.useremail,
    })
    .then(result=>{
        console.log(result);
        console.log('회원가입 성공');
    });
    res.render("index.ejs", { user: null });
})

//================================================11/26
// npm install multer
// 사진을 하드디스크(diskStorage)에 저장? 메모리(memoryStorage)에 저장?
let multer = require('multer');

// 하드디스크에 저장
let storage = multer.diskStorage({
    destination : function(req, file, done) {
        done(null, './public/image');
    },
    filename : function(req, file, done) {
        done(null, file.originalname);
    }
})

let upload = multer({storage:storage});



app.post('/photo', upload.single('picture'), function(req, res){
    console.log(req.file.path);
    imagePath = `\\${req.file.path}`;
})

app.get('/search', function(req, res){
    console.log(req.query.value);
    mydb.collection('post')
    .find({
        title : req.query.value
    })
    .toArray()
    .then(result => {
        console.log(result);
        res.render('sresult.ejs', {data: result});
    })
})

// 웹소켓
app.get('/socket', function(req, res){
    res.render('socket.ejs');
})

// 누가 웹소켓 접속하면 실행됨
io.on('connection', function(socket){
    console.log('클라이언트 접속');

    socket.on('joinroom', function(data){
        socket.join('room1');
        io.to('room1').emit('broadcast', 'room1에 입장하셨습니다.');

    })

    socket.on('room1-send', function(data){
        io.to('room1').emit('broadcast', data);
    })


    //socket.on(식별키, 콜백함수);
    socket.on('user-send', function(data){
        console.log(data);
        // io.emit(식별키, 메시지);
        io.emit('broadcast', data);
        // io.to(socket.id).emit('broadcast', data); // 해당 아이디로만 메시지 보낼 수 있음
    })
})