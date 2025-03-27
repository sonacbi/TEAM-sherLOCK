import React from 'react';
import '../styles/MainPage.css';
import { useEffect, useState } from "react";
import axios from "axios";


function SqlPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const world = `SELECT * FROM world;`;
    axios.get("http://localhost:5000/data", world)
      .then((response) => setData(response.data))
      .catch((error) => console.error("데이터 가져오기 실패:", error));
  }, []);

  const world1 = `SELECT * FROM world`;
  const data1 = axios.get("http://localhost:5000/data", world1)
    .then((response) => setData(response.data))
    .catch((error) => console.error("데이터 가져오기 실패:", error));

  console.log(data1)
  return (
    <div className='SqlPage-wrap'>
      <h1>mysql 데이터 가져오기</h1>
      <ul>
        {data1.length > 0 ? (
          data1.map((item, index)=>{
            <li key={index}>{JSON.stringify(item)}</li>
          })
        ) : (
          <li>로딩 중...</li>  // 데이터가 없을 때 대체할 내용
        )
        }
      </ul>
      <ul>{data1.map((item)=>{
        <li>{data1.created_at}</li>
      })}
      </ul>
      <h1>{data1[0].created_at}</h1>
    </div>
  );
}

export default SqlPage;