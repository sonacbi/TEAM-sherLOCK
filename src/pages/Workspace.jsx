import { useEffect, useState } from "react";
import { Game, Stage, Cut } from "../../modules/game-modules"
import "../styles/workspace.css"

export default function Workspace() {
    const [gameData, setGameData] = useState(new Game());
    console.log('ㅌㅅㅌ',gameData)
    // gameData.stage[0].name = "오프닝"
    // gameData.stage[0].type = 'n'
    // gameData.stage[0].imgURL = "/img/open.jpg"
    // gameData.stage[0].description = ""
    // gameData.stage[0].timeLimit = 0
    // gameData.stage[0].gateOpen = true
    // gameData.stage[0].closedGateMessage = null
    // gameData.stage[0].cut[0].name = "표지"
    // gameData.stage[0].cut[0].type = 'n'
    // gameData.stage[0].cut[0].imgURL = gameData.thumbnailURL
    // gameData.stage.push(new Stage())
    
    function updateGameData(event) {
        event.preventDefault();
        const formData = new FormData(event.target)
        const title = formData.get("game_title")
        const thumbnailURL = formData.get("game_thumbnailURL")
        const description = formData.get("game_description")
        const theme = formData.get("game_theme")
        const tag = formData.get("game_tag")
        const difficulty = formData.get("game_difficulty")
        const playTime = formData.get("game_playTime")
        const visibility = formData.get("game_visibility")
        const isRanking = formData.get("game_isRanking") ? true : false;
        const isHiddenStage = formData.get("game_isHiddenStage") ? true : false;
        const data = [
            title,
            thumbnailURL,
            description,
            theme,
            tag,
            difficulty,
            playTime,
            visibility,
            isRanking,
            isHiddenStage
        ]
        console.log("데이터", data)
        setGameData(prev => {
            const newGameData = {
                ...prev,
                title: title,
                thumbnailURL: thumbnailURL,
                description: description,
                theme: theme,
                tag: tag,
                difficulty: difficulty,
                playTime: playTime,
                visibility: visibility,
                isRanking: isRanking,
                isHiddenStage: isHiddenStage
            }
            return newGameData;
        })
    }
    console.log(gameData)

    function createGameStage() {
        setGameData(prev => {
            const newGameData = { ...prev, stage: [...prev.stage, new Stage()] };
            return newGameData;
        });
    }
    function createGameCut(i) {
        setGameData(prev => {
            // 기존 gameData를 복사 (불변성 유지)
            const newGameData = { ...prev };
            // stage 배열도 복사
            newGameData.stage = [...prev.stage];
            // 해당 스테이지가 존재하는지 확인
            if (!newGameData.stage[i]) return prev;
            // 해당 스테이지의 cut을 새로운 Cut으로 설정
            newGameData.stage[i] = { 
                ...newGameData.stage[i], 
                cut: [...(newGameData.stage[i].cut || []), new Cut()] 
            };
            return newGameData;
        });
        console.log("^^");
    }

    return(
        <>
        <div>
            <form onSubmit={updateGameData}>
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
                <button type="submit">게임데이터 수정</button>
            </form>
        </div>
        <div id="game">
            <h1>게임 제목: "{gameData.title}"</h1>
            <table>
                <tbody>
                    <tr>
                        <td>썸네일 경로: </td>
                        <td>{gameData.thumbnailURL}</td>
                    </tr>
                    <tr>
                        <td>설명: </td>
                        <td>{gameData.description}</td>
                    </tr>
                    <tr>
                        <td>테마: </td>
                        <td>{gameData.theme}</td>
                    </tr>
                    <tr>
                        <td>태그: </td>
                        <td>{gameData.tag}</td>
                    </tr>
                    <tr>
                        <td>소요시간: </td>
                        <td>{gameData.playTime}</td>
                    </tr>
                    <tr>
                        <td>공개: </td>
                        <td>{gameData.visibility}</td>
                    </tr>
                    <tr>
                        <td>랭킹?: </td>
                        <td>{gameData.isRanking ? '있음' : '없음'}</td>
                    </tr>
                    <tr>
                        <td>히든?: </td>
                        <td>{gameData.isHiddenStage ? '있음' : '없음'}</td>
                    </tr>
                    <tr>
                        <td>인벤토리: </td>
                        <td>{gameData.inventory ? '있음': '없음'}</td>
                    </tr>
                </tbody>
            </table>
            <button onClick={createGameStage}>스테이지 추가하기</button>
            <div className="stage">
                {gameData.stage.map((data, index)=>(
                <>
                <h2>스테이지</h2>
                <table id="stage">
                    <tbody>
                    <tr>
                        <td>스테이지 이름</td>
                        <td>{data.name}</td>
                    </tr>
                    <tr>
                        <td>타입</td>
                        <td>{data.type}</td>
                    </tr>
                    <tr>
                        <td>사진 경로</td>
                        <td>{data.imgURL}</td>
                    </tr>
                    <tr>
                        <td>설명</td>
                        <td>{data.description}</td>
                    </tr>
                    <tr>
                        <td>시간제한</td>
                        <td>{data.timeLimit}</td>
                    </tr>
                    <tr>
                        <td>출입여부</td>
                        <td>{data.gateOpen}</td>
                    </tr>
                    <tr>
                        <td>닫힘메세지</td>
                        <td>{data.closedGateMessage}</td>
                    </tr>
                </tbody>
                </table>
                <button onClick={()=>createGameCut(index)}>컷 추가하기</button>
                {data.cut.map((data)=>(
                    <div className="cut">
                        <h3>컷</h3>
                            <table>
                                <tbody>
                                <tr>
                                    <td>컷 이름</td>
                                    <td>{data.name}</td>
                                </tr>
                                <tr>
                                    <td>타입</td>
                                    <td>{data.type}</td>
                                </tr>
                                <tr>
                                    <td>사진경로</td>
                                    <td>{data.imgURL}</td>
                                </tr>
                                <tr>
                                    <td>시간제한</td>
                                    <td>{data.timeLimit}</td>
                                </tr>
                                </tbody>
                            </table>
                    </div>
                ))}
                </>
            ))}
            </div>
        </div>
        
        </>
    )
}