import React from 'react';
import '../styles/MainPage.css';
import { useEffect, useState } from "react";
import axios from "axios";


export default function SqlPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const world = { query: `SELECT * FROM game;` };
    axios.post("http://localhost:5000/data", world)
      .then((response) => setData(response.data))
      .catch((error) => console.error("데이터 가져오기 실패:", error));
  }, []);
  // useEffect(() => {
  //   axios.get("http://localhost:5000/data1")
  //     .then((response) => {setData(response.data); console.log('데이타: ', response.data)})
  //     .catch((error) => console.error("데이터 가져오기 실패:", error));
  // }, []);

  console.log(data)
  return (
    <div className='SqlPage-wrap'>
      <h1>mysql 데이터 가져오기</h1>
      {data.length > 0 ? (
        data.map((item)=>{
          {console.log('gma: ', item)}
          {item.user_id}
          return(<ul>
            <li>{item.game_id}</li>
            <li>{item.user_id}</li>
            <li>{item.view}</li>
            <li>{item.like}</li>
            <li>{item.grade_list}</li>
            <li>{item.created_at}</li>
            <li>{item.updated_at}</li>
          </ul>)
        })
      ) : (
        <li>로딩 중...</li>  // 데이터가 없을 때 대체할 내용
      )
      }
      <ul>
        {data.map((item)=>(
          <li><h1>{item.created_at}</h1></li>
        ))}
      </ul>
    </div>
  );
}