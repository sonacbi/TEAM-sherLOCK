// import { ClassVersion, GameSource, Game, Stage, Cut } from "./game-modules.js";
import { Game } from "./game-modules.js";
import { SaveCreatingGameData } from "./save-data.js";

new Game

const t001 = new Game(
    /* 제목 */          "살찾",
    /* 썸네일 */        "https://sdfdsf",
    /* 설명 */          "요원 중에서 숨어있는 살인자를 찾는 게임입니다.",
    /* 테마 */          "c",
    /* 태그 */          [],
    /* 난이도 */        "middle",
    /* 시간 */          10,
    /* 공개 */          0,
    /* 랭킹표시여부 */  false,
    /* 히든여부 */      false
);

// console.log("🚀 ~ t001:", Game.version)

// console.log(t001)
t001.createStage()
t001.stage[0].type = "n"
t001.stage[0].cut[0].type = "p"

const a = SaveCreatingGameData(ClassVersion, GameSource, Game, t001)


// console.log(Game)

console.log(a.classVersion)
console.log(a.gameDataToSave)
console.log(a.gameToSave)