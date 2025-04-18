import React, { useState, useRef } from 'react';

import { validateId, validatePassword, checkLoginUserId } from './Sign_in_validateSubmit.js'; // 유효성 검사 로직(프론트) → Sign_in_submit.jsx(프론트 제출폼) 연동
import { submitLogin } from './Sign_in_submit.js'; // 새로 분리된 함수 import
import Logo from '../../../Header_Logo/Header_Logo';
import './Sign_in.css';

import Sign_background from '../../../../assets/images/Sign/Sign_background.png';
import kakao from '../../../../assets/images/Sign/Kakao.png';
import naver from '../../../../assets/images/Sign/Naver.png';
import Sign_up from '../../../../assets/images/Sign/Sign_Up.png';
import X from '../../../../assets/images/Sign/X.png';

function Sign_in({ onClose, onSignUpClick }) {
  const [showSherlockLogin, setShowSherlockLogin] = useState(false);
  const [showSocialLogin, setShowSocialLogin] = useState(false);

  // ⚙️ 유효성 검사 관련 상태 ---------------------------//
  const [user_id, setUserId] = useState('');
  const [user_pw, setUserPw] = useState('');
  const [idError, setUserIdError] = useState('');
  const [passwordError, setUserPwError] = useState('');

  // ⚙️ 로그인 버튼 세팅 --------------------------------//
  const handleSherlockLoginClick = () => {
    setShowSherlockLogin(true);
    setShowSocialLogin(true);
  };
  // 👁️ 일괄적으로 유효성 검사 실시 → 📓로그인 폼 제출 -// 
  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
      await submitLogin(user_id, user_pw, setUserPwError); // 유효성 검사 통과. 로그인 폼 제출(Sign_in_submit.js)
      // 로그인이 실패할 경우 '비밀번호가 일치하지 않았습니다' 메세지 리턴턴
    }
  };

  // ⚙️ capslock on/off 상태 검증 -------------------//
  const [capsLockOn, setCapsLockOn] = useState({ 
    password: false,
    passwordCheck: false
  });
  
  // 🔗 소셜 로그인 요청 (→ 백엔드로) ------------- //
  const handleSocial = (e) => {  
    const targetClass = e.currentTarget.className;

    if (targetClass.includes('kakao_login')) {
      window.location.href = "http://localhost:5000/auth/kakao/login";
    } else if (targetClass.includes('naver_login')) {
      window.location.href = "http://localhost:5000/auth/naver/login";
    } else {
      console.error('알 수 없는 로그인 버튼 클릭됨');
    }
  };
  
  const handleSignUpClick = () => {
    onSignUpClick();
  };

  return (
    <div className='Sign_in'>
      <img id='Sign_background' src={Sign_background} alt='Sign_background' />

      <div className='Sign_content'>
        <img id='X' src={X} alt='X' onClick={onClose} />

        <Logo />

        <div className='login'>
          {!showSherlockLogin && (
            <div className='kakao_sherlock'>
              <div className='kakao_login' onClick={handleSocial}>
                <img id='kakao' src={kakao} alt='kakao' />
                <p>Kakao 로그인</p>
              </div>

              {/* 네이버 api 테스트용 코드 */}
              <div className='naver_login' onClick={handleSocial}>
                <img id='naver' src={naver} alt='naver' />
                <p>Naver 로그인</p>
              </div>

              <div className='sherlock_login' onClick={handleSherlockLoginClick}>
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
          <>
            <div className='kakao_hidden'>
              <div className='kakao_login2' onClick={handleSocial}>
                <img id='kakao' src={kakao} alt='kakao' />
                <p>Kakao 로그인</p>
              </div>
            </div>

            <div className='naver_hidden'>
              <div className='naver_login2' onClick={handleSocial}>
                <img id='naver' src={naver} alt='naver' />
                <p>Naver 로그인</p>
              </div>
            </div>
          </>
        )}

        <div className='Sign_up_img'>
          <img id='Sign_up' src={Sign_up} alt='Sign_up' onClick={handleSignUpClick}/>
        </div>
      </div>
    </div>
  );
}

export default Sign_in;