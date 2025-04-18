// userController.js

import jwt from 'jsonwebtoken';
import { User_log } from '../user/mypage/User_log_modules.js'; // 유저 로그 객체 생성
import UserDAO from '../DAO/userDAO.js'; // 유저 로그 생성용
import pool from '../db/db.js';
import axios from 'axios';

export async function Created_log(user, ip = 'unknown', location = 'default'){
  // 🔥 로그인 로그 객체 생성
  const loginLog = new User_log({
    user_id: user.user_id,
    ip: ip || 'unknown',
    location,
    login_type: user.user_type
  });

  // 🔥 로그 DB에 저장 (비동기 처리)
  try {
    await UserDAO.insertUser_log(loginLog);
    console.log('📝 로그인 로그 저장 완료!');
  } catch (error) {
    console.error('❌ 로그인 로그 저장 실패:', error);
  }

}
export function issueToken(user) {
  console.log('🧪 JWT에 넣을 user_id:', user.user_id);
  console.log('🧪 JWT에 넣을 user_name:', user.user_name); // 여기서 undefined면 문제임
  switch(user.user_type) {
    case 0 :
      console.log('🧪 JWT에 넣을 user_type: 0 관리자');
      break;
    case 1 :
      console.log('🧪 JWT에 넣을 user_type: 1 일반');
      break;
    case 2 :
      console.log('🧪 JWT에 넣을 user_type: 2 카카오');
      break;
    case 3 :
      console.log('🧪 JWT에 넣을 user_type: 3 네이버');
      break;
  }
  console.log('🧪 JWT에 넣을 user_email:', user.user_email);
  console.log('🧪 JWT에 넣을 user_social:', user.user_social);
  switch(user.membership) {
    case 'inactive' :
      console.log('🧪 JWT에 넣을 membership: inactive비활성화');break;
    case 'active' :
      console.log('🧪 JWT에 넣을 membership: active활성화');break;
    case 'pending' :
      console.log('🧪 JWT에 넣을 membership: pending결제 보류');break;
  }
  console.log('🧪 JWT에 넣을 birth_date:', user.birth_date);
  console.log('🧪 JWT에 넣을 created_at:', user.created_at);
  console.log('🧪 JWT에 넣을 updated_at:', user.updated_at);
  console.log('🧪 JWT에 넣을 profile_url:', user.profile_url);
  return jwt.sign(
    {
      user_id: user.user_id,
      user_name: user.user_name,
      user_type: user.user_type,
      user_email: user.user_email,
      user_social: user.user_social,
      membership: user.membership,
      birth_date: user.birth_date,
      created_at: user.created_at,
      updated_at: user.updated_at,
      profile_url: user.profile_url
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

export async function getIPLocation(req) {
  let ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

  // 로컬 IP인 경우 처리 (예: ::1 또는 127.0.0.1)
  if (ip === '::1' || ip === '127.0.0.1') {
    ip = '8.8.8.8'; // 구글 DNS IP로 대체 (로컬호스트에서 실제 외부 API 테스트)
  }

  // console.log(`IP: ${ip}`); // IP 출력 (디버깅용)

  // IP를 기반으로 위치 정보를 가져옴
  const { city, region, country } = await getLocationByIP(ip);

  // 위치 정보를 하나의 문자열로 결합
  const location = `${city}, ${region}, ${country}`;

  // console.log(`Location: ${location}`); // 위치 정보 출력 (디버깅용)

  return { ip, location };

}

async function getLocationByIP(ip) {
  try {
    const response = await axios.get(`http://ip-api.com/json/${ip}`);
    if (response.data && response.data.status === 'success') {
      return {
        city: response.data.city,      // 도시
        region: response.data.region,  // 지역
        country: response.data.country // 국가
      };
    }
    return { city: 'Unknown', region: 'Unknown', country: 'Unknown' };
  } catch (error) {
    console.error('IP 위치 조회 오류:', error);
    return { city: 'Unknown', region: 'Unknown', country: 'Unknown' };
  }
}

const userController = { issueToken, getIPLocation, Created_log };
export default userController;