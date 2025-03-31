class ClassVersion {
    static version = "0.0.1";
}



/**
 * 게임데이터
 */
class GameData extends ClassVersion {
    static item = [];           // 아이템 리스트
    static intVar = [];         // 정수형 변수
    static floatVar = [];       // 실수형 변수
    static strVar = [];         // 문자형 변수
    static boolVar = [];        // 논리형 변수

    // 생성
    createItem() {
        this.item.push(new Item());
    }
    createIntVar() {
        this.intVar.push(new IntVar());
    }
    createStrVar() {
        this.strVar.push(new StrVar());
    }
    createBoolVar() {
        this.boolVar.push(new BoolVar());
    }
    // 변수 조작
    static getIntVar() {}
    static getStrVar() {}
    static getBoolVar() {}
    static setIntVar() {}
    static setStrVar() {}
    static setBoolVar() {}
    static putIntVar() {}
    static putStrVar() {}
    static putBoolVar() {}
}



/**
 * 아이템 생성기
 */
class Item extends ClassVersion {
    name;
    description;
    type;
    iconURL;            // 아이템 아이콘 url
    imgURL;             // 아이템 상세 이미지 url
    quantity;           // 수량
    getItemMessage;     // 아이템 획득 시 뜨는 메세지. undefined이면 메시지가 안 뜨게
    // 합칠 수 있는 아이템 여부

    constructor(name, description, type, iconURL, imgURL, quantity, getItemMessage) {
    }
}



/**
 * 변수 생성기
 */
class IntVar extends ClassVersion {
    name;   // 변수명
    value;  // 값
    
    constructor(name, value) {
        this.name = name;
        if(typeof value == 'number') this.value = value;
        else {
            this.value = Number(value);
        };
    }
}
class StrVar extends ClassVersion {
    name;   // 변수명
    value;  // 값

    constructor(name, value) {
        this.name = name;
        if(typeof value == 'string') this.value = value;
        else {
            this.value = String(value);
        };
    }
}
class BoolVar extends ClassVersion {
    name;   // 변수명
    value;  // 값

    constructor(name, value) {
        this.name = name;
        if(typeof value == 'boolean') this.value = value;
        else {
            this.value = Boolean(value);
        };
    }
}



/**
 * 게임 생성기
 */
class Game extends ClassVersion {
    id = Math.floor(Math.random() * 100000000); // DB와 연동
    version;                    // 유저가 자신의 월드를 버전관리한다? 넣기 애매함
    title;                      // 제목
    thumbnailURL;               // 게임 썸네일 URL
    description;                // 설명
    role = {                    // 제작자 역할
        planning: [],     // 기획
        art: [],          // 그림
        story: [],        // 스토리
        puzzle: [],       // 퍼즐
        mechanic: [],     // 기능
        support: []       // 도움
    }
    theme;                      // 테마    h(호러)·a(어드벤쳐)·m(미스터리)
    tag = [];                   // 태그
    postscript;                 // 후기
    difficulty;                 // 난이도
    playTime;                   // 소요 시간
    visibility = "public";      // 공개 여부 public(공개)·unlisted(일부공개)·private(비공개)
    isRanking = false;          // 랭킹 표시 여부
    isHiddenStage = false;      // 히든 스테이지 여부
    achievement = [];           // 업적
    static inventory = [];      // 인벤토리
    static stage = [];          // 스테이지

    /**
     * 방탈출 월드 생성
     * @param {문자} title 제목
     * @param {문자} thumbnailURL 썸네일URL
     * @param {문자} theme h(호러)·a(어드벤쳐)·m(미스터리)
     */
    constructor(title, thumbnailURL, theme) {
        this.title = title;
        this.thumbnailURL = thumbnailURL;
        this.theme = theme;
        Game.stage.push(new Stage("오프닝"));
    }

    // 업적 생성
    createAchievement() {
        this.achievement.push(new Achievement());
    }
    // 스테이지 생성
    createStage() {
        this.stage.push(new Stage());
    }
    // 스테이지 수정
    updateStage(i) {
    }
    // 스테이지 삭제
    deleteStage(i) {
    }
    
    // 인벤토리 조작
    static getItem(item) {
        this.inventory.push(item);
    }
    static setItem(i) {
        this.inventory[i];
    }
    static putItem(i) {}
}



/**
 * 업적 생성기
 */
class Achievement extends ClassVersion {
    name;

    constructor(name) {
    }
}



/**
 * 스테이지 생성기
 */
class Stage extends ClassVersion {
    name;
    type;               // n(노말)·d(죽음)·e(엔딩)·h(히든)
    imgURL;             // 이미지 경로
    description;        // 설명
    timeLimit;          // 스테이지 시간제한
    gateOpen = true;    // 들어올 수 있는지 여부
    closedGateMessage;  // 이동할 수 없는 게이트를 이동하려 할 때 뜨는 메시지. 예시: "{Stage.name}이(가) 잠겼습니다."
    cut = [];           // 컷

    constructor(name, type, imgURL, description, timeLimit, gateOpen, closedGateMessage) {
        this.cut.push(new Cut());
    }

    // 컷 생성
    createCut() {
        this.cut.push(new Cut());
    }
    // 컷 수정
    updateCut(i) {
        this.cut[i].type = 1;
    }
    // 컷 삭제
    deleteCut(i) {
        this.cut
    }
    // 스테이지 연결하기
    connectStage(obj) {
        if(!this.connectedStage) this.connectedStage = [];
        if(obj) this.connectedStage.push(obj);
    }
}



/**
 * 컷 생성기
 */
class Cut extends ClassVersion {
    name;           // 상하·동서남북으로도 이름지을 수 있겠다
    type;           // n(노말)·p(퍼즐)·m(스테이지 이동)·f(실패)·
    imgURL;         // 이미지 url
    timeLimit;      // 시간제한
    setVar;
    // direction;  // 방향: 상·하·동·서·남·북 (유저가 직접 별명 지을 수 있음)

    constructor() {
    }
    setVar() {}
    // 컷 연결하기
    connectCut(obj) {
        if(!this.connectedCut) this.connectedCut = [];
        if(obj) this.connectedCut.push(obj);
    }
    createPuzzle() {
        this.puzzle = new Puzzle();
    }
}



class Puzzle extends ClassVersion {
    name;
    type;
    answer;
    correct_answer;
    chance = 0;
    hint;
    constructor() {
        this.transition = new Transition();
    }
    createPuzzle() {
        switch(this.type) {
            case "choice":  // 선택지
                // 선택지 생성
                break;
            case "form":
                // 텍스트 입력
                break;
            case "dial":    // 다이얼
                // 다이얼 생성
                break;
            default:
        }
    }
}



/**
 * 생성기
 */
class Transition extends ClassVersion {
    id;
    time;
    condition;  // 조건
    // 강제 컷 진행
    static forcedCutProgress() {}
}



// 모듈 내보내기
// export { GameData, Game, Stage, Cut }