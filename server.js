// require("dotenv").config();
import express from 'express'
import mysql from 'mysql2'
import cors from 'cors'

const app = express();
app.use(cors()); // CORS 허용
app.use(express.json()); // JSON 요청 처리

// MySQL 연결
const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "0000",
  database: "sherlock",
});

db.connect((err) => {
  if (err) {
    console.error("MySQL 연결 실패:", err);
  } else {
    console.log("MySQL 연결 성공!");
  }
});

// 데이터 가져오는 API
app.get("/data", (req, res) => {
  db.query(req, (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
    }
  });
});

app.listen(5000, () => {
  console.log("서버 실행 중 (포트 5000)");
});