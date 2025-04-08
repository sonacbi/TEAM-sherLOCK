// 각 클래스들의 메소드들은 필요가 있는가. 필요가 있다. 게임제작 중에는 쓰이지 않는다.
// json 파일로 저장된 게임 데이터를 불러올 때 메소드를 활용해서 불러오기 때문에 메소드들은 필요하다.



class ClassVersion {
    static this_version:    string = "0.0.1";                       // 버전
    version:                string = ClassVersion.this_version;     // 모든 클래스에 부여하는 버전
}



type Variable = {
    name:   string,
    value:  number | string | boolean,
}
/**
 * 게임소스
 */
class GameSource extends ClassVersion {
    game_id:     number;
    item:        Item[]      =  [];   // 아이템 리스트
    intVar:      Variable[]  =  [];   // 숫자형 변수
    strVar:      Variable[]  =  [];   // 문자형 변수
    boolVar:     Variable[]  =  [];   // 논리형 변수

    constructor({
        game_id = null,
        item = [],
        intVar = [],
        strVar = [],
        boolVar = []
    }) {
        super();
        this.game_id = game_id;
        this.item = item;
        this.intVar = intVar;
        this.strVar = strVar;
        this.boolVar = boolVar;
    }
    // 생성
    createItem() {
        // GameSource.item.push(new Item());
    }
    // 변수 조작
    getIntVar() {}
    getStrVar() {}
    getBoolVar() {}
    setIntVar() {}
    setStrVar() {}
    setBoolVar() {}
    putIntVar() {}
    putStrVar() {}
    putBoolVar() {}
}



/**
 * 아이템 생성기
 */
class Item extends ClassVersion {
    name:               string;     // 아이템 이름
    description:        string;     // 아이템 설명
    type:               string;     // 아이템 타입 (고민 중...)
    iconURL:            string;     // 아이템 아이콘 url
    imgURL:             string;     // 아이템 상세 이미지 url
    quantity:           number;     // 수량
    getItemMessage:     string;     // 아이템 획득 시 뜨는 메세지. 값이 비어 있으면 메시지가 안 뜨게
    uniteItem:          string[];   // 합칠 수 있는 아이템의 이름으로 받음

    constructor({
        name = '',
        description = '',
        type = '',
        iconURL = '',
        imgURL = '',
        quantity = 1,
        getItemMessage = null,
        uniteItem = []
    }) {
        super()
        this.name = name;
        this.description = description;
        this.type = type;
        this.iconURL = iconURL;
        this.imgURL = imgURL;
        this.quantity = quantity;
        this.getItemMessage = getItemMessage;
        this.uniteItem = uniteItem;
    }
}
/**
 * 변수 생성기
 */
class IntVar extends ClassVersion {
    name:   string;     // 변수명
    value:  number;     // 값
    
    constructor({name = '', value = 0}) {
        super()
        this.name = name;
        this.value = value;
    }
}
class StrVar extends ClassVersion {
    name:   string;     // 변수명
    value:  string;     // 값

    constructor({name = '', value = ''}) {
        super()
        this.name = name;
        this.value = value;
    }
}
class BoolVar extends ClassVersion {
    name:   string;     // 변수명
    value:  boolean;    // 값

    constructor({name = '', value = true}) {
        super()
        this.name = name;
        this.value = value;
    }
}



type Role = {
    planning:   string[],
    art:        string[],
    story:      string[],
    puzzle:     string[],
    mechanic:   string[],
    support:    string[]
}
enum Theme {
    horror    = "horror",
    adventure = "adventure",
    crime     = "crime",
}
enum Difficulty {
    easy   = "easy",
    medium = "medium",
    hard   = "hard",
}
enum Visibility {
    public   = "public",
    unlisted = "unlisted",
    private  = "private",
}
/**
 * 게임 생성기
 */
class GameData extends ClassVersion {
    id:             number;         // MySQL과 연동해서 얻음
    title:          string;         // 제목
    thumbnailURL:   string;         // 게임 썸네일 URL
    description:    string;         // 설명
    role:           Role;           // 각 제작자가 맡은 역할
    theme:          Theme;          // 테마
    tag:            string;         // 태그
    difficulty:     Difficulty;     // 난이도
    playTime:       number;         // 예상 소요 시간
    visibility:     Visibility;     // 공개 여부
    isRanking:      boolean;        // 랭킹 표시 여부
    isHiddenStage:  boolean;        // 히든 스테이지 여부
    achievement:    Achievement[];  // 업적
    inventory:      Item[];         // 인벤토리
    stage:          Stage[];        // 스테이지
    
