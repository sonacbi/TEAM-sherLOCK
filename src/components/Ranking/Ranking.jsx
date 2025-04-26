// Ranking.jsx

import React from 'react';
import './Ranking.css';

import Trophy from '../../assets/images/Ranking_img/trophy.png';
import Crown from'../../assets/images/Ranking_img/crown.png';
import Raurel from'../../assets/images/Ranking_img/raurel.png';

function Ranking() {
  const dummyData = [
    { id: 1, name: 'Alice', score: 150 },
    { id: 2, name: 'Bob', score: 120 },
    { id: 3, name: 'Charlie', score: 100 },
    { id: 4, name: 'Char', score: 80 },
    { id: 5, name: 'Bobnamu', score: 80 },
  ];

  // 내림차순으로 자동정렬
  const sortedData = [...dummyData].sort((a, b) => b.score - a.score);

  // 항상 10개를 만들기 위해
  const fullData = [];
  for (let i = 0; i < 10; i++) {
    if (sortedData[i]) {
      fullData.push(sortedData[i]);
    } else {
      fullData.push({ id: i + 1, name: '-', score: '-' }); // 빈 칸 채우기
    }
  }

  return (
    <div className="ranking_container">
      <ul>
      {fullData.map((user, index) => {
        if (index === 0) { // 1위
          return (
            <li key={index} className={`li${index + 1}`}>
              <img className="Crown" src={Crown} alt="Crown" />
              <span className="rank_name">{user.name}</span>
              <span className="rank_score">{user.score}</span>
              <img className="Raurel" src={Raurel} alt="Raurel" />
            </li>
          );
        } else if (index === 1 || index === 2) { // 2위, 3위
          return (
            <li key={index} className={`li${index + 1}`}>
              <img className="Crown_small" src={Crown} alt="Crown" />
              <span className="rank_name">{user.name}</span>
              <span className="rank_score">{user.score}</span>
            </li>
          );
        } else { // 4위~10위
          return (
            <li key={index} className={`li${index + 1}`}>
              <span className="rank_index">{index + 1}</span>
              <span className="rank_name">{user.name}</span>
              <span className="rank_score">{user.score}</span>
            </li>
          );
        }
      })}
  
        {/* 트로피 장식용 한 칸 */}
        <li className="li11">
          <img className='trophy' src={Trophy} alt='Trophy' />
        </li>
  
        {/* 아래 마진용 영역. 추후 열쇠 장식 추가 */}
        <p></p>
      </ul>
    </div>
  );  
}

export default Ranking;
