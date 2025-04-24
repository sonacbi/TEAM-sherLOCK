import { nanoid } from "nanoid";
import axios from "axios";
import JSZip from "jszip";

const GAME_SERVER_PORT = 5000;

export default function SaveGameToServer(props) {
    const game = props.game;
    const setGame = props.setGame;
    const theme = props.theme;
    const visibility = props.visibility;
    const thumnailImg = props.imgs.thumnailImg;
    const stageImg = props.imgs.stageImg;
    const formData = new FormData();
    function uploadJSONToServer() {
        const nanoId = nanoid(8);
        // const game_id = nanoId;
        
        if (!game.id) {
            const newGame = { ...game, id: nanoId };
            setGame(newGame);
            axios.post(`http://localhost:${GAME_SERVER_PORT}/workspace`, {game_id: nanoId, user_id: 0, game: newGame})
            .then((res) => console.log("데이터 전송 성공: ",res))
            .catch((error) => console.error("데이터 전송 실패: ", error))
        } else {
            axios.put(`http://localhost:${GAME_SERVER_PORT}/workspace`, {game})
            .then((res) => console.log("데이터 전송 성공: ",res))
            .catch((error) => console.error("데이터 전송 실패: ", error))
        }
    }
    async function uploadFilesToServer() {
        const zip = new JSZip();
        zip.file(`${thumnailImg.name}`, thumnailImg);
        stageImg.map((data) => {
          zip.file(`${data.name}`, data)
        })
        let method = '';
        let param = '';
        
        if(!game.id) {
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

        try {
            const blob = await zip.generateAsync({type: 'blob'});
            formData.append('zipfile', blob, 'game.zip')
            const res = await fetch(`http://localhost:${GAME_SERVER_PORT}/workspace-files/${param}?theme=${theme}&visibility=${visibility}`, {
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
        <>
        <button onClick={uploadJSONToServer}>
            (구)서버 저장
        </button>
        <button onClick={uploadFilesToServer}>
            파일들을 서버 저장
        </button>
        </>
    )
}