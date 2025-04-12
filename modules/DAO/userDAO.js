import pool from '../db/db.js';

class UserDAO {
  /* 유저 아이디를 기반으로 서버에 접속. 유저가 실제로 있는지 검증 (deleted = 1 미노출) */
  static async findById(user_id) { 
    const [rows] = await pool.query('SELECT * FROM userinfo WHERE user_id = ? AND deleted = 0', [user_id]);
    return rows[0];
  }
 // 소셜 회원가입 로직 추가 (중복 확인 후)
  static async registerUser(user_id, user_email, kakaoAccount) {
    // 카카오 사용자 정보로부터 필요한 값 추출
    const user_pw = null; // 카카오는 비밀번호가 없으므로 null 처리
    const user_name = user_email.split('@')[0]; // 카카오에서 닉네임 가져오기
    const user_type = 2; // 소셜 로그인 타입 (카카오 2)
    const membership = 'inactive'; // 필요한 경우, 기본값 설정
    const birth_date = null; // 카카오에서 생년월일을 가져올 수 있으면 추가
    const created_at = new Date(); // 현재 시간으로 설정
    const updated_at = new Date(); // 현재 시간으로 설정
    const deleted = 0; // 삭제되지 않은 사용자로 설정
    const user_social = { kakao : kakaoAccount.id }; // 소셜 로그인 정보
    const profile_url = 'dafault'; // 카카오 프로필 이미지 URL

    // user_social 객체를 문자열로 변환하여 저장
    const user_social_stringified = JSON.stringify(user_social);


    // 먼저 user_id가 중복되는지 확인 (이메일 또는 소셜 정보도 중복될 수 있음)
    const existingUser = await this.checkDuplicateSocial(user_id, user_email,user_social_stringified);
    
    console.log("로그인 에러 체크");
    if (existingUser) {
      // 이미 가입된 유저가 있을 경우, 해당 유저로 로그인하도록 처리
      return existingUser;  // 로그인 된 유저 반환
    }
    console.log("회원가입 에러 체크");
    const user = {
      user_id,
      user_pw,
      user_name,
      user_type,
      user_email,
      membership,
      birth_date,
      created_at,
      updated_at,
      deleted,
      user_social_stringified,
      profile_url
    }
    // 사용자 정보 저장 로직
    await this.insertUser(user);  // 'this'로 호출, 정적 메소드에서 사용
    return user;
  }
  
  /* 소셜 회원가입용 검증 로직 */
  static async checkDuplicateSocial(user_id, email, user_social_str) {
    const existingUser = await this.findById(user_id); // 단일 객체 리턴됨
    if (existingUser) {
      console.log("이미 존재하는 user_id:", existingUser);
      return existingUser; // ← 이게 문제라면 조건 더 정밀히 해야 함
    }

    let parsedSocial = {};
    try {
      parsedSocial = JSON.parse(user_social_str);
    } catch (err) {
      console.error("user_social JSON 파싱 오류:", err);
    }

    // 2. user_social이 객체 형태인지 확인
    const kakaoEmail = parsedSocial.kakao || null;
    const naverEmail = parsedSocial.naver || null;

    // user_id, email, user_social의 중복 여부를 확인
    // JSON 타입 필드 중복 검사도 수정 필요
    const [rows] = await pool.query(`
      SELECT COUNT(*) AS count
      FROM userinfo
      WHERE user_email = ?
        OR JSON_UNQUOTE(JSON_EXTRACT(user_social, '$.kakao')) = ?
        OR JSON_UNQUOTE(JSON_EXTRACT(user_social, '$.naver')) = ?
    `, [email, kakaoEmail, naverEmail]); // ← 여기도 구조 맞게 넘겨야 함

      if (rows[0].count > 0) {
      console.log("소셜 중복 유저 발견:", rows[0]);
      return rows[0]; // 중복된 유저 반환
    }
    console.log("중복없음");
    return null; // 중복 없음
  }




  /* 입력받은 데이터 객체를 기반으로 db에 넣음 */
  static async insertUser(user) {
    try {
      const {
        user_id, user_pw, user_name, user_type, user_email, user_social,
        membership, birth_date, created_at, updated_at, profile_url, deleted
      } = user;

      // user_social이 null이 아니면 처리
      const social = user_social ? JSON.stringify(user_social) : null; // null 처리 추가
  
      await pool.query(
        `INSERT INTO userinfo 
          (user_id, user_pw, user_name, user_type, user_email, user_social, membership, birth_date, created_at, updated_at, profile_url, deleted) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [user_id, user_pw, user_name, user_type, user_email, social, membership, birth_date, created_at, updated_at, profile_url, deleted]
      );
    } catch (err) {
      console.error("User insert failed:", err);
      throw err;  // 라우터 쪽에서 500 에러 등으로 응답할 수 있도록
    }
  }
  

  /* 유저 아이디를 기반으로 해당 열을 '삭제' */
  // 실제 삭제 (사용주의)
  static async deleteUser(user_id) {
    await pool.query('DELETE FROM userinfo WHERE user_id = ? and deleted = 1', [user_id]);
  }

  // 소프트 삭제
  static async softdeleteUser(user_id){
    await pool.query('UPDATE userinfo SET deleted=1 WHERE user_id = ?', [user_id]);
  }


  // 유저 정보 업데이트 (닉네임, 이메일, 멤버십, 생일)
  static async updateUser(user) {
    await pool.query(
      `UPDATE userinfo 
      SET user_name = ?, user_email = ?, membership = ?, birth_date = ?
      WHERE user_id = ?`,
      [user.user_name, user.user_email, user.membership, user.birth_date, user.user_id]
    );
  }

  // 비밀번호 수정 (비밀번호는 해시된 값으로 들어온다고 가정)
  static async updatePassword(user_id, user_pw) {
    await pool.query(
      `UPDATE userinfo SET user_pw = ? WHERE user_id = ?`,
      [user_pw, user_id]
    );
  }


}

export default UserDAO;
