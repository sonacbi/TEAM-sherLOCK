import * as fabric from 'fabric';
import { q } from 'framer-motion/client';
import { useEffect, useRef, useState } from "react";

// function Temp () {
//     const [isReady, setIsReady] = useState(false);
//     const [canvasArr, setCanvasArr] = useState(Array.from({ length: 5 }, () => null));
//     const [remainingScenes, setRemainingScenes] = useState([]);
//     const [imgs, setImgs] = useState([]);
//     const game = [
//         {width: 60, height: 40, backgroundColor: 'white'},
//         {width: 40, height: 40, backgroundColor: 'lightgray'},
//         {width: 50, height: 40, backgroundColor: 'beige'},
//         {width: 60, height: 40, backgroundColor: 'lavender'},
//         {width: 70, height: 40, backgroundColor: 'lightyellow'},
//         {width: 30, height: 40, backgroundColor: 'red'},
//         {width: 80, height: 40, backgroundColor: 'blue'},
//         {width: 70, height: 40, backgroundColor: 'green'},
//         {width: 90, height: 40, backgroundColor: 'purple'},
//         {width: 40, height: 40, backgroundColor: 'orange'},
//     ];

//     useEffect(() => {
//         setIsReady(true);
//     }, []);

//     useEffect(() => {
//         if (!isReady) return;
//         setCanvasArr(prev => {
//             const newArr = [...prev];
//             const queue = [...remainingScenes];
//             let i = 0;

//             // 빈 자리가 있고, remainingScenes가 남아 있다면 채우기
//             while (i < newArr.length && remainingScenes.length > 0) {
//                 if (newArr[i] === null) {
//                     newArr[i] = queue.shift(); // 큐에서 하나 꺼내기
//                 }
//                 i++;
//             }

//             // 남은 큐 업데이트
//             if (queue.length !== remainingScenes.length) {
//                 setRemainingScenes(queue);
//             }
//             return newArr;
//         });
//     }, [remainingScenes]); // 큐가 바뀔 때마다 채워줌

//     return(
//         <>
//         <h1>Temp Page</h1>
//         <button onClick={()=>setRemainingScenes([...game])}>버튼</button>

//         <h2>캔버스 데이터</h2>
//         {canvasArr.map((data, index) => {
//             console.log('data', data);
//             const canvasRef = useRef(null);
//             const canvas = useRef(new fabric.Canvas(canvasRef.current, {
//                 width: data?.width || 1000,
//                 height: data?.height || 60,
//                 backgroundColor: data?.backgroundColor || '#bbbbbb'
//             }));
//             if (data === null) {
//                 return (
//                     <div key={index} style={{margin: '20px', width: '60px', height: '40px', backgroundColor: 'gray'}}>빈칸</div>
//                 )
//             }

//             setImgs(prev => {
//                 const newData = [...prev];
//                 newData.push(canvas.current.toDataURL({
//                     format: 'jpeg',
//                     quality: 0.1,
//                 }));
//                 return newData;
//             });
//             setCanvasArr(prev => {
//                 const newData = [...prev];
//                 newData[index] = null;
//                 return newData;
//             });
//             return(
//                 // <div key={index} style={{margin: '20px', width: data.width, height: data.height, backgroundColor: data.backgroundColor, border: '1px solid black'}}></div>
//                 <canvas ref={canvasRef} key={index} width={data.width} height={data.height} className={`cv${index}`}></canvas>
//             )
//         })}

//         <h2>이미지 데이터</h2>
//         {imgs.map((src, idx) => (
//             // <h3 key={idx} style={{backgroundColor: 'aliceblue'}}>{`${idx}${src}`}</h3>
//             <img src={src} alt="" style={{margin: 10}}/>
//         ))}
//         </>
//     )
// }


