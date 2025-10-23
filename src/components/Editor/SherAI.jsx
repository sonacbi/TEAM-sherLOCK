import React, { useState, useEffect } from 'react';

import Loading from '../Loading/Loading';

import './SherAI.css';

import sher_ai_img from '../../assets/images/EditorPage_img/sher_ai.png';
import sher_ai_background from '../../assets/images/EditorPage_img/sher_ai_background.png';
import explanation_sherai_img from '../../assets/images/EditorPage_img/explanation_sherai_img.png';
import prompt_X from '../../assets/images/Sign/X.png';

function SherAI({setGameZip}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const examples = [
    '배경은 어두운 병원, 스토리는 원혼이 떠도는 병동에서 단서를 찾아 저주를 풀고 탈출하는 이야기',
    '배경은 무너져가는 고대 유적, 스토리는 시간 안에 비밀의 문을 열어 숨겨진 보물을 찾는 모험 이야기',
    '배경은 고급 저택, 스토리는 살인사건의 범인을 찾기 위해 증거를 수집하고 추리를 이어가는 이야기',
    '배경은 폐허가 된 놀이공원, 스토리는 정체불명의 존재를 피해 탈출구를 찾는 공포 이야기',
    '배경은 비밀 지하실, 스토리는 과거의 범죄 흔적을 추적하며 감춰진 진실을 밝혀내는 미스터리 이야기',
  ];

  const [exampleIndex, setExampleIndex] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('프롬프트 분석 중...');

  const messages = [
    { progress : 'analyzing', text: '프롬프트 분석 중...', duration: 3000 },
    { progress : 'designing', text: '스토리 구조 설계 중...', duration: 6000 },
    { progress : 'creating', text: '스테이지 생성 중...', duration: 12000 },
    { progress : 'checking', text: '점검 중...', duration: 3000 },
    { progress : 'completing', text: '곧 생성이 완료됩니다.', duration: 4000 },
  ];

  const handleExampleClick = () => {
    const nextIndex = (exampleIndex + 1) % examples.length;
    setExampleIndex(nextIndex);
    setPrompt(examples[nextIndex]);
  };

  const handleGenerate = () => {
    const time = messages.reduce((sum, msg)=>sum+msg.duration, 0)
    console.log('time',time)
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsOpen(false);
      setPrompt('');
      setExampleIndex(0);
    }, time); // 25초 뒤 로딩 종료 (테스트용)
  };

  const getAIGame = async() => {
    await fetch(`http://localhost:4000/ai_game?prompt=${prompt}`)
    .then(res => res.blob())
    .then(blob => {
        const file = new File([blob], "game.zip", { type: "application/zip" });
        setGameZip(file); // loadGameZip에서 처리
    })
    .catch(error => {
        console.error('게임 파일 불러오는 중 오류 발생', error);
    });
  }

  useEffect(() => {
    if (isLoading) {
      let index = 0;
      setLoadingMessage(messages[index].text);

      const changeMessage = () => {
        index++;
        if (index < messages.length) {
          if (messages[index].progress === 'creating') {
            // setGameZip()
            getAIGame();
          }
          setLoadingMessage(messages[index].text);
          setTimeout(changeMessage, messages[index].duration);
        }
      };

      setTimeout(changeMessage, messages[index].duration);

      return () => clearTimeout(changeMessage);
    }
  }, [isLoading]);

  return (
    <>
      <div className='sher_ai_button' onClick={() => setIsOpen(true)}>
        <img id='sher_ai_img' src={sher_ai_img} alt='sher_ai_img' />
        <p>SHER AI</p>
      </div>

      {isOpen && (
        <div className='sher_ai_wrap'>
          <div className='sher_ai_content'>
            <img id='sher_ai_background' src={sher_ai_background} alt='sher_ai_background' />

            <div className='sher_ai_prompt'>
              <div className='explanation_wrap'>
                <div className='explanation_content'>
                  <div className='explanation_sherai'>
                    <img id='explanation_sherai_img' src={explanation_sherai_img} alt='explanation_sherai_img' />
                    <h1>SHER AI</h1>
                  </div>

                  <div className='explanation_text'>
                    <p>방탈출 창작의 시작, SHER AI와 함께하세요.</p>
                  </div>
                </div>
              </div>

              <div className='prompt'>
                <div 
                  className={`prompt_exit ${isLoading ? 'disabled_exit' : ''}`} 
                  onClick={() => {
                    if (isLoading) return;
                    setIsOpen(false);
                    setPrompt('');
                    setExampleIndex(0);
                  }}
                >
                  <img id='prompt_X' src={prompt_X} alt='prompt_X' />
                </div>

                <div className='prompt_content'>
                  <h1>원하는 방탈출 스토리와 구조를<br/>입력해보세요.</h1>

                  <div className='prompt_inputbox'>
                    {isLoading && <Loading message={loadingMessage} className="sherai_loading" />}

                    <div className='prompt_button'>
                      <p onClick={handleExampleClick}>예시</p>
                      <h2 onClick={handleGenerate}>←</h2>
                    </div>

                    <div className='prompt_input'>
                      <textarea 
                        placeholder='내용을 입력해주세요.'
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) { // Enter 단독 입력 시
                            e.preventDefault(); // 줄바꿈 방지
                            handleGenerate();   // 로딩 실행
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SherAI;