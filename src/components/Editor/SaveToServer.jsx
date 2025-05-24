import JSZip from "jszip";
import { nanoid } from "nanoid";
import { useEffect } from "react";
import { GameInfo, GameInfoType } from "../../../modules/game-modules";
import { GamePnC, Room } from "../../../modules/editor/gamePnC";

export default function SaveToServer({game, gameInfo, setGameInfo, thumbnail, imgs, room, saveGame}) {
    function getSavedGameJSON(game) {
        // return new GamePnC({
        //     ...game,
        //     // room: game.room.map(data => new Room(data)),
        //     room: room.map(data => new Room(data)),
        // });
        return new GamePnC({
            ...game,
            // room: [...prev.room, {...room}], // 나중에 game.room[index] 각 인덱스에 저장하게끔
            room: [{...room}],
        });
    }

    async function uploadFilesToServer() {
        const formData = new FormData();
        const zip = new JSZip();
        // zip.file("game.json", JSON.stringify(game), null, 2);
        zip.file("game.json", JSON.stringify(getSavedGameJSON(game), null, 2));
        zip.file(`${thumbnail.name}`, thumbnail);
        imgs.map(data => {
          zip.file(`${data.name}`, data)
        });
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
            const res = await fetch(`http://localhost:4000/editor/${param}`, {
                method: method,
                body: formData,
            });
            const data = await res.json();
            console.log("서버 응답:", data);
        } catch (error) {
            console.error("업로드 실패:", error);
        }
    }
    useEffect(() => {
        console.log(game)
    }, [game])
    
    return(
        <p className='submit_button' onClick={uploadFilesToServer}>
            제출
        </p>
    )
}