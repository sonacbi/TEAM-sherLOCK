import JSZip from "jszip";
import { nanoid } from "nanoid";
import { GameInfo } from "../../../modules/game-modules";

import save_icon from '../../assets/images/EditorPage_img/save_icon.png';

import SherAI from './SherAI';

export default function SaveToServer({game, gameInfo, setGameInfo, setGameZip, thumbnail, imgs}) {
    function saveFilesToLocal() {
        const zip = new JSZip();
        // ZIP에 파일 추가
        zip.file("game.json", JSON.stringify(game, null, 2));
        if (thumbnail) zip.file(thumbnail.name, thumbnail);
        imgs.map(data => {
            zip.file(data.name, data)
        })

        // zip 파일 생성 후 다운로드
        zip.generateAsync({ type: 'blob' }).then((content) => {
            saveAs(content, 'game.zip');
        });
    };

    async function uploadFilesToServer() {
        if (!gameInfo) {
            alert("방탈출 정보가 비어 있어 저장이 취소됩니다.")
            return;
        }
        const formData = new FormData();
        const zip = new JSZip();
        // zip.file("game.json", JSON.stringify(game), null, 2);
        zip.file("game.json", JSON.stringify(game, null, 2));
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
    
    return(
        <div className='save_submit'>
            <SherAI setGameZip={setGameZip}/>
            <p className='save_button' title='저장하기' onClick={saveFilesToLocal}>
                <img id='save_icon' src={save_icon} alt='save_icon' />
            </p>
            <p className='submit_button' onClick={uploadFilesToServer}>
                제출
            </p>
        </div>
    )
}