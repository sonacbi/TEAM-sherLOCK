import { version } from "react";
/**
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
*/


function SaveCreatingGameData (ClassVersion, GameSource, Game, game) {
  const classVersion = ClassVersion;
  const gameDataToSave = {
    id: GameSource.id,
    item: GameSource.item,
    intVar: GameSource.intVar,
    floatVar: GameSource.floatVar,
    strVar: GameSource.strVar,
    boolVar: GameSource.boolVar
  }
  const gameToSave = {
    id: game.id,
    version: game.version,
    title: game.title,
    thumbnailURL: game.thumbnailURL,
    description: game.description,
    theme: game.theme,
    tag: game.tag,
    playTime: game.playTime,
    visibility: game.visibility,
    isRanking: game.isRanking,
    isHiddenStage: game.isHiddenStage,
    achievement: game.achievement,
    inventory: game.inventory,
    stage: Game.stage
  }
  console.log(ClassVersion.version)

  return({classVersion, gameDataToSave, gameToSave});
}


export { SaveCreatingGameData }