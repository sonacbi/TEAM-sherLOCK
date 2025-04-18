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
class User_log extends ClassVersion {
  log_id;      // 고유키, 자동상승
  user_id;      // 사용자 고유 id. 20자까지 입력가능.
  ip;    // 현재 접속한 ip
  created_at;   // 계정 생성 일시 
  location;   // 접속 지역
  login_type;  // 로그인한 타입을 받음 0 관리자 1 일반 2 카카오 3 네이버


  constructor({
    log_id,
    user_id,
    ip,
    created_at = new Date(),
    location = 'default',
    login_type
  }) {
    super();
    this.log_id = log_id;
    this.user_id = user_id;
    this.ip = ip;
    this.created_at = created_at;
    this.location = location;
    this.login_type = login_type;
  }
}

// 모듈 내보내기
export { ClassVersion, UserSource, User_log }