// 각 클래스들의 메소드들은 필요가 있는가. 필요가 있다. 게임제작 중에는 쓰이지 않는다.
// json 파일로 저장된 게임 데이터를 불러올 때 메소드를 활용해서 불러오기 때문에 메소드들은 필요하다.



class ClassVersion {
    static this_version: string = "0.0.1";
    version: string = "0.0.1";
}



/**
 * 게임데이터
 */
class GameSource extends ClassVersion {
    static id: number = 0;
    static item: object[] = [];           // 아이템 리스트
    static intVar: object[] = [];         // 정수형 변수
    static floatVar: object[] = [];       // 실수형 변수
    static strVars: object[] = [];         // 문자형 변수
    static boolVar: object[] = [];        // 논리형 변수

    // 생성
    createItem() {
        GameSource.item.push(new Item());
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
    name: string;
    description: string;
    type: string;
    iconURL: string;            // 아이템 아이콘 url
    imgURL: string;             // 아이템 상세 이미지 url
    quantity: number;           // 수량
    getItemMessage: string;     // 아이템 획득 시 뜨는 메세지. undefined이면 메시지가 안 뜨게
    // isUniteItem: boolean = false;      // 합칠 수 있는 아이템 여부
    uniteItem: object | null;

    constructor() {
        super()
    }
}



/**
 * 변수 생성기
 */
class IntVar extends ClassVersion {
    name: string;   // 변수명
    value: number;  // 값
    
    constructor(name, value) {
        super()
        this.name = name;
        if(typeof value == 'number') this.value = value;
        else {
            this.value = Number(value);
        };
    }
}
class StrVar extends ClassVersion {
    name: string;   // 변수명
    value: string;  // 값

    constructor(name, value) {
        super()
        this.name = name;
        if(typeof value == 'string') this.value = value;
        else {
            this.value = String(value);
        };
    }
}
class BoolVar extends ClassVersion {
    name: string;   // 변수명
    value: boolean;  // 값

    constructor(name, value) {
        super()
        this.name = name;
        if(typeof value == 'boolean') this.value = value;
        else {
            this.value = Boolean(value);
        };
    }
}



type Role = { planning: string[], art: string[], story: string[], puzzle:string[], mechanic: string[], support: string[]}
enum Theme { horror, adventure, crime }
enum Visibility { "public", unlisted, private }
/**
 * 게임 생성기
 */
class Game extends ClassVersion {
    id: number = Math.floor(Math.random() * 100000000); // DB와 연동
    // version;                    // 유저가 자신의 월드를 버전관리한다? 넣기 애매함
    title: string;                      // 제목
    thumbnailURL: string;               // 게임 썸네일 URL
    description: string;                // 설명
    role: Role = {                    // 제작자 역할
        planning: [],     // 기획
        art: [],          // 그림
        story: [],        // 스토리
        puzzle: [],       // 퍼즐
        mechanic: [],     // 기능
        support: []       // 도움
    }
    theme: Theme;                      // 테마    h(호러)·a(어드벤쳐)·m(미스터리)
    tag: string[] = [];                   // 태그
    difficulty: number;                 // 난이도
    playTime: number;                   // 소요 시간
    visibility: Visibility = Visibility.public;      // 공개 여부 public(공개)·unlisted(일부공개)·private(비공개)
    isRanking: boolean = false;          // 랭킹 표시 여부
    isHiddenStage: boolean = false;      // 히든 스테이지 여부
    achievement: object[] = [];           // 업적
    inventory: object[] = [];      // 인벤토리
    stage: object[] = [];          // 스테이지

    constructor() {
        super()
        this.stage.push(new Stage());
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
    updateStage() {}
    // 스테이지 삭제
    deleteStage() {}
    
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
    name: string;

    constructor() {
        super()
    }
}


enum StageType { normal, death, ending, hidden }
/**
 * 스테이지 생성기
 */
class Stage extends ClassVersion {
    name: string;
    type: StageType = StageType.normal;               // normal(노말)·death(죽음)·ending(엔딩)·h(히든)
    imgURL: string;             // 이미지 경로
    description: string;        // 설명
    timeLimit: number;          // 스테이지 시간제한
    gateOpen: boolean = true;    // 들어올 수 있는지 여부
    closedGateMessage: string;  // 이동할 수 없는 게이트를 이동하려 할 때 뜨는 메시지. 예시: "{Stage.name}이(가) 잠겼습니다."
    cut: object[] = [];           // 컷

    constructor() {
        super()
        this.cut.push(new Cut());
    }

    // 컷 생성
    createCut() {
        this.cut.push(new Cut());
    }
    // 컷 수정
    updateCut() {}
    // 컷 삭제
    deleteCut() {}
    // 스테이지 연결하기
    connectStage(obj) {
        if(!this.connectedStage) this.connectedStage = [];
        if(obj) this.connectedStage.push(obj);
    }
}


enum CutType { normal, puzzle, moving, fail }
/**
 * 컷 생성기
 */
class Cut extends ClassVersion {
    name: string;           // 상하·동서남북으로도 이름지을 수 있겠다
    type: CutType = CutType.normal;           // n(노말)·p(퍼즐)·m(스테이지 이동)·f(실패)·
    imgURL: string;         // 이미지 url
    timeLimit: number;      // 시간제한
    // direction;  // 방향: 상·하·동·서·남·북 (유저가 직접 별명 지을 수 있음)

    constructor() {
        super()
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



enum PuzzleType { choice, form, dial, }
/**
 * 퍼즐 생성기
 */
class Puzzle extends ClassVersion {
    name: number;
    type: PuzzleType;
    answer: any[] = [];
    correct_answer: any[] = [];
    chance: number | null;
    hint: any[] = [];
    constructor() {
        super()
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
    name;
    time;
    condition;  // 조건
    // 강제 컷 진행
    static forcedCutProgress() {}
}



// 모듈 내보내기
export { ClassVersion, GameSource, Game, Stage, Cut }