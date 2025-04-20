import React from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export default function LocalZIPSaveGame(props) {
  const game = props.game;
  const thumnailImg = props.imgs.thumnailImg;
  const stageImg = props.imgs.stageImg;

  function handleDownload1() {
    const zip = new JSZip();

    // ZIP에 파일 추가
    zip.file("game.json", JSON.stringify(game, null, 2));
    zip.file(`${thumnailImg.name}`, thumnailImg);
    stageImg.map((data) => {
      zip.file(`${data.name}`, data)
    })

    // zip 파일 생성 후 다운로드
    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, `sherlock_game[${game.title}].zip`);
    });
  };

  function handleDownload2() {
    const zip = new JSZip();

    // ZIP에 파일 추가
    zip.file("game.json", JSON.stringify(game, null, 2));
    zip.file("thumbnail.png", thumnailImg);
    stageImg.map((data, index) => {
      zip.file(`stage${index}.png`, data)
    })

    // zip 파일 생성 후 다운로드
    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, 'game.zip');
    });
  };

  return (
    <div>
      <button onClick={handleDownload1}>ZIP 다운로드1</button>
      <button onClick={handleDownload2}>ZIP 다운로드2</button>
    </div>
  );
};