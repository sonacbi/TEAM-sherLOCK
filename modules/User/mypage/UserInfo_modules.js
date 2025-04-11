class ClassVersion {
  static this_version = "0.0.1";
  version = "0.0.1";
}

/**
* 유저데이터
*/
class UserSource extends ClassVersion {
  static id = 0;
  static item = [];
  static intVar = [];
  static floatVar = [];
  static strVar = [];
  static boolVar = [];

  // 생성 예시
  createUser() {
    this.User.push(new User());
  }

  // 🔍 조회
  static getIntVar(key) {
    return this.intVar.find(v => v.key === key)?.value ?? null;
  }
  static getStrVar(key) {
    return this.strVar.find(v => v.key === key)?.value ?? null;
  }
  static getBoolVar(key) {
    return this.boolVar.find(v => v.key === key)?.value ?? null;
  }

  // ✏️ 수정 또는 추가
  static setIntVar(key, value) {
    const idx = this.intVar.findIndex(v => v.key === key);
    if (idx >= 0) this.intVar[idx].value = value;
    else this.intVar.push({ key, value });
  }
  static setStrVar(key, value) {
    const idx = this.strVar.findIndex(v => v.key === key);
    if (idx >= 0) this.strVar[idx].value = value;
    else this.strVar.push({ key, value });
  }
  static setBoolVar(key, value) {
    const idx = this.boolVar.findIndex(v => v.key === key);
    if (idx >= 0) this.boolVar[idx].value = value;
    else this.boolVar.push({ key, value });
  }

  // ❌ 삭제
  static putIntVar(key) {
    this.intVar = this.intVar.filter(v => v.key !== key);
  }
  static putStrVar(key) {
    this.strVar = this.strVar.filter(v => v.key !== key);
  }
  static putBoolVar(key) {
    this.boolVar = this.boolVar.filter(v => v.key !== key);
  }
}



/**
* 유저 정보 생성
*/
class User extends ClassVersion {
  user_id;      // 사용자 고유 id. 20자까지 입력가능. 추가 10자는 소셜 연동 아이디에 부여하는 용도
  user_pw;      // 해쉬 값으로 저장. 소셜 회원은 비워둠
  /* 프론트 : 비밀번호 칸에 유저 입력이 없는 상태면 로그인 버튼이 활성화되지 않게 */
  user_name;    // 타인에게 공개될 유저 닉네임. 16자까지
  /* 프론트 : 수정 가능하게 할지, 불가능하게 할지 */
  user_type;    // 0 'admin', 1 'general', 2 'kakao', 3 'naver' -- 유저 유형 구분
  user_email;   // 소셜은 자동 입력, 일반 회원은 회원가입시 입력 (비밀번호 찾기 지원용) !!중복불가!!
  /* 백 : 간편회원가입할 때 이메일 정보받아오기, 일반회원가입시 '이메일 인증'으로 회원가입 유도 */
  membership;   // active '활성화', inactive '비활성화', pending '결제 보류'. default 'inactive'
  birth_date;   // 필수 입력 아님 . 로그와 함께 마케팅용 자료
  /* 프론트 : 오늘 이후의 날짜를 입력할 수 없도록 유효성 검사 추가 */
  created_at;   // 계정 생성 일시 
  updated_at;   // 계정 수정 일시
  deleted;      // 탈퇴 여부 체크 (0 : 활성, 1 : 탈퇴처리)


  constructor(user_id, user_pw, user_name, user_type, user_email, membership, birth_date, created_at, updated_at, deleted) {
      super()
  }
}






// 모듈 내보내기
export { ClassVersion, UserSource, User }