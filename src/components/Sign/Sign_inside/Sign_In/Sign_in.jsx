import React, { useState } from 'react';

import Logo from '../../../Header_Logo/Header_Logo';
import './Sign_in.css';

import kakao from '../../../../assets/images/Sign/Kakao.png';
import Sign_up from '../../../../assets/images/Sign/Sign_Up.png';
import X from '../../../../assets/images/Sign/X.png';

import { validateId, validatePassword } from './validated.jsx';

function Sign_in({ onClose }) {
  const [showSherlockLogin, setShowSherlockLogin] = useState(false);

  // 유효성 검사 관련 상태 ---------------------------//
  const [user_id, setUserId] = useState('');
  const [user_pw, setUserPw] = useState('');
  const [idError, setUserIdError] = useState('');
  const [passwordError, setUserPwError] = useState('');
  // -------------------------------------------------//  

  const handleSherlockLoginClick = () => {
    setShowSherlockLogin(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const idMsg = validateId(user_id);
    const pwMsg = validatePassword(user_pw);

    setUserIdError(idMsg);
    setUserPwError(pwMsg);

    if (!idMsg && !pwMsg) {
      console.log('로그인 시도!');
      // TODO: 실제 로그인 처리 로직 (백엔드용 코드) (추가예정) -----------//
    }
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
                    onChange={(e) => {
                      const value = e.target.value;
                      setUserId(value);                   // 입력된 값을 상태로 저장하고
                      setUserIdError(validateId(value)); // 동시에 validation도 실행
                    }}
                    onFocus={() => setUserIdError('')}    // 포커스 시 에러 초기화
                    
                    className={idError ? 'input-error' : ''}
                    // 수정 ------------------------------------------------//
                    />

                    {idError && <p className='error-text'>{idError}</p>}
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
                    className = {passwordError ? 'input-error' : ''}
                    // 수정 ------------------------------------------------//
                    />
                    {passwordError && <p className='error-text'>{passwordError}</p>}
                  </div>

                  <div className='button'>
                    <button type='submit'>로그인</button>
                  </div>
                </form>
              </div>

              <div className='kakao_hidden'>
                <div className='kakao_login2'>
                  <img id='kakao' src={kakao} alt='kakao' />
                  <p>Kakao로 로그인</p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className={`Sign_up_img ${showSherlockLogin ? 'move-down' : ''}`}>
          <img id='Sign_up' src={Sign_up} alt='Sign_up' />
        </div>
      </div>
    </div>
  );
}

export default Sign_in;