import { nanoid } from "nanoid";
import axios from "axios";

export default function ServerSaveGamePage(props) {
    const game = props.game;
    const setGame = props.setGame;
    function postToServer() {
        const nanoID = nanoid(10);
        if (!game.id) {
            setGame((prev)=> {
                const newGame = {...prev, id: nanoID};
                return newGame;
            })
        }
        console.log(nanoID)

        const game_id = gameData.id;
        const user_id = 0;
        axios.post("http://localhost:5000/create_game", {game_id, user_id})
        .then((res) => console.log("데이터 전송 성공: ",res))
        .catch((error) => console.error("데이터 전송 실패: ", error))
    }
    console.log('업로드된 정보',game)
    
    return(
        <button onClick={postToServer}>
            서버 저장
        </button>
    )
}