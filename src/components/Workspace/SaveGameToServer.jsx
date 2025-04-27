import { nanoid } from "nanoid";
import axios from "axios";
import JSZip from "jszip";

export default function SaveGameToServer(props) {
    const game = props.game;
    const setGame = props.setGame;
    const theme = props.theme;
    const visibility = props.visibility;
    const thumnailImg = props.imgs.thumnailImg;
    const stageImg = props.imgs.stageImg;
    const formData = new FormData();
    async function uploadFilesToServer() {
        const zip = new JSZip();
        zip.file(`${thumnailImg.name}`, thumnailImg);
        stageImg.map((data) => {
          zip.file(`${data.name}`, data)
        })
        let method = '';
        let param = '';
        
        if(!game.id) {
            // game에 아이디가 없으면 아이디(nanoid) 부여
            const nanoId = nanoid(8);
            const newGame = { ...game, id: nanoId };
            setGame({ ...game, id: nanoId })
            zip.file("game.json", JSON.stringify(newGame, null, 2))
            method = "POST";
            param = nanoId;
        } else {
            zip.file("game.json", JSON.stringify(game, null, 2))
            method = "PUT";
            param = game.id;
        }

        // 게임 zip 파일 서버로 전송
        try {
            const blob = await zip.generateAsync({type: 'blob'});
            formData.append('zipfile', blob, 'game.zip')
            const res = await fetch(`http://localhost:4000/workspace/${param}?theme=${theme}&visibility=${visibility}`, {
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