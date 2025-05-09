import JSZip from "jszip";
import { nanoid } from "nanoid";
import { GameInfo } from "../../../modules/game-modules";

export default function SaveGameToServer(props) {
    const game = props.game;
    const gameInfo = props.gameInfo;
    const setGameInfo = props.setGameInfo;
    const thumbnailImg = props.imgs.thumbnailImg;
    const stageImg = props.imgs.stageImg;
    async function uploadFilesToServer() {
        const formData = new FormData();
        const zip = new JSZip();
        zip.file("game.json", JSON.stringify(game, null, 2))
        console.log(props.imgs)
        zip.file(`${thumbnailImg.name}`, thumbnailImg);
        stageImg.map((data) => {
          zip.file(`${data.name}`, data)
        })
        let method = '';
        let param = '';
        
        if(!gameInfo.id) {
            // game에 아이디가 없으면 아이디(nanoid) 부여
            const nanoId = nanoid(8);
            setGameInfo(new GameInfo({ ...gameInfo, id: nanoId }))
            method = "POST";
            param = nanoId;
        } else {
            method = "PUT";
            param = gameInfo.id;
        }

        // 게임 zip 파일 서버로 전송
        try {
            const blob = await zip.generateAsync({type: 'blob'});
            formData.append('zipfile', blob, 'game.zip');
            formData.append('gameInfo', JSON.stringify(gameInfo));
            const res = await fetch(`http://localhost:4000/workspace/${param}`, {
                method: method,
                body: formData,
            });
            const data = await res.json();
            console.log("서버 응답:", data);
        } catch (error) {
            console.error("업로드 실패:", error);
        }
    }
    
    return(
        <button onClick={uploadFilesToServer}>
            서버 저장
        </button>
    )
}