// 각 클래스들의 메소드들은 필요가 있는가. 필요가 있다. 게임제작 중에는 쓰이지 않는다.
// json 파일로 저장된 게임 데이터를 불러올 때 메소드를 활용해서 불러오기 때문에 메소드들은 필요하다.
class ClassVersion {
    constructor() {
        this.version = ClassVersion.this_version; // 모든 클래스에 부여하는 버전
    }
}
ClassVersion.this_version = "0.0.1"; // 버전
/**
 * 게임소스
 */
class GameSource extends ClassVersion {
    constructor() {
        super(...arguments);
        this.game_id = null;
        this.item = []; // 아이템 리스트
        this.intVar = []; // 숫자형 변수
        this.strVar = []; // 문자형 변수
        this.boolVar = []; // 논리형 변수
    }
    // 생성
    createItem() {
        // GameSource.item.push(new Item());
    }
    // 변수 조작
    getIntVar() { }
    getStrVar() { }
    getBoolVar() { }
    setIntVar() { }
    setStrVar() { }
    setBoolVar() { }
    putIntVar() { }
    putStrVar() { }
    putBoolVar() { }
}
/**
 * 아이템 생성기
 */
class Item extends ClassVersion {
    constructor() {
        super();
        this.name = ''; // 아이템 이름
        this.description = ''; // 아이템 설명
        this.type = ''; // 아이템 타입 (고민 중...)
        this.iconURL = ''; // 아이템 아이콘 url
        this.imgURL = ''; // 아이템 상세 이미지 url
        this.quantity = 1; // 수량
        this.getItemMessage = null; // 아이템 획득 시 뜨는 메세지. 값이 비어 있으면 메시지가 안 뜨게
        this.uniteItem = null; // 합칠 수 있는 아이템의 이름으로 받음
    }
}
/**
 * 변수 생성기
 */
class IntVar extends ClassVersion {
    constructor() {
        super();
        this.name = ''; // 변수명
        this.value = 0; // 값
    }
}
class StrVar extends ClassVersion {
    constructor() {
        super();
        this.name = ''; // 변수명
        this.value = ''; // 값
    }
}
class BoolVar extends ClassVersion {
    constructor() {
        super();
        this.name = ''; // 변수명
        this.value = true; // 값
    }
}
var Theme;
(function (Theme) {
    Theme["horror"] = "horror";
    Theme["adventure"] = "adventure";
    Theme["crime"] = "crime";
})(Theme || (Theme = {}));
var Difficulty;
(function (Difficulty) {
    Difficulty["easy"] = "easy";
    Difficulty["medium"] = "medium";
    Difficulty["hard"] = "hard";
})(Difficulty || (Difficulty = {}));
var Visibility;
(function (Visibility) {
    Visibility["public"] = "public";
    Visibility["unlisted"] = "unlisted";
    Visibility["private"] = "private";
})(Visibility || (Visibility = {}));
/**
 * 게임 생성기
 */
class GameData extends ClassVersion {
    constructor() {
        super();
        this.title = ''; // 제목
        this.thumbnailURL = ''; // 게임 썸네일 URL
        this.description = ''; // 설명
        this.role = {
            planning: [], // 기획
            art: [], // 그림
            story: [], // 스토리
            puzzle: [], // 퍼즐
            mechanic: [], // 기능
            support: [] // 도움
        };
        this.theme = Theme.horror; // 테마
        this.tag = ''; // 태그
        this.difficulty = Difficulty.medium; // 난이도
        this.playTime = 10; // 예상 소요 시간
        this.visibility = Visibility.public; // 공개 여부
        this.isRanking = false; // 랭킹 표시 여부
        this.isHiddenStage = false; // 히든 스테이지 여부
        this.achievement = []; // 업적
        this.inventory = []; // 인벤토리
        this.stage = []; // 스테이지
        this.stage.push(new Stage());
        // this.id = Math.floor(Math.random() * 100000000); 
        // MySQL과 연동하고 아이디가 겹치지 않게 생성해야 돼서, 아이디 생성은 클래스 내에서 하면 안 된다
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
    updateStage() { }
    // 스테이지 삭제
    deleteStage() { }
    // 인벤토리 조작
    getItem(item) {
        this.inventory.push(item);
    }
    setItem(i) {
        this.inventory[i];
    }
    putItem() { }
}
/**
 * 업적 생성기
 */
class Achievement extends ClassVersion {
    constructor() {
        super();
    }
}
var StageType;
(function (StageType) {
    StageType["normal"] = "normal";
    StageType["death"] = "death";
    StageType["ending"] = "ending";
    StageType["hidden"] = "hidden";
})(StageType || (StageType = {}));
/**
 * 스테이지 생성기
 */
class Stage extends ClassVersion {
    constructor() {
        super();
        this.name = '';
        this.type = StageType.normal; // 스테이지 타입
        this.imgURL = ''; // 이미지 경로
        this.description = ''; // 설명
        this.timeLimit = 0; // 스테이지 시간제한
        this.gateOpen = true; // 들어올 수 있는지 여부
        this.closedGateMessage = null; // 진입불가 게이트로 진입 시 뜨는 메시지. 예시: "${Stage.name}이(가) 잠겼습니다."
        this.connectedStage = []; // 스테이지 인덱스로 연결한다
        this.cut = []; // 컷
        this.cut.push(new Cut());
    }
    // 컷 생성
    createCut() {
        this.cut.push(new Cut());
    }
    // 컷 수정
    updateCut() { }
    // 컷 삭제
    deleteCut() { }
    // 스테이지 연결하기
    connectStage(i) {
        this.connectedStage.push(i);
    }
}
var CutType;
(function (CutType) {
    CutType["normal"] = "normal";
    CutType["puzzle"] = "puzzle";
    CutType["moving"] = "moving";
    CutType["fail"] = "fail";
})(CutType || (CutType = {}));
/**
 * 컷 생성기
 */
class Cut extends ClassVersion {
    constructor() {
        super();
        this.name = ''; // 상하·동서남북으로도 이름지을 수 있겠다
        this.type = CutType.normal; // 컷 타입
        this.imgURL = ''; // 이미지 url
        this.timeLimit = null; // 컷 시간제한
        this.puzzle = null; // 퍼즐
        this.connectedCut = []; // 컷 인덱스와 연결한다
    }
    setVar() { }
    // 컷 연결하기
    connectCut(i) {
        this.connectedCut.push(i);
    }
    createPuzzle() {
        this.puzzle = new Puzzle();
    }
}
var PuzzleType;
(function (PuzzleType) {
    PuzzleType["choice"] = "choice";
    PuzzleType["form"] = "form";
    PuzzleType["dial"] = "dial";
})(PuzzleType || (PuzzleType = {}));
/**
 * 퍼즐 생성기
 */
class Puzzle extends ClassVersion {
    constructor() {
        super();
        this.name = '';
        this.type = PuzzleType.choice;
        this.chance = null;
        this.answer = [];
        this.correct_answer = [];
        this.hint = [];
        // this.transition = new Transition();
    }
    createPuzzle() {
        switch (this.type) {
            case PuzzleType.choice: // 선택지
                // 선택지 생성 코드
                break;
            case PuzzleType.form:
                // 텍스트 입력 생성 코드
                break;
            case PuzzleType.dial: // 다이얼
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
    // 강제 컷 진행
    static forcedCutProgress() { }
}
// 모듈 내보내기
export { ClassVersion, GameSource, GameData, Stage, Cut };
