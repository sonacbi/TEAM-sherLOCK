import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { createRoomFrame } from '../../../modules/handelPolygon';

function Editor({ addTextTrigger, addShapeTrigger, addImageFile, addFrameTrigger, edgeFrameState }) {
    const canvasRef = useRef(null);
    const canvasInstance = useRef(null);
    const [isReady, setIsReady] = useState(false);
    const [angle, setAngle] = useState(0);
    const [position, setPosition] = useState([220, 120]);
    const [size, setSize] = useState([position[0] + 440, position[1] + 300]);

    // 공통 스타일
    const controlStyle = {
        transparentCorners: false,
        borderColor: '#A9DB78',
        editingBorderColor: '#A9DB78',
        selectionColor: 'rgba(128, 128, 128, 0.3)',
        cornerStrokeColor: '#A9DB78',
        cornerColor: 'white',
        cornerStyle: 'circle',
        borderScaleFactor: 2,
    };

    const roomController = new fabric.Rect({
        ...controlStyle,
        left: 220,
        top: 120,
        fill: 'rgba(255, 0, 0, 0.2)',
        strokeWidth: 2,
        stroke: 'red',
        name: "SherLockFrontController",
    });
    roomController.width = roomController.left + 440;
    roomController.height = roomController.top + 300;
    roomController.on('rotating', () => {
        setAngle(roomController.angle);
        console.log('aa', roomController.angle)
    });
    roomController.on('moving', () => {
        setPosition([roomController.left, roomController.top]);
    });
    roomController.on('scaling', () => {
        setPosition([roomController.left, roomController.top]);
        setSize([roomController.getScaledWidth(), roomController.getScaledHeight()]);
    });

    useEffect(() => {
        const canvas = new fabric.Canvas(canvasRef.current, {
            width: 1100,
            height: 650,
            backgroundColor: 'white',
            selection: true,
            selectionColor: 'rgba(169, 219, 120, 0.3)',
            selectionBorderColor: '#A9DB78',
        });

        canvasInstance.current = canvas;

        // 초기 textbox 추가
        const textbox = new fabric.Textbox('텍스트를 입력하세요.', {
            ...controlStyle,
            fontSize: 50,
            fill: '#333',
            width: 450,
            editable: true,
        });

        textbox.setControlsVisibility({ mt: false, mb: false });
        canvas.centerObject(textbox);
        textbox.setCoords();
        canvas.add(textbox);
        canvas.setActiveObject(textbox);
        canvas.renderAll();

        // 비율 유지하면서 크기 조절
        textbox.on('scaling', () => {
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
        return () => canvas.dispose();
    }, []);

    useEffect(() => {
        if (isReady) addTextBox();
    }, [addTextTrigger]);

    useEffect(() => {
        if (isReady) addShape();
    }, [addShapeTrigger]);

    useEffect(() => {
        if (isReady) {
            addFrame();
        }
    }, [addFrameTrigger, angle, position, size, edgeFrameState]);

    const addTextBox = () => {
        const canvas = canvasInstance.current;
        if (!canvas) return;

        const textbox = new fabric.Textbox('새 텍스트', {
            ...controlStyle,
            fontSize: 40,
            fill: '#333',
            width: 160,
            editable: true,
        });

        textbox.setControlsVisibility({ mt: false, mb: false });
        canvas.centerObject(textbox);
        textbox.setCoords();
        canvas.add(textbox);
        canvas.setActiveObject(textbox);
        canvas.renderAll();

        textbox.on('scaling', () => {
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
    };

    const addShape = () => {
        const canvas = canvasInstance.current;
        if (!canvas) return;

        const rect = new fabric.Rect({
            ...controlStyle,
            left: 100,
            top: 100,
            fill: '#A9DB78',
            width: 100,
            height: 100,
            stroke: 'rgb(0, 140, 26)',
            strokeWidth: 2,
            strokeUniform: true,
        });

        canvas.add(rect);
        canvas.setActiveObject(rect);
        canvas.renderAll();
    };

    useEffect(() => {
        if (isReady && addImageFile) {
            if (!addImageFile.type.startsWith('image/')) {
                alert('이미지 파일만 업로드할 수 있습니다.');
                return;
            }

            const reader = new FileReader();

            reader.onload = function (e) {
                if (!canvasInstance.current) {
                    return;
                }

                const imgElement = new Image();
                imgElement.src = e.target.result;

                imgElement.onload = () => {
                    // const warpedCanvas = warpImageToTrapezoid(imgElement, 40);

                    // const fabricImage = new fabric.Image(warpedCanvas, {
                    const fabricImage = new fabric.Image(imgElement, {
                        ...controlStyle,
                        left: 150,
                        top: 150,
                        scaleX: 0.4,
                        scaleY: 0.4,
                    });

                    canvasInstance.current.add(fabricImage);
                    canvasInstance.current.setActiveObject(fabricImage);
                    canvasInstance.current.renderAll();
                };

                imgElement.onerror = () => {
                    console.error('이미지 로드 실패');
                };
            };

            reader.onerror = function () {
                console.error('파일 읽기 실패');
            };

            reader.readAsDataURL(addImageFile);
        }
    }, [addImageFile]);

    useEffect(() => {
        const canvas = canvasInstance.current;
        if (!canvas) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Delete') {
                const activeObject = canvas.getActiveObject();
                if (activeObject) {
                    if (activeObject instanceof fabric.ActiveSelection) {
                        activeObject.forEachObject(obj => {
                            canvas.remove(obj);
                        });
                        canvas.discardActiveObject();
                    } else {
                        canvas.remove(activeObject);
                        canvas.discardActiveObject();
                    }
                    canvas.renderAll();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isReady]);

    const addFrame = () => {
        const canvas = canvasInstance.current;
        if (!canvas) return;
        
        const target1 = canvas.getObjects().find(obj => obj.name === 'SherLockRoomFrame');
        if (target1) canvas.remove(target1);
        // const bounds = roomController.getBoundingRect();
        // console.log(bounds)
        
        const roomFrame = createRoomFrame(
            angle,
            ...position,
            ...size,
            ...edgeFrameState
        );
        canvas.add(roomFrame);
        if (!canvas.getObjects().find(obj => obj.name === 'SherLockFrontController')) {
            canvas.add(roomController);
            canvas.setActiveObject(roomController);
        }
        
        canvas.renderAll();
    };

    useEffect(() => {
        const canvas = canvasInstance.current;
        if (!canvas) return;

        const handleWheel = (e) => {
            if (!e.ctrlKey) return;
            e.preventDefault();

            let zoom = canvas.getZoom();
            zoom *= e.deltaY > 0 ? 0.9 : 1.1;
            zoom = Math.min(Math.max(zoom, 0.5), 5);

            canvas.zoomToPoint({ x: e.offsetX, y: e.offsetY }, zoom);
            canvas.renderAll();
        };

        const upperCanvas = canvas.upperCanvasEl;
        if (upperCanvas) {
            upperCanvas.addEventListener('wheel', handleWheel, { passive: false });
        }

        return () => {
            if (upperCanvas) {
                upperCanvas.removeEventListener('wheel', handleWheel);
            }
        };
    }, [isReady]);

    function warpImageToTrapezoid(image, topInset = 40) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const w = image.width;
        const h = image.height;
        canvas.width = w;
        canvas.height = h;

        // Draw image to trapezoid by using transformation matrix (fake 2D skew)
        ctx.save();
        ctx.setTransform(
            (w - topInset * 2) / w, // scaleX
            t001,
            topInset / h, // skewX
            1, // scaleY
            topInset, // translateX
            t001 // translateY
        );
        ctx.drawImage(image, 0, 0);
        ctx.restore();

        return canvas;
    }

    // 캔버스에서 벽 객체들만 추출하는 함수
    function getWallsFromCanvas(canvas) {
      const objects = canvas.getObjects();
      let walls = [];

      console.log('캔버스 전체 객체 개수:', objects.length);

      objects.forEach((obj, idx) => {
        console.log(`객체[${idx}]: type=${obj.type}, name=${obj.name}, wallType=${obj.get('wallType')}`);

        // 그룹 객체인 경우
        if (obj.type === 'group') {
          // 그룹 내부에서 wallType이 특정 값인 객체만 필터링
          const groupWalls = obj._objects.filter(o =>
            ['front', 'bottom', 'left', 'right', 'top'].includes(o.get('wallType'))
          );
          console.log(`  그룹 내부 벽 객체 개수: ${groupWalls.length}`);

          groupWalls.forEach((w, i) => {
            console.log(`    벽[${i}]: type=${w.type}, wallType=${w.get('wallType')}`);
          });

          walls = walls.concat(groupWalls);
        } else {
          // 그룹이 아닌 객체 중 wallType이 벽에 해당하는 경우
          if (['front', 'bottom', 'left', 'right', 'top'].includes(obj.get('wallType'))) {
            console.log(`  그룹 밖 벽 객체 발견: wallType=${obj.get('wallType')}`);
            walls.push(obj);
          }
        }
      });

      console.log('최종 벽 객체 개수:', walls.length);
      walls.forEach((w, i) => {
        console.log(`벽[${i}]: type=${w.type}, wallType=${w.get('wallType')}`);
      });

      return walls;
    }

    useEffect(() => {
      const canvas = canvasInstance.current;
      if (!canvas) return;

      let isDragging = false; // 드래그 중인지 여부
      let hoveredWall = null; // 현재 hover된 벽 객체
      const originalStyles = new Map(); // 벽의 원래 스타일 저장용

      // 객체가 움직이기 시작하면 드래그 상태로 전환
      canvas.on('object:moving', (e) => {
        isDragging = true;
      });

      // 마우스 업 시 드래그 상태 해제 및 스타일 복원
      canvas.on('mouse:up', () => {
        isDragging = false;
        restoreWallStyle();
      });

      // 마우스 이동 중일 때 벽 위에 포인터가 있는지 확인
      canvas.on('mouse:move', (opt) => {
        if (!isDragging) return; // 드래그 중일 때만 반응

        const pointer = canvas.getPointer(opt.e); // 현재 마우스 위치
        const walls = getWallsFromCanvas(canvas); // 모든 벽 객체 가져오기 (그룹 내부 포함)

        // 포인터 아래 있는 벽 찾기
        const wallUnderPointer = walls.find(wall => wall.containsPoint(pointer));

        // 새로운 벽 위로 이동한 경우
        if (wallUnderPointer && wallUnderPointer !== hoveredWall) {
          restoreWallStyle(); // 이전 hover 벽 스타일 복원

          // 원래 스타일을 저장해둔다
          if (!originalStyles.has(wallUnderPointer)) {
            originalStyles.set(wallUnderPointer, {
              fill: wallUnderPointer.fill,
              stroke: wallUnderPointer.stroke,
            });
          }

          // hover 스타일로 변경
          wallUnderPointer.set({
            fill: 'rgba(180,180,180,0.7)',
            stroke: '#555',
          });

          // 벽 타입 로그 출력
          console.log('Hovered wallType:', wallUnderPointer.get('wallType'));

          hoveredWall = wallUnderPointer;
          canvas.renderAll();
        }

        // 벽에서 포인터가 벗어난 경우 스타일 복원
        if (!wallUnderPointer && hoveredWall) {
          restoreWallStyle();
          hoveredWall = null;
        }
      });

      // 벽 객체 스타일을 원래대로 되돌리는 함수
      const restoreWallStyle = () => {
        if (!hoveredWall) return;

        const original = originalStyles.get(hoveredWall);
        if (original) {
          hoveredWall.set({
            fill: original.fill,
            stroke: original.stroke,
          });
          originalStyles.delete(hoveredWall);
          canvas.renderAll();
        }
      };

      // cleanup: 이벤트 리스너 해제
      return () => {
        canvas.off('mouse:move');
        canvas.off('object:moving');
        canvas.off('mouse:up');
      };
    }, [isReady]);





    return <canvas ref={canvasRef} width={1100} height={650} />;
}

export default Editor;