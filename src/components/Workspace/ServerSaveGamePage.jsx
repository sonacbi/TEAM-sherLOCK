import { nanoid } from "nanoid";
import axios from "axios";
import { useState } from "react";

export default function ServerSaveGamePage(props) {
    const game = props.game;
    const setGame = props.setGame;
    function postToServer() {
        const nanoID = nanoid(8);
        const game_id = nanoID;
        
        if (!game.id) {
            const newGame = { ...game, id: nanoID };
            setGame(newGame);
            axios.post("http://localhost:5000/workspace", {game_id: game_id, user_id: 0, game: newGame})
            .then((res) => console.log("데이터 전송 성공: ",res))
            .catch((error) => console.error("데이터 전송 실패: ", error))
        }
        else {
            axios.put("http://localhost:5000/workspace", {game})
            .then((res) => console.log("데이터 전송 성공: ",res))
            .catch((error) => console.error("데이터 전송 실패: ", error))
        }
    }
    
    return(
        <button onClick={postToServer}>
            서버 저장
        </button>
    )
}