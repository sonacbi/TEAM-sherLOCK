// 파일: ./PerspectiveFrame/useClearPolygonsAfterLoad.js
import { useEffect, useState } from 'react';
import * as fabric from 'fabric';

const useClearPolygonsAfterLoad = (canvasInstance, perspectiveRef, isReadyToLoad) => {
  const [didClear, setDidClear] = useState(false);

  useEffect(() => {
    if (!isReadyToLoad || didClear) return;

    const canvas = canvasInstance.current;
    if (!canvas || !perspectiveRef.current) return;

    const allObjects = canvas.getObjects();
    console.log("useClearPolygonsAfterLoad 실행, 전체 오브젝트 수:", allObjects.length);

    // -------------------------------
    // 구버전: 전체 폴리곤 일괄 탐색 (참고용)
        // Object.entries(perspectiveRef.current).forEach(([roomId, roomData]) => {
    //   Object.entries(roomData).forEach(([sideId, walls]) => {
    //     Object.entries(walls).forEach(([wallType, wallData]) => {
    //       if (!wallData?.imageUrl) return;

    //       let polygon = null;

    //       for (const obj of allObjects) {
    //         // 그룹 내부까지 탐색
    //         if (obj.type === 'group' || obj.type === 'path-group') {
    //           polygon = (obj._objects ?? []).find(o =>
    //             o.wallType === wallType &&
    //             o.currentRoom == roomId &&
    //             o.currentSide == sideId
    //           );
    //           if (polygon) break;
    //         } else {
    //           if (
    //             obj.wallType === wallType &&
    //             obj.currentRoom == roomId &&
    //             obj.currentSide == sideId
    //           ) {
    //             polygon = obj;
    //             break;
    //           }
    //         }
    //       }

    //       if (polygon) {
    //         console.log(`✅ 폴리곤 매칭 성공: room=${roomId}, side=${sideId}, wallType=${wallType}`);
    //         polygon.set({
    //           fill: 'rgba(0,0,0,0)',
    //           stroke: 'rgba(0,0,0,0)',
    //           selectable: false,
    //           evented: false
    //         });
    //       } else {
    //         console.log(`❌ 폴리곤 매칭 실패: room=${roomId}, side=${sideId}, wallType=${wallType}`);
    //         console.log('  캔버스 객체 확인:', allObjects.map(o => ({
    //           type: o.type,
    //           wallType: o.wallType,
    //           currentRoom: o.currentRoom,
    //           currentSide: o.currentSide
    //         })));
    //       }
    //     });
    //   });
    // });
    // -------------------------------

    // 특정 폴리곤 찾기
    const findPolygon = (wallType, roomId, sideId) => {
      for (const obj of allObjects) {
        // group 내부 탐색
        const objs = obj._objects ?? [];
        for (const child of objs) {
          if (
            child.wallType === wallType &&
            child.currentRoom == roomId &&
            child.currentSide == sideId
          ) return child;
        }

        // 직접 매칭
        if (
          obj.wallType === wallType &&
          obj.currentRoom == roomId &&
          obj.currentSide == sideId
        ) return obj;
      }
      return null;
    };

    // front 처리
    Object.entries(perspectiveRef.current).forEach(([roomId, roomData]) => {
      Object.entries(roomData).forEach(([sideId, walls]) => {
        Object.entries(walls).forEach(([wallType, wallData]) => {
          if (!wallData?.imageUrl) return; // 이미지 없으면 건너뜀

          const polygon = findPolygon(wallType, roomId, sideId);
          if (polygon) {
            polygon.set({
              fill: 'rgba(0,0,0,0)',
              stroke: 'rgba(0,0,0,0)',
              selectable: false,
              evented: false
            });

            // front 벽이면 controller도 투명화
            if (wallType === 'front') {
              const controller = canvas.getObjects().find(obj => obj?.name === 'SherLockRoomController');
              if (controller) controller.set({ fill: 'rgba(0,0,0,0)', stroke: 'rgba(0,0,0,0)' });
            }

            console.log(`✅ 폴리곤 매칭 성공: room=${roomId}, side=${sideId}, wallType=${wallType}`);
          } else {
            console.log(`⚠ 폴리곤 없음, 건너뜀: room=${roomId}, side=${sideId}, wallType=${wallType}`);
          }
        });
      });
    });

    // SherLockRoomFrame 맨 뒤로 안전하게
    const frame = allObjects.find(obj => obj?.name === 'SherLockRoomFrame');
    if (frame && typeof frame.sendToBack === 'function') {
      frame.sendToBack();
    }


    canvas.requestRenderAll();
    setDidClear(true);
  }, [canvasInstance, perspectiveRef, isReadyToLoad, didClear]);
};

export default useClearPolygonsAfterLoad;