    constructor({
        id = null,
        title = '',
        thumbnailURL = '',
        description = '',
        role = {
            planning: [],     // 기획
            art: [],          // 그림
            story: [],        // 스토리
            puzzle: [],       // 퍼즐
            mechanic: [],     // 기능
            support: []       // 도움
        },
        theme = Theme.horror,
        tag = '',
        difficulty = Difficulty.medium,
        playTime = 10,
        visibility = Visibility.public,
        isRanking = false,
        isHiddenStage = false,
        achievement = [],
        inventory = [],
        stage = [new Stage({})]
    }) {
        super()
        // this.id = Math.floor(Math.random() * 100000000); 
        // MySQL과 연동하고 아이디가 겹치지 않게 생성해야 돼서, 아이디 생성은 클래스 내에서 하면 안 된다
        this.id = id;
        this.title = title;
        this.thumbnailURL = thumbnailURL;
        this.description = description;
        this.role = role;
        this.theme = theme;
        this.tag = tag;
        this.difficulty = difficulty;
        this.playTime = playTime;
        this.visibility = visibility;
        this.isRanking = isRanking;
        this.isHiddenStage = isHiddenStage;
        this.achievement = achievement;
        this.inventory = inventory;
        this.stage = stage;
    }

    // 업적 생성
    createAchievement() {
        this.achievement.push(new Achievement());
    }
    // 스테이지 생성
    createStage() {
        this.stage.push(new Stage({}));
    }
    // 스테이지 수정
    updateStage() {}
    // 스테이지 삭제
    deleteStage() {}
    
    // 인벤토리 조작
    getItem(item) {
        this.inventory.push(item);
    }
    setItem(i) {
        this.inventory[i];
    }
    putItem() {}
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


enum StageType {
    normal = "normal",
    death  = "death",
    ending = "ending",
    hidden = "hidden",
}
/**
 * 스테이지 생성기
 */
class Stage extends ClassVersion {
    name:               string;
    type:               StageType;      // 스테이지 타입
    imgURL:             string;         // 이미지 경로
    description:        string;         // 설명
    timeLimit:          number;         // 스테이지 시간제한
    gateOpen:           boolean;        // 들어올 수 있는지 여부
    closedGateMessage:  string;         // 진입불가 게이트로 진입 시 뜨는 메시지. 예시: "${Stage.name}이(가) 잠겼습니다."
    connectedStage:     number[];       // 스테이지 인덱스로 연결한다
    cut:                Cut[];          // 컷

    constructor({
        name = '',
        type = StageType.normal,
        imgURL = '',
        description = '',
        timeLimit = 0,
        gateOpen = true,
        closedGateMessage = null,
        connectedStage = [],
        cut = [new Cut({})],
    }) {
        super()
        this.name = name;
        this.type = type;
        this.imgURL = imgURL;
        this.description = description;
        this.timeLimit = timeLimit;
        this.gateOpen = gateOpen;
        this.closedGateMessage = closedGateMessage;
        this.connectedStage = connectedStage;
        this.cut = cut;
    }

    // 컷 생성
    createCut() {
        this.cut.push(new Cut({}));
    }
    // 컷 수정
    updateCut() {}
    // 컷 삭제
    deleteCut() {}
    // 스테이지 연결하기
    connectStage(i) {
        this.connectedStage.push(i);
    }
}


enum CutType {
    normal = "normal",
    puzzle = "puzzle",
    moving = "moving",
    fail   = "fail",
}
/**
 * 컷 생성기
 */
class Cut extends ClassVersion {
    name:           string;     // 상하·동서남북으로도 이름지을 수 있겠다
    type:           CutType;    // 컷 타입
    imgURL:         string;     // 이미지 url
    timeLimit:      number;     // 컷 시간제한
    puzzle:         Puzzle;     // 퍼즐
    connectedCut:   number[];   // 컷 인덱스와 연결한다

    constructor({
        name = '',
        type = CutType.normal,
        imgURL = '',
        timeLimit = null,
        puzzle = null,
        connectedCut = [],
    }) {
        super();
        this.name = name;
        this.type = type;
        this.imgURL = imgURL;
        this.timeLimit = timeLimit;
        this.puzzle = puzzle;
        this.connectedCut = connectedCut;
    }
    setVar() {}
    // 컷 연결하기
    connectCut(i) {
        this.connectedCut.push(i);
    }
    createPuzzle() {
        this.puzzle = new Puzzle({});
    }
}



enum PuzzleType {
    choice = "choice",
    form = "form",
    dial = "dial",
}
/**
 * 퍼즐 생성기
 */
class Puzzle extends ClassVersion {
    name:               string;
    type:               PuzzleType;
    chance:             number;
    answer:             any[];
    correct_answer:     any[];
    hint:               any[];
    constructor({
        name = '',
        type = PuzzleType.choice,
        chance = null,
        answer = [],
        correct_answer = [],
        hint = [],
    }) {
        super()
        this.name = name;
        this.type = type;
        this.chance = chance;
        this.answer = answer;
        this.correct_answer = correct_answer;
        this.hint = hint;
    }
    createPuzzle() {
        switch(this.type) {
            case PuzzleType.choice:  // 선택지
                // 선택지 생성 코드
                break;
            case PuzzleType.form:
                // 텍스트 입력 생성 코드
                break;
            case PuzzleType.dial:    // 다이얼
                // 다이얼 생성 코드
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
export { ClassVersion, GameSource, GameData, Stage, Cut }