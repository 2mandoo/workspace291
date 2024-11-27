// 라우터 기본 설정
var router = require('express').Router();

let mydb;
const mongoClient = require('mongodb').MongoClient;
const ObjId = require('mongodb').ObjectId;
const url = process.env.DB_URL;

mongoClient.connect(url)
.then(client => {
    mydb = client.db('myboard');
})
.catch(err => {
    console.log(err);
})

router.get('/list', function(req, res){
    mydb.collection('post').find().toArray().then(result=>{
        console.log(result);
        res.render('list.ejs',{ data : result } );
    })
})

router.get('/content/:id', function(req, res){
    req.params.id = new ObjId(req.params.id);
    mydb.collection('post')
    .findOne({_id : req.params.id})
    .then((result)=>{
        console.log(result);
        res.render('content.ejs', {data : result});
    })
})

router.get('/edit/:id', function(req, res){
    req.params.id = new ObjId(req.params.id);
    mydb.collection('post')
    .findOne({_id : req.params.id})
    .then((result)=>{
        console.log(result);
        res.render('edit.ejs', {data : result});
    })
})

// 외부파일을 server.js 에서 참조해야 하기 때문에 export 해줘야 함
module.exports = router;