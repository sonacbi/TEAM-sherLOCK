// 각 클래스들의 메소드들은 필요가 있는가. 필요가 있다. 게임제작 중에는 쓰이지 않는다.
// json 파일로 저장된 게임 데이터를 불러올 때 메소드를 활용해서 불러오기 때문에 메소드들은 필요하다.



class ClassVersion {
    static this_version:    string = "0.0.1";                       // 버전
    version:                string = ClassVersion.this_version;     // 모든 클래스에 부여하는 버전
}



/**
 * 게임 생성기
 */
class Game extends ClassVersion {
    source:     Source;         // 게임소스
    stage:      Stage[];        // 스테이지
    
    constructor({
        source = new Source({}),
        stage = [new Stage({})]
    }) {
        super()
        this.source = new Source(source);
        this.stage = [];
        stage.map((data)=>{
            this.stage.push(new Stage(data));
        })
    }
}



enum Theme {
    horror    = "horror",
    adventure = "adventure",
    crime     = "crime",
}
enum GameInfoType {
    general = "general",    // 일반
    PnC     = "PnC",        // 포인트 앤 클릭
}
enum Visibility {
    public   = "public",
    unlisted = "unlisted",
    private  = "private",
}
class GameInfo {
    id:             string;         // 아이디
    userId:         string;         // 유저 아이디
    title:          string;         // 제목
    thumbnail:      string;         // 게임 썸네일 주소
    theme:          Theme;          // 테마
    type:           GameInfoType;   // 타입
    visibility:     Visibility;     // 공개 여부
    description:    string;         // 설명
    difficulty:     number;         // 난이도
    playTime:       number;         // 예상 소요 시간
    isRanking:      boolean;        // 랭킹 표시 여부
    isHiddenStage:  boolean;        // 히든 스테이지 여부

    constructor({
        id,
        userId = '',
        title = '',
        thumbnail = '',
        theme = Theme.horror,
        type = GameInfoType.general,
        visibility = Visibility.public,
        description = '',
        difficulty = 1,
        playTime = 10,
        isRanking = false,
        isHiddenStage = false
    }) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.thumbnail = thumbnail;
        this.theme = theme;
        this.type = type;
        this.visibility = visibility;
        this.description = description;
        this.difficulty = difficulty;
        this.playTime = playTime;
        this.isRanking = isRanking;
        this.isHiddenStage = isHiddenStage;
    }
}



type Variable = {
    name:   string,
    value:  number | string | boolean,
}
/**
 * 게임소스
 */
class Source extends ClassVersion {
    item:        Item[]      =  [];   // 아이템 리스트
    intVar:      Variable[]  =  [];   // 숫자형 변수
    strVar:      Variable[]  =  [];   // 문자형 변수
    boolVar:     Variable[]  =  [];   // 논리형 변수

    constructor({
        item = [],
        intVar = [],
        strVar = [],
        boolVar = []
    }) {
        super();
        this.item = item;
        this.intVar = intVar;
        this.strVar = strVar;
        this.boolVar = boolVar;
    }
}



/**
 * 아이템 생성기
 */
class Item extends ClassVersion {
    name:               string;     // 아이템 이름
    description:        string;     // 아이템 설명
    type:               string;     // 아이템 타입 (고민 중...)
    iconPath:           string;     // 아이템 아이콘
    imgPath:            string;     // 아이템 상세 이미지
    quantity:           number;     // 수량
    getItemMessage:     string;     // 아이템 획득 시 뜨는 메세지. 값이 비어 있으면 메시지가 안 뜨게
    uniteItem:          string[];   // 합칠 수 있는 아이템의 이름으로 받음

    constructor({
        name = '',
        description = '',
        type = '',
        iconPath = '',
        imgPath = '',
        quantity = 1,
        getItemMessage = null,
        uniteItem = []
    }) {
        super()
        this.name = name;
        this.description = description;
        this.type = type;
        this.iconPath = iconPath;
        this.imgPath = imgPath;
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
    imgPath:            string;         // 이미지 경로
    description:        string;         // 설명
    timeLimit:          number;         // 스테이지 시간제한
    gateOpen:           boolean;        // 들어올 수 있는지 여부
    closedGateMessage:  string;         // 진입불가 게이트로 진입 시 뜨는 메시지. 예시: "${Stage.name}이(가) 잠겼습니다."
    connectedStage:     number[];       // 스테이지 인덱스로 연결한다
    cut:                Cut[];          // 컷

    constructor({
        name = '',
        type = StageType.normal,
        imgPath = '',
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
        this.imgPath = imgPath;
        this.description = description;
        this.timeLimit = timeLimit;
        this.gateOpen = gateOpen;
        this.closedGateMessage = closedGateMessage;
        this.connectedStage = connectedStage;
        this.cut = [];
        cut.map((data) => {
            this.cut.push(new Cut(data));
        })
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
    imgPath:        string;     // 이미지
    timeLimit:      number;     // 컷 시간제한
    puzzle:         Puzzle;     // 퍼즐
    connectedCut:   number[];   // 컷 인덱스와 연결한다

    constructor({
        name = '',
        type = CutType.normal,
        imgPath = '',
        timeLimit = null,
        puzzle = null,
        connectedCut = [],
    }) {
        super();
        this.name = name;
        this.type = type;
        this.imgPath = imgPath;
        this.timeLimit = timeLimit;
        this.puzzle = puzzle;
        this.connectedCut = connectedCut;
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
}



// 모듈 내보내기
export { ClassVersion, Game, GameInfo, Source, Stage, Cut, Theme, Visibility, GameInfoType, StageType, CutType, PuzzleType }