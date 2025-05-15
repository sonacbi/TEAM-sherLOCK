import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';

function Editor({ addTextTrigger }) {
    const canvasRef = useRef(null);
    const canvasInstance = useRef(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const canvas = new fabric.Canvas(canvasRef.current, {
            width: 1100,
            height: 650,
            backgroundColor: 'white',
            selectionColor: 'rgba(169, 219, 120, 0.3)',
            selectionBorderColor: '#A9DB78',
        });
        canvasInstance.current = canvas;

        const textbox = new fabric.Textbox('텍스트를 입력해주세요.', {
            transparentCorners: false,
            fontSize: 50,
            fill: '#333',
            width: 500,
            editable: true,
            borderColor: '#A9DB78',
            editingBorderColor: '#A9DB78',
            selectionColor: 'rgba(128, 128, 128, 0.3)',
            cornerStrokeColor: '#A9DB78',
            cornerColor: 'white',
            cornerStyle: 'circle',
            borderScaleFactor: 2,
        });
        canvas.add(textbox);
        textbox.setControlsVisibility({
            mt: false,
            mb: false,
        });
        canvas.centerObject(textbox);
        textbox.setCoords();
        canvas.setActiveObject(textbox);
        canvas.renderAll();

        textbox.on('scaling', function() {
            const scaleX = textbox.scaleX;
            const scaleY = textbox.scaleY;
            textbox.set({
                scaleX: 1,
                scaleY: 1,
                fontSize: textbox.fontSize * scaleY,
                width: textbox.width * scaleX,
                height: textbox.height * scaleY,
            });
            canvas.renderAll();
        });

        setIsReady(true);

        return () => {
            canvas.dispose();
        };
    }, []);

    useEffect(() => {
        if (isReady && addTextTrigger) {
            addTextBox();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [addTextTrigger]);

    const addTextBox = () => {
        if (!canvasInstance.current) return;

        const newTextbox = new fabric.Textbox('새 텍스트', {
            transparentCorners: false,
            fontSize: 40,
            fill: '#333',
            width: 160,
            editable: true,
            borderColor: '#A9DB78',
            editingBorderColor: '#A9DB78',
            selectionColor: 'rgba(128, 128, 128, 0.3)',
            cornerStrokeColor: '#A9DB78',
            cornerColor: 'white',
            cornerStyle: 'circle',
            borderScaleFactor: 2,
        });

        newTextbox.setControlsVisibility({
            mt: false,
            mb: false,
        });

        canvasInstance.current.centerObject(newTextbox);
        newTextbox.setCoords();

        canvasInstance.current.add(newTextbox);
        canvasInstance.current.setActiveObject(newTextbox);
        canvasInstance.current.renderAll();

        newTextbox.on('scaling', function() {
            const scaleX = newTextbox.scaleX;
            const scaleY = newTextbox.scaleY;
            newTextbox.set({
                scaleX: 1,
                scaleY: 1,
                fontSize: newTextbox.fontSize * scaleY,
                width: newTextbox.width * scaleX,
                height: newTextbox.height * scaleY,
            });
            canvasInstance.current.renderAll();
        });
    };

    return (
        <canvas
            ref={canvasRef}
            width={1100}
            height={650}
        />
    );
}

export default Editor;