import { useState } from "react";
import { Game, Stage } from "../../modules/game-modules"
import "../styles/workspace.css"
import GameForm from "./GameForm";
import FrontData from "./FrontData";

export default function Workspace() {
    const [t002, sett002] = useState(new Game(
        /* 제목 */          "살찾",
        /* 썸네일 */        "https://sdfdsf",
        /* 설명 */          "요원 중에서 숨어있는 살인자를 찾는 게임입니다.",
        /* 테마 */          "c",
        /* 태그 */          ['악어', '컨텐츠'],
        /* 난이도 */        "middle",
        /* 시간 */          10,
        /* 공개 */          0,
        /* 랭킹표시여부 */  false,
        /* 히든여부 */      false,
    ));
    // t002 = new Game()
    // const t001 = new Game();
    // const a = 1131313
    t002.stage[0].name = "오프닝"
    t002.stage[0].type = 'n'
    t002.stage[0].imgURL = "/img/open.jpg"
    t002.stage[0].description = ""
    t002.stage[0].timeLimit = 0
    t002.stage[0].gateOpen = true
    t002.stage[0].closedGateMessage = null

    t002.stage[0].cut[0].name = "표지"
    t002.stage[0].cut[0].type = 'n'
    t002.stage[0].cut[0].imgURL = t002.thumbnailURL

    t002.stage.push(new Stage())
    
    console.log(t002)

    
    function handleSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target)
        const game_title = formData.get("game_title")
        const game_thumbnailURL = formData.get("game_thumbnailURL")
        const game_description = formData.get("game_description")
        const game_theme = formData.get("game_theme")
        const game_tag = formData.get("game_tag")
        const game_difficulty = formData.get("game_difficulty")
        const game_playTime = formData.get("game_playTime")
        const game_visibility = formData.get("game_visibility")
        // const game_isRanking = formData.get("game_isRanking")
        const game_isRanking = false;
        const game_isHiddenStage = false;
        console.log("히든스테", formData.get("game_isHiddenStage"))
        if (formData.get("game_isRanking") == "on") {
            game_isRanking = true
        }
        else {
            game_isRanking = false
        }
        // if (formData.get("game_isHiddenStage") == "on") {
        //     game_isHiddenStage = true
        // }
        // else {
        //     game_isHiddenStage = false
        // }
        // const game_isHiddenStage = formData.get("game_isHiddenStage")
        // if(game_isHiddenStage == "on") game_isHiddenStage = true
        // else game_isHiddenStage = false
        // game_isRanking = (game_isRanking == "on") ? true : false;
        // game_isHiddenStage = game_isHiddenStage == "on" ? true : false;
        // sett002(t002.stage.push(new Stage(
        //     game_title,
        //     game_thumbnailURL,
        //     game_description,
        //     game_theme,
        //     game_tag,
        //     game_difficulty,
        //     game_playTime,
        //     game_visibility,
        //     game_isRanking,
        //     game_isHiddenStage
        // )))
        const data = [
            game_title,
            game_thumbnailURL,
            game_description,
            game_theme,
            game_tag,
            game_difficulty,
            game_playTime,
            game_visibility,
            game_isRanking,
            game_isHiddenStage
        ]
        console.log("랭킹", game_isRanking)
        console.log(data)
    }
    return(
        <>
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>제목
                        <input type="text" name="game_title" />
                    </label>
                </div>
                <div>
                    <label>썸네일
                        <input type="text" name="game_thumbnailURL" />
                    </label>
                </div>
                <div>
                    <label>설명
                        <textarea type="text" name="game_description" />
                    </label>
                </div>
                <div>
                    <label>테마
                        <select name="game_theme" id="">
                            <option value="horror">호러</option>
                            <option value="adventure">모험</option>
                            <option value="criminal">추리</option>
                        </select>
                    </label>
                </div>
                <div>
                    <label>태그
                        <input type="text" name="game_tag" />
                    </label>
                </div>
                <div>
                    <label>난이도
                        <select name="game_difficulty" id="">
                            <option value="easy">쉬움</option>
                            <option value="middle">보통</option>
                            <option value="hard">어려움</option>
                        </select>
                    </label>
                </div>
                <div>
                    <label>예상소요시간
                        <input type="number" name="game_playTime" step={10}/>
                    </label>
                </div>
                <div>
                    <label>공개 여부
                        <select name="game_visibility" id="">
                            <option value="public">공개</option>
                            <option value="unlisted">일부공개</option>
                            <option value="private">비공개</option>
                        </select>
                    </label>
                </div>
                <div>
                    <label>랭킹 여부
                        <input type="checkbox" name="game_isRanking" />
                    </label>
                </div>
                <div>
                    <label>히든 여부
                        <input type="checkbox" name="game_isHiddenStage" />
                    </label>
                </div>
                <button type="submit">스테이지 추가</button>
            </form>
        </div>
        <FrontData game={t002}/>
        </>
    )
}