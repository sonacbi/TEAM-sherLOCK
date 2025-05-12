import React, { useState, useRef, useEffect } from 'react';

import { validateId, validatePassword, checkLoginUserId } from './Sign_in_validateSubmit.js'; // 유효성 검사 로직(프론트) → Sign_in_submit.jsx(프론트 제출폼) 연동
import { submitLogin } from './Sign_in_submit.js'; // 새로 분리된 함수 import
import Logo from '../../../Header_Logo/Header_Logo';
import './Sign_in.css';

import Loading from '../../../Loading/Loading.jsx'

import Sign_background from '../../../../assets/images/Sign/Sign_background.png';
import kakao from '../../../../assets/images/Sign/Kakao.png';
import naver from '../../../../assets/images/Sign/Naver.png';
import google from '../../../../assets/images/Sign/Google.png';
import X from '../../../../assets/images/Sign/X.png';

function Sign_in({ onClose, onSignUpClick }) {
  // 👁️ 소셜 로그인시 로딩 중 화면 착시 테크닉
  const saved = localStorage.getItem('social_enter');
  let initialSherlock = false;
  let initialSocial = false;

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      initialSherlock = parsed.sherlock;
      initialSocial = parsed.social;
    } catch (e) {
      console.error('⚠️ social_enter 초기값 파싱 실패:', e);
    }
  }

  const [showSherlockLogin, setShowSherlockLogin] = useState(initialSherlock);
  const [showSocialLogin, setShowSocialLogin] = useState(initialSocial);

  // ⚙️ 유효성 검사 관련 상태 ---------------------------//
  const [user_id, setUserId] = useState('');
  const [user_pw, setUserPw] = useState('');
  const [idError, setUserIdError] = useState('');
  const [passwordError, setUserPwError] = useState('');

  // ⚙️ 최근 로그인 ---------------------------//
  const [lastLoginMethod, setLastLoginMethod] = useState('');

  // 로딩 상태 관리
  const [isLoading, setIsLoading] = useState(false);

  // ⚙️ 로그인 버튼 세팅 --------------------------------//
  const handleSherlockLoginClick = () => {
    setShowSherlockLogin(true);
    setShowSocialLogin(true);
  };
  // 👁️ 일괄적으로 유효성 검사 실시 → 📓로그인 폼 제출 -// 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // 1️⃣ (프론트) 아이디 형식 먼저 검사 (Msg = Message)
    const idMsg = validateId(user_id);
    if (idMsg) {
      setUserIdError(idMsg);
      setUserPwError('');
      return; // ❌ 형식 안 맞으면 그만
    }

    // 2️⃣ 서버에 아이디 존재 여부 확인
    let userExists = true;
    await checkLoginUserId(user_id, (msg) => {
      setUserIdError(msg);
      if (msg) userExists = false; // ❌ "존재하지 않습니다" 메시지 뜨면 검사 중단
      setUserPwError('');
    });

    if (!userExists) return; // ❌ 백엔드 검사 탈락 시 종료

    // 3️⃣ 아이디가 유효하니까 이제 비밀번호 검사
    const pwMsg = validatePassword(user_pw);
    setUserPwError(pwMsg);

    if (!idMsg && !pwMsg) {
      console.log("로그인 시도");
      await submitLogin(user_id, user_pw, setUserPwError, setIsLoading); // 유효성 검사 통과. 로그인 폼 제출(Sign_in_submit.js)
      // 로그인이 실패할 경우 '비밀번호가 일치하지 않았습니다' 메세지 리턴
    }
  };

  // ⚙️ capslock on/off 상태 검증 -------------------//
  const [capsLockOn, setCapsLockOn] = useState({ 
    password: false,
    passwordCheck: false
  });
  
  // 🔗 소셜 로그인 요청 (→ 백엔드로) ------------- //
  const handleSocial = (e) => {
    // 현재 로그인 UI 상태를 저장
    localStorage.setItem('social_enter', JSON.stringify({
      sherlock: showSherlockLogin,
      social: showSocialLogin,
    }));

    localStorage.setItem('prevPath', window.location.pathname); 
    
    const targetClass = e.currentTarget.className;

    if (targetClass.includes('kakao_login')) {
      window.location.href = "http://localhost:5000/auth/kakao/login";
    } else if (targetClass.includes('naver_login')) {
      window.location.href = "http://localhost:5000/auth/naver/login";
    } else if (targetClass.includes('google_login')) {
      window.location.href = "http://localhost:5000/auth/google/login";
    } else {
      console.error('알 수 없는 로그인 버튼 클릭됨');
    }
  };

  // ⚙️ 소셜 로그인에서 마운트시 현재 상태 다시 리턴하는 용도
  useEffect(() => {
    localStorage.removeItem('social_enter');
  }, []);


  
  const handleSignUpClick = () => {
    onSignUpClick();
  };

  // ⚙️ 최근 로그인 정보 불러오기 -------------------//
  useEffect(() => {
    const loginMethod = localStorage.getItem('lastLoginMethod');
    setLastLoginMethod(loginMethod);
  }, []);

  return (
    <div className='Sign_in'>
      <img id='Sign_background' src={Sign_background} alt='Sign_background' />

      <div className='Sign_content'>
        <img id='X' src={X} alt='X' onClick={onClose} />

        <Logo />

        <div className='login'>
          {!showSherlockLogin && (
            <div className='kakao_sherlock'>
              <div className={`kakao_login ${lastLoginMethod === 'kakao' ? 'highlight' : ''}`} onClick={handleSocial}>
                <img id='kakao' src={kakao} alt='kakao' />
                <p>Kakao 로그인</p>
              </div>
        
              <div className={`naver_login ${lastLoginMethod === 'naver' ? 'highlight' : ''}`} onClick={handleSocial}>
                <img id='naver' src={naver} alt='naver' />
                <p>Naver 로그인</p>
              </div>
        
              <div className={`google_login ${lastLoginMethod === 'google' ? 'highlight' : ''}`} onClick={handleSocial}>
                <img id='google' src={google} alt='google' />
                <p>Google 로그인</p>
              </div>
        
              <div className={`sherlock_login ${lastLoginMethod === 'general' ? 'highlight' : ''}`} onClick={handleSherlockLoginClick}>
                <p>셜LOCK ID 로그인</p>
              </div>
            </div>
          )}

          {showSherlockLogin && (
            <>
              <div className='sherlock'>
                <form onSubmit={handleSubmit}>
                  <div className='id'>
                    <input // 수정 -----------------------------------------//
                    type='text'
                    placeholder="셜LOCK ID"
                    value={user_id}
                    onChange={async (e) => {
                      const value = e.target.value;
                      setUserId(value); // 상태 저장
                  
                      const idValidationMsg = await validateId(value); // 비동기 유효성 검사
                      setUserIdError(idValidationMsg); // 결과 반영
                  
                    }}
                    onFocus={async () => {
                      const idValidationMsg = await validateId(user_id);
                      setUserIdError(idValidationMsg);

                    }}
                    onBlur={async () => {
                      const idValidationMsg = validateId(user_id);
                      setUserIdError(idValidationMsg);

                    }}
                    // 수정 ------------------------------------------------//
                    />
                    {idError && <p className='error_text'>{idError}</p>}
                    
                  </div>

                  <div className='password'>
                    <input // 수정 -----------------------------------------//
                    type='password'
                    placeholder="비밀번호"
                    value={user_pw}
                    onChange={(e) => {
                      const value = e.target.value;
                      setUserPw(value);                   // 입력된 값을 상태로 저장하고
                      setUserPwError(validatePassword(value)); // 동시에 validation도 실행
                    }}
                    onFocus={() => setUserPwError(validatePassword(user_pw))}
                    onKeyDown={(e) =>                   // capslock 버튼 감지
                      setCapsLockOn((prev) => ({ ...prev, password: e.getModifierState("CapsLock") }))
                    }
                    onBlur={() =>{
                      setCapsLockOn((prev) => ({ ...prev, password: false }));
                      setUserPwError(''); // ← 이 줄 추가하면 blur 시 에러 메시지 제거됨
                    }
                    }
                    // 수정 ------------------------------------------------//
                    />
                    {!capsLockOn.password && passwordError && (
                      <p className='error_text'>{passwordError}</p>
                    )}

                    {capsLockOn.password && (
                      <p className="warning_text">CapsLock이 켜져 있습니다!</p>
                    )}
                  </div>

                  <div className='button'>
                    <button type='submit'>로그인</button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>

        {showSocialLogin && (
          <div className='social_hidden'>
            <div className={`kakao_login2 ${lastLoginMethod === 'kakao' ? 'highlight' : ''}`} onClick={handleSocial}>
              <img id='kakao' src={kakao} alt='kakao'/>
            </div>

            <div className={`naver_login2 ${lastLoginMethod === 'naver' ? 'highlight' : ''}`} onClick={handleSocial}>
              <img id='naver' src={naver} alt='naver'/>
            </div>

            <div className={`google_login2 ${lastLoginMethod === 'google' ? 'highlight' : ''}`} onClick={handleSocial}>
              <img id='google' src={google} alt='google'/>
            </div>
          </div>
        )}

        <div className='Sign_up_text'>
          <p id='Sign_up' onClick={handleSignUpClick}>회원가입</p>
        </div>
      </div>

      {/* ✅ 로딩 모달 */}
      {isLoading && <Loading message="로그인 중 . . ." />}
    </div>
  );
}

export default Sign_in;