// 각 클래스들의 메소드들은 필요가 있는가. 필요가 있다. 게임제작 중에는 쓰이지 않는다.
// json 파일로 저장된 게임 데이터를 불러올 때 메소드를 활용해서 불러오기 때문에 메소드들은 필요하다.
class ClassVersion {
    constructor() {
        this.version = ClassVersion.this_version; // 모든 클래스에 부여하는 버전
    }
}
ClassVersion.this_version = "0.0.1"; // 버전
/**
 * 게임 생성기
 */
class Game extends ClassVersion {
    constructor({ source = new Source({}), stage = [new Stage({})] }) {
        super();
        this.source = new Source(source);
        this.stage = [];
        stage.map((data) => {
            this.stage.push(new Stage(data));
        });
    }
}
var Theme;
(function (Theme) {
    Theme["horror"] = "horror";
    Theme["adventure"] = "adventure";
    Theme["crime"] = "crime";
})(Theme || (Theme = {}));
var GameInfoType;
(function (GameInfoType) {
    GameInfoType["general"] = "general";
    GameInfoType["PnC"] = "PnC";
})(GameInfoType || (GameInfoType = {}));
var Visibility;
(function (Visibility) {
    Visibility["public"] = "public";
    Visibility["unlisted"] = "unlisted";
    Visibility["private"] = "private";
})(Visibility || (Visibility = {}));
class GameInfo {
    constructor({ id = null, title = '', thumbnail = '', theme = Theme.horror, type = GameInfoType.general, visibility = Visibility.public, description = '', difficulty = 1, playTime = 10, isRanking = false, isHiddenStage = false }) {
        this.id = id;
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
/**
 * 게임소스
 */
class Source extends ClassVersion {
    constructor({ item = [], intVar = [], strVar = [], boolVar = [] }) {
        super();
        this.item = []; // 아이템 리스트
        this.intVar = []; // 숫자형 변수
        this.strVar = []; // 문자형 변수
        this.boolVar = []; // 논리형 변수
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
    constructor({ name = '', description = '', type = '', iconPath = '', imgPath = '', quantity = 1, getItemMessage = null, uniteItem = [] }) {
        super();
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
    constructor({ name = '', value = 0 }) {
        super();
        this.name = name;
        this.value = value;
    }
}
class StrVar extends ClassVersion {
    constructor({ name = '', value = '' }) {
        super();
        this.name = name;
        this.value = value;
    }
}
class BoolVar extends ClassVersion {
    constructor({ name = '', value = true }) {
        super();
        this.name = name;
        this.value = value;
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
    constructor({ name = '', type = StageType.normal, imgPath = '', description = '', timeLimit = 0, gateOpen = true, closedGateMessage = null, connectedStage = [], cut = [new Cut({})], }) {
        super();
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
        });
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
    constructor({ name = '', type = CutType.normal, imgPath = '', timeLimit = null, puzzle = null, connectedCut = [], }) {
        super();
        this.name = name;
        this.type = type;
        this.imgPath = imgPath;
        this.timeLimit = timeLimit;
        this.puzzle = puzzle;
        this.connectedCut = connectedCut;
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
    constructor({ name = '', type = PuzzleType.choice, chance = null, answer = [], correct_answer = [], hint = [], }) {
        super();
        this.name = name;
        this.type = type;
        this.chance = chance;
        this.answer = answer;
        this.correct_answer = correct_answer;
        this.hint = hint;
    }
}
// 모듈 내보내기
export { ClassVersion, Game, GameInfo, Source, Stage, Cut, Theme, Visibility, GameInfoType, StageType, CutType, PuzzleType };
