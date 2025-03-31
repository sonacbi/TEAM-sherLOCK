import { version } from "react";

class World {
    constructor(id, title, theme, visibility, func) {
      this.id = id;
      this.title = title;
      this.theme = theme;
      this.visibility = visibility;
      this.makeFunc(func);
    }

    makeFunc(func) {
        this.funcdata = func;
        this.func = function(funcdata) {
            funcdata.name
        }
    }
  
    toJSON() {
      return JSON.stringify({
        id: this.id,
        title: this.title,
        theme: this.theme,
        visibility: this.visibility,
      });
    }
  
    static fromJSON(json) {
      const data = JSON.parse(json);
      const world = new World(data.id, data.title, data.theme, data.visibility);
      return world;
    }
}

// 사용 예시
const world = new World(25825818, "살인자를 찾아라", "h", "public");
const jsonStr = world.toJSON();
console.log(jsonStr); // JSON 문자열로 변환

const restoredWorld = World.fromJSON(jsonStr);
console.log(restoredWorld); // "살인자를 찾아라"



function SaveCreatingGameData (GameData, Game, game, Stage, Cut, Item, IntVar, StrVar, BoolVar, Achievement, Puzzle) {
  const classVersion = {
    GameData: GameData.class_version,
    Game: Game.class_version,
    Stage: Stage.class_version,
    Cut: Cut.class_version,
    Item: Item.class_version,
    IntVar: IntVar.class_version,
    StrVar: StrVar.class_version,
    BoolVar: BoolVar.class_version,
    Achievement: Achievement.class_version,
    Puzzl: Puzzle.class_version
  }
  const GameData = {
    item: GameData.item,
    intVar: GameData.intVar,
    floatVar: GameData.floatVar,
    strVar: GameData.strVar,
    boolVar: GameData.boolVar
  }
  const Game = {
    id: game.id,
    version: game.version,
    title: game.title,
    thumbnailURL: game.thumbnailURL,
    description: game.description,
    theme: game.theme,
    tag: game.tag,
    postscript: game.postscript,
    playTime: game.playTime,
    visibility: game.visibility,
    isRanking: game.isRanking,
    isHiddenStage: game.isHiddenStage,
    achievement: Game.achievement,
    stage: Game.stage
  }
  return(classVersion, GameData, Game);
}
