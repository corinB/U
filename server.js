const express =require('express');
const app = express();
const bodyParser = require('body-parser');
const Db = require('mongodb/lib/db');
const MongoClient = require('mongoDB').MongoClient;
const methodoverride = require('method-override')
app.use(methodoverride('_method'))




var db;
MongoClient.connect('mongodb+srv://qor:0989@ais.smqldtl.mongodb.net/?retryWrites=true&w=majority', function(err, client){
    if (err) return console.log(err);
    db = client.db('test');

    app.listen('3000', function(){
      console.log('listening on 3000')
    });
  })

let multer = require('multer');
var storage = multer.diskStorage({

  destination : function(req, file, cb){
    cb(null, 'imege')
  },
  filename : function(req, file, cb){
    cb(null, file.originalname )
  }

});


app.use(bodyParser.urlencoded({extended : true}));

var path = require('path');

var upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
            return callback(new Error('PNG, JPG만 업로드하세요'))
        }
        callback(null, true)
    },
    limits:{
        fileSize: 1024 * 1024
    }
});

app.use(express.static(path.join(__dirname, 'front/build')));

app.post('/add',upload.single('image'),function(res,req){
    console.log(res.body) 
    db.collection('counter').findOne({name:'w_list'}, function(err, result){
        var w_count = result.no

        db.collection("list").insertOne(
          { _id: w_count + 1, 제목: res.body.title, 내용: res.body.data },
          function (err, result) {
            console.log("저장완료");
            db.collection("counter").updateOne(
              { name: "w_list" },
              { $inc: { no: 1 } },
              function (err, result) {
                if (err) {
                  return console.log(err);
                }
              }
            );
          }
        );
    });
    req.send('업로드완료')
});

// 항상 아래쪽에 놓아야함
app.get('/', function (res, req) {
    req.sendFile(path.join(__dirname, '/front/build/index.html'));
  });
