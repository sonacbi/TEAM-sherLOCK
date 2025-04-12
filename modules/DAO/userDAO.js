import pool from '../db/db.js';

class UserDAO {
  /* 유저 아이디를 기반으로 서버에 접속. 유저가 실제로 있는지 검증 (deleted = 1 미노출) */
  static async findById(user_id) { 
    const [rows] = await pool.query('SELECT * FROM userinfo WHERE user_id = ? AND deleted = 0', [user_id]);
    return rows[0];
  }
  /* 닉네임이 실제로 있는지 검증 있으면 자동으로 #001, #002 등의 번호 부여 */
  static async findByName(user_name) { 
    const [rows] = await pool.query('SELECT count(*) as i FROM userinfo WHERE user_name = ?', [user_name]);
    const user = rows[0];
    console.log('닉네임 검사 결과:', user);

    return rows[0];
  }

  /* 이미 사용 중인 이메일인지 검증  */
  static async findByEmail(user_email) { 
    const [rows] = await pool.query('SELECT * FROM userinfo WHERE user_email = ?', [user_email]);
    return rows[0];
  }

    

  /* 입력받은 데이터 객체를 기반으로 db에 넣음 */
  static async insertUser(user) {
    try {
      const {
        user_id, user_pw, user_name, user_type, user_email,
        membership, birth_date, created_at, updated_at, deleted
      } = user;
  
      await pool.query(
        `INSERT INTO userinfo 
          (user_id, user_pw, user_name, user_type, user_email, membership, birth_date, created_at, updated_at, deleted) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [user_id, user_pw, user_name, user_type, user_email, membership, birth_date, created_at, updated_at, deleted]
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
