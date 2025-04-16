// userController.js

import jwt from 'jsonwebtoken';

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
const userController = { issueToken };
export default userController;