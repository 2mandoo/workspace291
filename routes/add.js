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


router.get('/enter', function(req, res){
    res.render('enter.ejs');
})


// 외부파일을 server.js 에서 참조해야 하기 때문에 export 해줘야 함
module.exports = router;