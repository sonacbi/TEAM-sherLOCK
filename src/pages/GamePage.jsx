import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import JSZip from "jszip";
import { Game } from "../../modules/game-modules";

export default function GamePage() {
    const { game_id } = useParams();
    const [game, setGame] = useState({});
    const [gameData, setGameData] = useState({});
    const [imgs, setImgs] = useState([]);
    const [thumbnailURL, setThumbnailURL] = useState('');

    // 게임 불러오기
    const loadGame = async () => {
        const res = await fetch(`http://localhost:4000/game/${game_id}/zip`);
        const blob = await res.blob();
        console.log(blob)
        const zip = await JSZip.loadAsync(blob);
        console.log('zip.files', zip.files)

        const imgFiles = [];
        // zip파일에서 데이터 추출
        zip.forEach((relativePath, file) => {
            if (file.name.endsWith("json")) {
                file.async('string')
                .then(content => setGame(JSON.parse(content)));
            }
            else if (file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                // 이미지 파일 처리
                file.async('blob').then((blob) => {
                    const url = new File([blob], file.name);
                    imgFiles.push(url);
                    setImgs([...imgFiles]);
                });
            }
        });
    }

    // MySQL에 있는 게임 데이터 불러오기
    const loadGameData = async () => {
        const res = await fetch(`http://localhost:4000/game/${game_id}`);
        setGameData(await res.json());
    }

    // 사진 페이지에 적용
    const loadImgs = () => {
        imgs.forEach((data, index) => {
            console.log(data.name)
            if (data.name == game.thumbnailURL) setThumbnailURL(URL.createObjectURL(data))
        })
    }

    // 데이터 확인용
    const test = () => {
        console.log('입력된 데이터', {
            game: game,
            gameData: gameData,
            imgs: imgs,
            thumbnailURL: thumbnailURL
        })
        // console.log('game', game)
        // console.log('gameData', gameData)
        // console.log('imgs', imgs)
        // console.log('thumnailURL', thumbnailURL)
    }

    useEffect(() => {
        loadGame();
        loadGameData();
    }, [game_id])

    useEffect(() => {
        loadImgs();
    }, [imgs])

    return(
        <div>
            {game && gameData && imgs && thumbnailURL
            ?
            <div>
                {/* 제목 */}
                <h1>{game.title}</h1>
                {/* 썸네일 */}
                <img src={thumbnailURL} alt={`thumbnail_${game.thumbnailURL}`} style={{width: "200px"}}/>
                {/* 설명 */}
                <pre>
                    {game.description.length ? game.description : "설명 없음"}
                </pre>
                {/* 테마 */}
                <div>{gameData.theme}</div>
                {/* 태그 */}
                <div>{game.tag}</div>
                {/* 난이도 */}
                <div>{game.difficulty}</div>
                {/* 예상시간 */}
                <div>{game.playTime}</div>
                {/* 만든 놈 */}
                <div>{gameData.user_id}</div>
                <div>{JSON.stringify(game.role)}</div>
                {/* 스테이지 수 */}
                <div>{game.stage.length}</div>
                {/* 조회수 */}
                <div>{gameData.view}</div>
                {/* 제작일 */}
                <div>{gameData.created_at}</div>
            </div>
            :
            <div style={{backgroundColor: "red", width: "800px", height: "500px"}}>데이터 없음!</div>}

            <button onClick={test}>데이터 확인</button>
        </div>
    )
}