function Temp () {
    const [isReady, setIsReady] = useState(false);
    const [canvasArr, setCanvasArr] = useState(Array.from({ length: 5 }, () => null));
    const [remainingScenes, setRemainingScenes] = useState([]);
    const [imgs, setImgs] = useState([]);
    const game = [
        {progress: 'preparing', num: 0, width: 60, height: 40, backgroundColor: 'white',},
        {progress: 'preparing', num: 1, width: 40, height: 40, backgroundColor: 'lightgray',},
        {progress: 'preparing', num: 2, width: 50, height: 40, backgroundColor: 'beige',},
        {progress: 'preparing', num: 3, width: 60, height: 40, backgroundColor: 'lavender',},
        {progress: 'preparing', num: 4, width: 70, height: 40, backgroundColor: 'lightyellow',},
        {progress: 'preparing', num: 5, width: 30, height: 40, backgroundColor: 'red',},
        {progress: 'preparing', num: 6, width: 80, height: 40, backgroundColor: 'blue',},
        {progress: 'preparing', num: 7, width: 70, height: 40, backgroundColor: 'green',},
        {progress: 'preparing', num: 8, width: 90, height: 40, backgroundColor: 'purple',},
        {progress: 'preparing', num: 9, width: 40, height: 40, backgroundColor: 'orange',},
        {progress: 'preparing', num: 10, width: 130, height: 40, backgroundColor: '#6606cc',},
        {progress: 'preparing', num: 11, width: 150, height: 40, backgroundColor: '#6626cc',},
        {progress: 'preparing', num: 12, width: 140, height: 40, backgroundColor: '#6646cc',},
        {progress: 'preparing', num: 13, width: 120, height: 40, backgroundColor: '#6666cc',},
        {progress: 'preparing', num: 14, width: 140, height: 40, backgroundColor: '#6686cc',},
        {progress: 'preparing', num: 15, width: 110, height: 40, backgroundColor: '#66a6cc',},
        {progress: 'preparing', num: 16, width: 160, height: 40, backgroundColor: '#66c6cc',},
        {progress: 'preparing', num: 17, width: 130, height: 40, backgroundColor: '#66e6cc',},
        {progress: 'preparing', num: 18, width: 120, height: 40, backgroundColor: '#66ffcc',},
        {progress: 'preparing', num: 19, width: 150, height: 40, backgroundColor: '#96ffcc',},
        {progress: 'preparing', num: 20, width: 110, height: 40, backgroundColor: '#c6ffcc',},
        {progress: 'preparing', num: 21, width: 130, height: 40, backgroundColor: '#f6ffcc',},

    ];

    useEffect(() => {
        setIsReady(true);
    }, []);

    useEffect(() => {
        if (!isReady) return;
        
        const newArr = [...canvasArr];
        const queue = [...remainingScenes];
        let hasChanges = false;

        // progress가 'done'인 자리를 찾아서 새 데이터로 교체
        for (let i = 0; i < canvasArr.length && remainingScenes.length > 0; i++) {
            if (newArr[i] === null || newArr[i]?.progress === 'done') {
                newArr[i] = queue.shift();
                hasChanges = true;
            }
        }

        // 변경사항이 있을 때만 state 업데이트
        if (hasChanges) {
            setCanvasArr(newArr);
            setRemainingScenes(queue);
        }
    }, [remainingScenes, canvasArr]);

    return(
        <>
        <h1>Temp Page</h1>
        <button onClick={()=>setRemainingScenes([...game])}>버튼</button>

        <h2>캔버스 데이터</h2>
        {isReady && canvasArr.map((data, index) => {
            if (data === null) {
                return (
                    <div key={index} style={{margin: '20px', width: '60px', height: '40px', backgroundColor: 'gray'}}>빈칸</div>
                )
            }

            return(
                <TCanvas key={`cv${index}`} data={data} index={index} setImgs={setImgs} remainingScenes={remainingScenes} canvasArr={canvasArr} setCanvasArr={setCanvasArr}/>
            )
        })}

        <h2>이미지 데이터</h2>
        {imgs.map((src, idx) => (
            // <h3 key={idx} style={{backgroundColor: 'aliceblue'}}>{`${idx}${src}`}</h3>
            <img src={src} alt="" style={{margin: 10}}/>
        ))}
        </>
    )
}

function TCanvas({data, index, setImgs, remainingScenes, canvasArr, setCanvasArr}) {
    const canvas = useRef(null);
    const canvasRef = useRef(null);
    const hasRendered = useRef(false);
    
    useEffect(() => {
        if (data === null || data === undefined) return;
        if (data.progress === 'done' && remainingScenes.length === 0) return; // done이면 실행 안 함
        if (hasRendered.current) return; // 이미 렌더링했으면 실행 안 함
        // if (remainingScenes.length === 0) {
        //     console.log('대기 중인 씬 없음');
        //     return;
        // }

        canvas.current = new fabric.Canvas(canvasRef.current, {
            width: data?.width || 900,
            height: data?.height || 60,
            backgroundColor: data?.backgroundColor || '#bbbbbb'
        });
        canvas.current.add(new fabric.Textbox(data?.backgroundColor || 'no data', {
            left: 10,
            top: 5,
            fontSize: 16,
            fill: 'black',
        }));
        canvas.current.renderAll();
        
        // setImgs(prev => [...prev, canvas.current.toDataURL({
        //     format: 'jpeg',
        //     quality: 0.5,
        // })]);
        setImgs(prev => {
            const newData = [...prev];
            newData[data.num] = canvas.current.toDataURL({
                format: 'jpeg',
                quality: 0.5,
            })
            return newData;
        });
        return () => {
            setCanvasArr(prev => {
                const newData = [...prev];
                // progress를 done으로 표시 (이게 트리거가 됨)
                newData[index] = { ...newData[index], progress: 'done' };
                return newData;
            });
            
            canvas.current.dispose();
        };
    }, [data]);

    return (
        <>
        {/* {remainingScenes.length > 0 && <canvas ref={canvasRef} width={data?.width || 900} height={data?.height || 60} className={`cv${index}`} style={{border: '1px dashed black'}}></canvas>} */}
        <canvas ref={canvasRef} width={data?.width || 900} height={data?.height || 60} className={`cv${index}`} style={{border: '1px dashed black', display: remainingScenes.length > 0 && 'none'}}></canvas>
        </>
    )
}



export default Temp;