import React, { useState, useRef } from 'react';
import axios from 'axios';


import { validateId, validatePassword } from './Sign_in_validateSubmit.js'; // 유효성 검사 로직(프론트) → Sign_in_submit.jsx(프론트 제출폼) 연동
import { submitLogin } from './Sign_in_submit.js'; // 새로 분리된 함수 import
import Logo from '../../../Header_Logo/Header_Logo';
import './Sign_in.css';

import kakao from '../../../../assets/images/Sign/Kakao.png';
import Sign_up from '../../../../assets/images/Sign/Sign_Up.png';
import X from '../../../../assets/images/Sign/X.png';

function Sign_in({ onClose, onSignUpClick }) {
  const [showSherlockLogin, setShowSherlockLogin] = useState(false);
  const [showKakaoLogin, setShowKakaoLogin] = useState(false);

  // 유효성 검사 관련 상태 ---------------------------//
  const [user_id, setUserId] = useState('');
  const [user_pw, setUserPw] = useState('');
  const [idError, setUserIdError] = useState('');
  const [passwordError, setUserPwError] = useState('');
  // -------------------------------------------------//  

  const handleSherlockLoginClick = () => {
    setShowSherlockLogin(true);
    setShowKakaoLogin(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    

    // 유효성 검사
    const idMsg = validateId(user_id);
    const pwMsg = validatePassword(user_pw);
  
    setUserIdError(idMsg);
    setUserPwError(pwMsg);
  
    if (!idMsg && !pwMsg) {
      console.log("로그인 시도");
      await submitLogin(user_id, user_pw); // 유효성 검사 통과. 로그인 폼 제출(Sign_in_submit.jsx)
    }
  };

  const checkLoginUserId = async (id) => {
 
    try {
      const res = await axios.post('http://localhost:5000/auth/check-id', { user_id: id });
      const { exists } = res.data;
  
      if (!exists) {
        setUserIdError('아이디가 존재하지 않습니다.');
      } else {
        setUserIdError('');
      }
    } catch (err) {
      console.error('❌ 로그인 아이디 검사 에러:', err);
      setUserIdError('서버 오류가 발생했습니다.');
    }
  };

  const [capsLockOn, setCapsLockOn] = useState({ // capslock on/off
    password: false,
    passwordCheck: false
  });
  


  const handleSignUpClick = () => {
    onSignUpClick();
  };

  return (
    <div className='Sign_in'>
      <div className='Sign_content'>
        <img id='X' src={X} alt='X' onClick={onClose} />

        <Logo />

        <div className='login'>
          {!showSherlockLogin && (
            <div className='kakao_sherlock'>
              <div className='kakao_login'>
                <img id='kakao' src={kakao} alt='kakao' />
                <p>Kakao로 로그인</p>
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
                  
                      await checkLoginUserId(value); // 존재하는 아이디인지 백엔드로 체크
                    }}
                    onFocus={async () => {
                      const idValidationMsg = await validateId(user_id);
                      setUserIdError(idValidationMsg);
                      await checkLoginUserId(user_id);
                    }}
                    onBlur={() =>
                      setUserIdError('') // ← 이 줄 추가하면 blur 시 에러 메시지 제거됨
                    }
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

        {showKakaoLogin && (
          <div className='kakao_hidden'>
            <div className='kakao_login2'>
              <img id='kakao' src={kakao} alt='kakao' />
              <p>Kakao로 로그인</p>
            </div>
          </div>
        )}

        <div className='Sign_up_img'>
          <img id='Sign_up' src={Sign_up} alt='Sign_up' onClick={handleSignUpClick}/>
        </div>
      </div>
    </div>
  );
}

export default Sign_in;