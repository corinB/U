const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var db;
MongoClient.connect('mongodb+srv://qor:0989@ais.smqldtl.mongodb.net/?retryWrites=true&w=majority', function (err, client) {
  if (err) return console.log(err);
  db = client.db('test');

  app.listen('3000', function () {
    console.log('listening on 3000');
  });
});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'image';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);     
  },
  filename: function (req, file, cb) {
    const newFileName = req.body.title + path.extname(file.originalname);
    cb(null, newFileName);
  }
});

var upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
      return callback(new Error('PNG, JPG만 업로드하세요'));
    }
    callback(null, true);
  },
  limits: {
    fileSize: 1024 * 1024
  }
});

app.use(express.static(path.join(__dirname, 'front/build')));

app.post('/add', upload.single('image'), function(req, res) {
  console.log(req.body); // 요청의 본문(body) 출력
  console.log(req.file); // 업로드된 파일 정보 출력

  // 파일 정보 확인
  if (!req.file) {
    console.log('파일이 업로드되지 않았습니다.');
  } else {
    // 업로드된 파일의 경로 확인
    console.log('업로드된 파일 경로:', req.file.path);
  }


  // 이미지 파일은 req.file에서 사용 가능
  // 나머지 데이터는 req.body에서 사용 가능

  db.collection('counter').findOne({ name: '계시물갯수' }, function (err, result) {
    var w_count = result.totalpost;
    db.collection('qor').insertOne(
      {
        _id: w_count + 1,
        제목: req.body.title,
        내용: req.body.data,
        날짜1: req.body.day1,
        날짜2: req.body.day2,
        이미지 : req.file.path
      },
      function (err, result) {
        console.log('저장완료');
        db.collection('counter').updateOne(
          { name: '계시물갯수' },
          { $inc: { totalpost: 1 } },
          function (err, result) {
            if (err) {
              return console.log(err);
            }
          }
        );
      }
    );
  });

  res.send('업로드완료');
});



// 항상 아래쪽에 놓아야함
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/front/build/index.html'));

  db.collection('qor').find().toArray(function(err, result){
    console.log(result);
    res.render('PostFilter.jsx', {posts : result}); 
  });
  
});