import { useState } from "react";
import { Game, Source, Stage, Cut  } from "../../modules/game-modules"
import "../styles/workspace.css"
import LocalSaveGamePage from "../components/Workspace/LocalSaveGamePage";
import ServerSaveGamePage from "../components/Workspace/ServerSaveGamePage";

export default function Workspace() {
    const [game, setGame] = useState(new Game({}));
    const [file, setFile] = useState();
    console.log('게임데이터:', game)

    function uploadFile(event) {
        event.preventDefault();
        const formData = new FormData(event.target)
        const jsonFile = formData.get("file")
        console.log('파일',jsonFile)

        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target.result);
                setFile(parsed)
                console.log('parsed: ', parsed)
            } catch (error) {
                console.log('JSON 파싱 오류', err)
            }
        }
        reader.readAsText(jsonFile)

        // console.log('파싱된 파일',file)
    }

    function fileToGame() {
        setGame(()=> new Game(file.game) ) 
    }

    // console.log('파싱된 파일2',file)
    
    // 게임 데이터 수정하는 함수
    function updateGame(event) {
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
        setGame(prev => {
            const newGame = {
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
            return newGame;
        })
    }

    // 새로운 스테이지 생성하는 함수
    function createGameStage() {
        setGame(prev => {
            const newGame = { ...prev, stage: [...prev.stage, new Stage({})] };
            return newGame;
        });
    }
    // 새로운 컷 생성하는 함수
    function createGameCut(index) {
        setGame(prev => {
            const newGame = { ...prev };
            // stage 배열도 복사
            newGame.stage = [...prev.stage];
            // 해당 스테이지가 존재하는지 확인
            if (!newGame.stage[index]) return prev;
            // 해당 스테이지의 cut을 새로운 Cut으로 설정
            newGame.stage[index] = { 
                ...newGame.stage[index], 
                cut: [...(newGame.stage[index].cut || []), new Cut({})] 
            };
            return newGame;
        });
    }

    // 스테이지 설정하는 함수
    function setGameStage(event) {
        event.preventDefault();
        const fromData = new FormData(event.target);
        const index = fromData.get("stage_index") ? fromData.get("stage_index") : 0;
        const name = fromData.get("stage_name");
        const type = fromData.get("stage_type");
        const imgURL = fromData.get("stage_imgURL");
        const description = fromData.get("stage_description");
        const timeLimit = fromData.get("stage_timeLimit");
        const gateOpen = fromData.get("stage_gateOpen") ? true : false;
        const closedGateMessage = fromData.get("stage_closedGateMessage");
        const connectedStage = fromData.get("stage_connectedStage");
        setGame(prev => {
            const newGame = { ...prev };
            newGame.stage = [...prev.stage]
            newGame.stage[index] = {
                name,
                type,
                imgURL,
                description,
                timeLimit,
                gateOpen,
                closedGateMessage,
                connectedStage,
                cut: newGame.stage[index].cut
            }
            // newGame.stage = [ ...prev.stage ];
            // newGame.stage
            return newGame;
        })
    }

    return(
        <>
        <section>
            <form onSubmit={uploadFile}>
                <input type="file" name="file" accept=".json"/>
                <button type="submit">업로드</button>
            </form>
            <button onClick={fileToGame}>업로드된 파일 적용</button>
        </section>
        <section>
            <div>
                <form onSubmit={updateGame}>
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
            <div>
                <form onSubmit={setGameStage}>
                    <div>
                        <label>스테이지 인덱스
                            <input type="number" name="stage_index"/>
                        </label>
                    </div>
                    <div>
                        <label>스테이지 이름
                            <input type="text" name="stage_name"/>
                        </label>
                    </div>
                    <div>
                        <label>타입
                            <select name="stage_type" id="">
                                <option value="normal">일반</option>
                                <option value="death">죽음</option>
                                <option value="ending">엔딩</option>
                                <option value="hidden">히든</option>
                            </select>
                        </label>
                    </div>
                    <div>
                        <label>사진
                            <input type="text" name="stage_imgURL"/>
                        </label>
                    </div>
                    <div>
                        <label>설명
                            <textarea type="text" name="stage_description"/>
                        </label>
                    </div>
                    <div>
                        <label>시간제한
                            <input type="number" name="stage_timeLimit"/>
                        </label>
                    </div>
                    <div>
                        <label>출입여부
                            <input type="checkbox" name="stage_gateOpen"/>
                        </label>
                    </div>
                    <div>
                        <label>닫힘메세지
                            <input type="text" name="stage_closedGateMessage"/>
                        </label>
                    </div>
                    <div>
                        <label>연결된 스테이지
                            <input type="number" name="stage_connectedStage"/>
                        </label>
                    </div>
                    <button type="submit">스테이지 수정하기</button>
                </form>
            </div>
        </section>
        <div id="game">
            <h1>게임 제목: "{game.title}"</h1>
            <table>
                <tbody>
                    <tr>
                        <td>썸네일 경로: </td>
                        <td>{game.thumbnailURL}</td>
                    </tr>
                    <tr>
                        <td>설명: </td>
                        <td>{game.description}</td>
                    </tr>
                    <tr>
                        <td>테마: </td>
                        <td>{game.theme}</td>
                    </tr>
                    <tr>
                        <td>태그: </td>
                        <td>{game.tag}</td>
                    </tr>
                    <tr>
                        <td>소요시간: </td>
                        <td>{game.playTime}</td>
                    </tr>
                    <tr>
                        <td>공개: </td>
                        <td>{game.visibility}</td>
                    </tr>
                    <tr>
                        <td>랭킹?: </td>
                        <td>{game.isRanking ? '있음' : '없음'}</td>
                    </tr>
                    <tr>
                        <td>히든?: </td>
                        <td>{game.isHiddenStage ? '있음' : '없음'}</td>
                    </tr>
                    <tr>
                        <td>인벤토리: </td>
                        <td>{game.inventory ? '있음': '없음'}</td>
                    </tr>
                </tbody>
            </table>
            <button onClick={createGameStage}>스테이지 추가하기</button>
            <div className="stage">
                {game.stage.map((data, index)=>(
                <>
                <h2>스테이지 {index}</h2>
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
                    <tr>
                        <td>연결된 스테이지</td>
                        <td>{data.connectedStage}</td>
                    </tr>
                </tbody>
                </table>
                <button onClick={()=>createGameCut(index)}>컷 추가하기</button>
                {data.cut.map((data, index)=>(
                    <div className="cut">
                        <h3>컷 {index}</h3>
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
        <div>
            <LocalSaveGamePage game={game}/>
            <ServerSaveGamePage game={game} setGame={setGame}/>
        </div>
        </>
    )
}