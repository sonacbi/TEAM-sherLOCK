import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

export default function GamePage() {
    const { game_id } = useParams();
    // const game = useRef();
    const [game, setGame] = useState({});

    useEffect(() => {
        const fetchGame = async () => {
          try {
            const response = await axios.get(`http://localhost:4000/game/${game_id}`);
            setGame(response.data);
          } catch (err) {
            // setError('데이터를 불러오는 데 실패했어요.');
            console.error('d', err);
          }
        };
    
        fetchGame();
      }, [game_id]);

    return(
        <div>
            <h1>Hello, {game_id}</h1>
            <pre>
                {JSON.stringify(game, null, 2)}
            </pre>
        </div>
    )
}