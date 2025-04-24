import axios from "axios";
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom";

export default function Game() {
    const [data, setData] = useState(null);
    const params = useParams();
    const game_id = params.id;
    useEffect(()=>{
        // const table = 'game'
        axios.get(`http://localhost:5000/game/${game_id}`)
        .then((response) => {setData(response.data); console.log('데이타: ', response.data)})
        .catch((error) => console.error("데이터 가져오기 실패:", error));
    }, [])
    console.log(data)
    // return(<></>)
}