import { useState } from "react";
import JSZip from 'jszip';
import { Game, GameInfo, Source, Stage, Cut, Theme, Visibility, StageType  } from "../../modules/game-modules"
import "../styles/workspace.css"
import SaveZIPGameToLocal from "../components/Workspace/SaveZIPGameToLocal";
import SaveGameToServer from "../components/Workspace/SaveGameToServer";

export default function Workspace() {
    const [game, setGame] = useState(new Game({}));
    const [gameInfo, setGameInfo] = useState(new GameInfo({}));
    const [file, setFile] = useState({});
    const [imgs, setImgs] = useState([]);
    const [thumbnailImg, setThumbnailImg] = useState(new File([], ''));
    const [stageImg, setStageImg] = useState([ new File([], '') ]);
    const [stageIndex, setStageIndex] = useState(0);
    const date = `(${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}) `
    console.log(`${date}게임:`, game, gameInfo)

    // 사용자 게임파일 불러오기
    function uploadGameFile(event) {
        const jsonFile = event.target.files[0]
        if(jsonFile.name.endsWith('.json')) {
            console.log('업로드된 게임 JSON: ',jsonFile)

            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    const parsed = JSON.parse(event.target.result);
                    setFile(parsed)
                    console.log('게임 JSON 파싱됨: ', parsed)
                } catch (error) {
                    console.log('게임 JSON 파싱 오류\n', error)
                }
            }
            reader.readAsText(jsonFile)
        } else {
            console.log("json 파일이 아님")
        }
    }

    // 게임파일 에디터에 적용하기
    function fileToGame() {
        setGame((prev)=> {
            try {
                return new Game(file);
            } catch(error) {
                console.log('업로드 오류\n', error);
                return new Game(prev);
            }
        })
    }


    // 게임 zip 파일 적용하기
    async function handleZIPFileChange(event) {
        const file = event.target.files[0];
        if (file && file.name.endsWith('.zip')) {
            const zip = await JSZip.loadAsync(file);
            let imgFiles = [];
            // zip 파일 내의 파일들을 순차적으로 확인
            zip.forEach((relativePath, zipEntry) => {
                if (zipEntry.name.endsWith('.json')) {
                    // JSON 파일 처리
                    zipEntry.async('string').then((content) => {
                        setGame(new Game(JSON.parse(content)));
                    });
                } else if (zipEntry.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                    // 이미지 파일 처리
                    zipEntry.async('blob').then((blob) => {
                        const url = new File([blob], zipEntry.name);
                        // const url = new File([blob], zipEntry.name.slice(9,));
                        imgFiles.push(url);
                        setImgs([...imgFiles]);
                    });
                }
            });
        }
    }
    function ZIPtoGame() {
        imgs.map(img=>{
            // console.log('잉1',game.thumbnailURL)
            // console.log('잉2',img.name)
            if(game.thumbnailURL == img.name) setThumbnailImg(img);
            game.stage.map((data, index)=>{
                if(data.imgURL == img.name) setStageImg(prev=>{
                    const newImg = [...prev]
                    newImg[index] = img
                    return newImg
                })
            })
        })
    }
    
    function showImgs() {
        console.log('이미지', imgs)
    }
    function showThumbnailImg() {
        console.log('썸넬이미지', thumbnailImg)
        console.log('썸넬이미지', URL.createObjectURL(thumbnailImg))
        console.log('download/'+game.thumbnailURL)
    }
    function showStageImgs() {
        console.log('스테이지이미지', stageImg)
    }

    function handleThumbnailChange(e) {
        // const img = e.target.files[0];
        // // if(img) setThumbnailImg(URL.createObjectURL(img));
        // if(img) setThumbnailImg(img);
    }

    function handleStageImgChange(e) {
        // const img = e.target.files[0];
        // console.log('핸들스테이미지바뀜', URL.createObjectURL(img))
        // console.log('핸들스테이미지바뀜', img)
        // if(img) {
        //     setStageImg(prev=>{
        //         const newImg = [...prev]
        //         newImg[stageIndex] = img
        //         return newImg
        //     })
        // };
    }

    // console.log('파싱된 파일2',file)
    
    // 게임 데이터 수정하는 함수
    function updategameInfo(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const title = formData.get("title");
        const thumbnail = formData.get("thumbnail").name;
        setThumbnailImg(formData.get("thumbnail"));
        const theme = formData.get("theme");
        const visibility = formData.get("visibility");
        const description = formData.get("description");
        const difficulty = formData.get("difficulty");
        const playTime = Number(formData.get("playTime"));
        const isRanking = formData.get("isRanking") ? true : false;
        const isHiddenStage = formData.get("isHiddenStage") ? true : false;
        setGameInfo(prev => {
            const newGame = {
                ...prev,
                title: title,
                thumbnail: thumbnail,
                description: description,
                theme: theme,
                difficulty: difficulty,
                playTime: playTime,
                visibility: visibility,
                isRanking: isRanking,
                isHiddenStage: isHiddenStage
            };
            return new GameInfo(newGame);
        })
    }

    // 새로운 스테이지 생성하는 함수
    function createGameStage() {
        setGame(prev => {
            const newGame = { ...prev, stage: [...prev.stage, new Stage({})] };
            return new Game(newGame);
        });
        setStageImg(prev => {
            const newImg = [...prev]
            newImg.push(new File([], ''))
            return newImg;
        })
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
            return new Game(newGame);
        });
    }

    function handleStageIndex(event) {
        const index = event.target.value;
        if (game.stage[index]) {
            setStageIndex(index);
        } else {
            console.log("게임에 해당 스테이지가 없습니다.")
        }
    }

    // 스테이지 수정하는 함수
    function updateGameStage(event) {
        event.preventDefault();
        const fromData = new FormData(event.target);
        // const index = fromData.get("stage_index") ? fromData.get("stage_index") : 0;
        const name = fromData.get("stage_name");
        const type = fromData.get("stage_type");
        const imgURL = fromData.get("stage_imgURL").name;
        setStageImg(prev=>{
            const newImg = [...prev]
            newImg[stageIndex] = fromData.get("stage_imgURL")
            return newImg
        })
        // const imgURL = URL.createObjectURL(fromData.get("stage_imgURL") ?? '');
        const description = fromData.get("stage_description");
        const timeLimit = Number(fromData.get("stage_timeLimit"));
        const gateOpen = fromData.get("stage_gateOpen") ? true : false;
        const closedGateMessage = fromData.get("stage_closedGateMessage") ? fromData.get("stage_closedGateMessage") : null;
        const connectedStage = fromData.get("stage_connectedStage");
        setGame(prev => {
            const newGame = { ...prev };
            newGame.stage = [...prev.stage]
            newGame.stage[stageIndex] = new Stage({
                name,
                type,
                imgURL,
                description,
                timeLimit,
                gateOpen,
                closedGateMessage,
                connectedStage,
                cut: newGame.stage[stageIndex].cut
            })
            return new Game(newGame);
        })
    }

    return(
        <div id="workspace">
        <section style={{backgroundColor: "#55dd55"}}>
            <button onClick={showImgs}>이미지 보기</button>
            <button onClick={showThumbnailImg}>썸네일 이미지 보기</button>
            <button onClick={showStageImgs}>스테이지 이미지 보기</button>
        </section>
        <section style={{backgroundColor: "#ffff6b"}}>
            <input type="file" accept=".json" onChange={uploadGameFile}/>
            <button onClick={fileToGame}>업로드된 파일 적용</button>
        </section>
        <section style={{backgroundColor: "#dd7777"}}>
            <input type="file" accept=".zip" onChange={handleZIPFileChange}/>
            <button onClick={ZIPtoGame}>zip변환</button>
        </section>
        {imgs.length > 0 && (
            <section style={{backgroundColor: "#aaaaaa"}}>
                <h3>이미지 저장소</h3>
                {imgs.map((img, index)=>{
                    // console.log(index, URL.createObjectURL(img))
                    return <img src={URL.createObjectURL(img)} key={index} alt={`img-${index}`} style={{ maxWidth: '70px', margin: '10px' }}/>
                    })}
            </section>
        )}
        <section /* style={{backgroundColor: "#d9d9d9"}} */>
            <div>
                <form onSubmit={updategameInfo}>
                    <div>
                        <label>제목
                            <input type="text" name="title" defaultValue={gameInfo.title} key={gameInfo.title}/>
                        </label>
                    </div>
                    <div>
                        <label>썸네일
                            <input type="file" name="thumbnail" accept="image/*" onChange={handleThumbnailChange}/>
                            {/* <input type="file" name="thumbnail" accept="image/*" defaultValue={thumbnailImg} key={thumbnailImg} onChange={handleThumbnailChange}/> */}
                        </label>
                    </div>
                    <div>
                        <label>테마:
                            <label>호러
                                <input type="radio" name="theme" value={Theme.horror} defaultChecked={gameInfo.theme == Theme.horror} key={gameInfo.theme}/>
                            </label>
                            <label>모험
                                <input type="radio" name="theme" value={Theme.adventure} defaultChecked={gameInfo.theme == Theme.adventure} key={gameInfo.theme}/>
                            </label>
                            <label>범죄
                                <input type="radio" name="theme" value={Theme.crime} defaultChecked={gameInfo.theme == Theme.crime} key={gameInfo.theme}/>
                            </label>
                        </label>
                    </div>
                    <div>
                        <label>공개 여부:
                            <label>공개
                                <input type="radio" name="visibility" value={Visibility.public} defaultChecked={gameInfo.visibility == Visibility.public} key={gameInfo.visibility}/>
                            </label>
                            <label>일부공개
                                <input type="radio" name="visibility" value={Visibility.unlisted} defaultChecked={gameInfo.visibility == Visibility.unlisted} key={gameInfo.visibility}/>
                            </label>
                            <label>비공개
                                <input type="radio" name="visibility" value={Visibility.private} defaultChecked={gameInfo.visibility == Visibility.private} key={gameInfo.visibility}/>
                            </label>
                        </label>
                    </div>
                    <div>
                        <label>설명
                            <textarea type="text" name="description" defaultValue={gameInfo.description} key={gameInfo.description}/>
                        </label>
                    </div>
                    <div>
                        <label>난이도:
                            <label>1
                                <input type="radio" name="difficulty" value={1} defaultChecked={gameInfo.difficulty == 1} key={gameInfo.difficulty}/>
                            </label>
                            <label>2
                                <input type="radio" name="difficulty" value={2} defaultChecked={gameInfo.difficulty == 2} key={gameInfo.difficulty}/>
                            </label>
                            <label>3
                                <input type="radio" name="difficulty" value={3} defaultChecked={gameInfo.difficulty == 3} key={gameInfo.difficulty}/>
                            </label>
                            <label>4
                                <input type="radio" name="difficulty" value={4} defaultChecked={gameInfo.difficulty == 4} key={gameInfo.difficulty}/>
                            </label>
                            <label>5
                                <input type="radio" name="difficulty" value={5} defaultChecked={gameInfo.difficulty == 5} key={gameInfo.difficulty}/>
                            </label>
                        </label>
                    </div>
                    <div>
                        <label>예상소요시간
                            <input type="number" name="playTime" step={10} defaultValue={gameInfo.playTime} key={gameInfo.playTime}/>
                        </label>
                    </div>
                    <div>
                        <label>랭킹 여부
                            <input type="checkbox" name="isRanking" defaultChecked={gameInfo.isRanking} key={gameInfo.isRanking}/>
                        </label>
                    </div>
                    <div>
                        <label>히든 여부
                            <input type="checkbox" name="isHiddenStage" defaultChecked={gameInfo.isHiddenStage} key={gameInfo.isHiddenStage}/>
                        </label>
                    </div>
                    <button type="submit">게임데이터 수정</button>
                </form>
            </div>
            <div>
                <div>
                    스테이지 선택
                    {game.stage.map((data, index)=>(
                        <button value={index} onClick={handleStageIndex}>{index}</button>
                        // <label>{index}
                        //     <input type="radio" name="stage_index" value={index} onChange={handleStageIndex}/>
                        // </label>
                    ))}
                </div>
                <form onSubmit={updateGameStage}>
                    <div>
                        <h3>스테이지 번호: {stageIndex}</h3>
                    </div>
                    <div>
                        <label>스테이지 이름
                            <input type="text" name="stage_name" defaultValue={game.stage[stageIndex].name} key={game.stage[stageIndex].name}/>
                        </label>
                    </div>
                    <div>
                        <label>타입
                            <label>노말
                                <input type="radio" name="stage_type" value={StageType.normal} defaultChecked={game.stage[stageIndex].type == StageType.normal} key={game.stage[stageIndex].type}/>
                            </label>
                            <label>죽음
                                <input type="radio" name="stage_type" value={StageType.death} defaultChecked={game.stage[stageIndex].type == StageType.death} key={game.stage[stageIndex].type}/>
                            </label>
                            <label>엔딩
                                <input type="radio" name="stage_type" value={StageType.ending} defaultChecked={game.stage[stageIndex].type == StageType.ending} key={game.stage[stageIndex].type}/>
                            </label>
                            <label>히든
                                <input type="radio" name="stage_type" value={StageType.hidden} defaultChecked={game.stage[stageIndex].type == StageType.hidden} key={game.stage[stageIndex].type}/>
                            </label>
                        </label>
                    </div>
                    <div>
                        <label>사진
                            {/* <input type="text" name="stage_imgURL" defaultValue={game.stage[index].imgURL} key={game.stage[index].imgURL}/> */}
                            <input type="file" name="stage_imgURL" accept="image/*" onChange={handleStageImgChange}/>
                        </label>
                    </div>
                    <div>
                        <label>설명
                            <textarea type="text" name="stage_description" defaultValue={game.stage[stageIndex].description} key={game.stage[stageIndex].description}/>
                        </label>
                    </div>
                    <div>
                        <label>시간제한
                            <input type="number" name="stage_timeLimit" defaultValue={game.stage[stageIndex].timeLimit} key={game.stage[stageIndex].timeLimit}/>
                        </label>
                    </div>
                    <div>
                        <label>출입여부
                            <input type="checkbox" name="stage_gateOpen" defaultChecked={game.stage[stageIndex].gateOpen} key={game.stage[stageIndex].gateOpen}/>
                        </label>
                    </div>
                    <div>
                        <label>닫힘메세지
                            <input type="text" name="stage_closedGateMessage" defaultValue={game.stage[stageIndex].closedGateMessage} key={game.stage[stageIndex].closedGateMessage}/>
                        </label>
                    </div>
                    <div>
                        {/* {game.stage.map((data, index) => {
                            return <input type="checkbox" name="stage_connectedStage" value={index}/>
                        })}
                        {game.stage[stageIndex].connectedStage.map((data, index) => {
                            return (<button onClick={game.stage[stageIndex].connectedStage.splice(index)}>{data}</button>)
                        })} */}
                        {/* {game.stage.map((data, index1) => {
                            game.stage[stageIndex].connectedStage.map((data, index2) => {
                                return({index2})
                            })
                            return(
                                <label>{index1}
                                    <input type="checkbox" name="stage_connectedStage"/>
                                </label>
                            )
                        })}
                        {game.stage[stageIndex].connectedStage.map((data, index) => (
                            <input type="checkbox" name="stage_connectedStage"/>
                        ))} */}
                        <label>연결된 스테이지
                            <input type="number" name="stage_connectedStage" defaultValue={game.stage[stageIndex].connectedStage} key={game.stage[stageIndex].connectedStage}/>
                        </label>
                    </div>
                    <button type="submit">스테이지 수정하기</button>
                </form>
            </div>
        </section>
        <div id="game">
            <h1>게임 제목: "{gameInfo.title}"</h1>
            <table>
                <tbody>
                    <tr>
                        <td>썸네일:</td>
                        <td>
                            {/* <img src={game.thumbnailURL.length ? game.thumbnailURL : null} style={{width: "200px"}}/> */}
                            <img src={URL.createObjectURL(thumbnailImg)} style={{width: "200px"}}/>
                        </td>
                    </tr>
                    <tr>
                        <td>썸네일 경로: </td>
                        <td>
                            {gameInfo.thumbnail}
                        </td>
                    </tr>
                    <tr>
                        <td>설명: </td>
                        <td><pre>{gameInfo.description}</pre></td>
                    </tr>
                    <tr>
                        <td>테마: </td>
                        <td>{gameInfo.theme}</td>
                    </tr>
                    <tr>
                        <td>난이도: </td>
                        <td>{gameInfo.difficulty}</td>
                    </tr>
                    <tr>
                        <td>예상소요시간: </td>
                        <td>{gameInfo.playTime}</td>
                    </tr>
                    <tr>
                        <td>공개: </td>
                        <td>{gameInfo.visibility}</td>
                    </tr>
                    <tr>
                        <td>랭킹?: </td>
                        <td>{gameInfo.isRanking ? '있음' : '없음'}</td>
                    </tr>
                    <tr>
                        <td>히든?: </td>
                        <td>{gameInfo.isHiddenStage ? '있음' : '없음'}</td>
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
                        <td>사진</td>
                        <td>
                            {/* <img src={data.imgURL.length ? data.imgURL : null} style={{width: "500px"}}/> */}
                            <img src={URL.createObjectURL(stageImg[index] ?? new File([], ''))} style={{width: "500px"}}/>
                        </td>
                    </tr>
                    <tr>
                        <td>사진 경로</td>
                        <td>{data.imgURL}</td>
                    </tr>
                    <tr>
                        <td>설명</td>
                        <td><pre>{data.description}</pre></td>
                    </tr>
                    <tr>
                        <td>시간제한</td>
                        <td>{data.timeLimit}</td>
                    </tr>
                    <tr>
                        <td>출입여부</td>
                        <td>{data.gateOpen ? "열림" : "닫힘"}</td>
                    </tr>
                    <tr>
                        <td>닫힘메세지</td>
                        <td>{data.closedGateMessage ?? "없음"}</td>
                    </tr>
                    <tr>
                        <td>연결된 스테이지</td>
                        <td>{JSON.stringify(data.connectedStage)}</td>
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
        <section style={{backgroundColor: "#ffbb66"}}>
            <SaveZIPGameToLocal game={game} imgs={{thumbnailImg, stageImg}}/>
        </section>
        <section style={{backgroundColor: "#ffaa22"}}>
            <SaveGameToServer game={game} gameInfo={gameInfo} setGameInfo={setGameInfo} imgs={{thumbnailImg, stageImg}}/>
        </section>
        </div>
    )
}