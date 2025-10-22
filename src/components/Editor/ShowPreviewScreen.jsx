import * as fabric from 'fabric';
import { useEffect, useRef, useState } from 'react';
import { loadCanvas } from '../../../modules/editor/handleGame';

function ShowPreviewScreen ({canvas, currentRoom, currentSide, canvasIndex, setSideImgSrcs, setTempCanvasArr, loadCanvasArgs}) {
    const [isReady, setIsReady] = useState(false);
    const canvasRef = useRef(null);
    const tempCanvas = useRef(null);
    
    useEffect(() => {
        console.log('hello it\'s me', currentRoom)
        console.log('??',canvasRef.current)
        tempCanvas.current = new fabric.Canvas(canvasRef.current, {
            width: canvas.width,
            height: canvas.height,
            backgroundColor: canvas.backgroundColor
        });

        loadCanvas(tempCanvas.current, ...loadCanvasArgs);
        
        setTimeout(() => {
            setSideImgSrcs(prev => {
                const newData = [...prev];
                if (!newData[currentRoom]) newData[currentRoom] = [];
                newData[currentRoom][currentSide] = tempCanvas.current.toDataURL({
                    format: 'jpeg',
                    quality: 0.1,
                });
                return newData;
            });
            setTempCanvasArr(prev => {
                const newData = [...prev];
                newData[canvasIndex] = null;
                return newData;
            });
        }, 0)

        return () => {
            tempCanvas.current.dispose();
            canvasRef.current = null;
        }
    }, []);

    return (
        <canvas ref={canvasRef} className={`tempCanvas tC${canvasIndex}`} style={{display: 'none'}}/>
    )
}

export default ShowPreviewScreen;