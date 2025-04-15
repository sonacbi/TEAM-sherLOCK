import React, { useState, useRef, useEffect } from 'react';

import handleSubmitFunc from './Sign_up_validateSubmit.js'; // 분리된 유효성검사 로직 → Sign_up_submit.js (프론트 제출폼) 연동
import { validateId, validatePassword, validatePasswordCheck, validateNickname, validateEmail, validateBirth} from './Sign_up_validateSubmit.js';

import Logo from '../../../Header_Logo/Header_Logo';
import './Sign_up.css'; 

import Sign_background from '../../../../assets/images/Sign/Sign_background.png';
import Sign_in from '../../../../assets/images/Sign/Sign_In.png';
import X from '../../../../assets/images/Sign/X.png';

function Sign_up({ onClose, onSignInClick }) {
    /* -----(기존) 회원가입 화면 기본값 세팅----- */
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 101 }, (_, i) => currentYear - i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    const [birth, setBirth] = useState({
        year: '',
        month: '',
        day: ''
    });

    // 생일 input 처리 통합 함수
    const handleBirthChange = (e) => {
        const updatedBirth = {
            ...birth,
            [e.target.name]: e.target.value
        };
        setBirth(updatedBirth);

        const errorMessage = validateBirth(updatedBirth);
        setErrors((prevErrors) => ({
            ...prevErrors,
            birth: errorMessage
        }));
    };

    // 생일 focus 시 처리 함수
    const handleBirthFocus = () => {
        const errorMessage = validateBirth(birth);
        setErrors((prevErrors) => ({
            ...prevErrors,
            birth: errorMessage
        }));
    };

    // 생일 blur 처리 함수
    const handleBirthBlur = () => {
        setErrors((prevErrors) => ({
            ...prevErrors,
            birth: ''
        }));
    };


    const handleSignInClick = () => {
        onSignInClick();
    };

    /* -----(추가) 회원가입 폼 객체 생성 ----- */

    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [passwordCheck, setPasswordCheck] = useState('');
    const [email, setEmail] = useState('');
    const [domain, setDomain] = useState('');
    const [nickname, setNickname] = useState('');
    // 생일은 위에서 이미 선언됨

    /* -----(추가) 회원가입 폼 프론트 유효성 검사 ----- */
    const [errors, setErrors] = useState({
        userId: '',
        password: '',
        passwordCheck: '',
        nickname: '',
        email: '',
        birth: ''
    });      
    const [capsLockOn, setCapsLockOn] = useState({ // capslock on/off
        password: false,
        passwordCheck: false
      });
    /* -----(추가) 회원가입 폼 제출 액션 ----- */
    
    // (유효성 검사 로직 분리)

    const handleSubmit = (e) => { // 임포트한 코드 객체 생성
        console.log("회원가입 시도!");
        handleSubmitFunc(e, {
            userId,
            password,
            passwordCheck,
            nickname,
            email,
            domain,
            birth
        }, setErrors, onSignInClick);
    };
    /* -----(추가) 닉네임 입력칸 버그 픽스 ----- */
    /* 닉네임 입력칸 버그 픽스 */
    const [isComposing, setIsComposing] = useState(false);
    const debounceTimer = useRef(null);

    const handleChange_nick = (e) => {
        setNickname(e.target.value); // 상태 업데이트
    };

    const handleCompositionStart = () => {
        setIsComposing(true);
    };

    const handleCompositionEnd = (e) => {
        setIsComposing(false);

        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(async () => {
            await checkNickname(e.target.value);
        }, 150);
        
    };

    useEffect(() => {
        if (isComposing) return;

        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(async () => {
            await checkNickname(nickname);
        }, 300);
        
    }, [nickname]);

    const checkNickname = async (value) => {
        if (!value) return;

        console.log("닉네임 검사 실행:", value);
        const errorMessage = await validateNickname(value); // ← 최신값 반영
        setErrors((prevErrors) => ({
            ...prevErrors,
            nickname: errorMessage,
        }));
    };

      

    /* -------------------------------------- */

    return (
        <div className='Sign_up'>
            <img id='Sign_background' src={Sign_background} alt='Sign_background' />

            <div className='Sign_up_content'>
                <img id='X' src={X} alt='X' onClick={onClose} />

                <Logo />

                <div className='information'>
                    <div className='sherlock'>
                        <form>
                            <div className='id'>
                                <input
                                    type='text'
                                    placeholder="셜LOCK ID"
                                    value = {userId}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setUserId(value);

                                        const errorMessage = validateId(value);
                                        setErrors((prevErrors) => ({
                                        ...prevErrors,
                                        userId: errorMessage
                                        }));
                                    }}
                                    onFocus={() => {
                                        const errorMessage = validateId(userId);
                                        setErrors((prevErrors) => ({
                                        ...prevErrors,
                                        userId: errorMessage
                                        }));
                                    }}    // 포커스 시 에러 검증
                                    onBlur={() =>
                                        setErrors('') // ← 이 줄 추가하면 blur 시 에러 메시지 제거됨
                                    }
                                />
                                    {errors.userId && <p className="error_text">{errors.userId}</p>}
                            </div>

                            <div className='password'>
                                <input
                                    type='password'
                                    placeholder="비밀번호"
                                    value={password}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setPassword(value);

                                        const errorMessage = validatePassword(value);
                                        setErrors((prevErrors) => ({
                                        ...prevErrors,
                                        password: errorMessage
                                        }));
                                    }}
                                    onFocus={() => {
                                        const errorMessage = validatePassword(password);
                                        setErrors((prevErrors) => ({
                                        ...prevErrors,
                                        password: errorMessage
                                        }));
                                    }}    // 포커스 시 에러 검증
                                    onKeyDown={(e) =>                   // capslock 버튼 감지
                                        setCapsLockOn((prev) => ({ ...prev, password: e.getModifierState("CapsLock") }))
                                    }
                                    onBlur={() =>{
                                        setCapsLockOn((prev) => ({ ...prev, password: false }));
                                        setErrors(''); // ← 이 줄 추가하면 blur 시 에러 메시지 제거됨
                                    }}
                                />
                                {!capsLockOn.password && errors.password && (
                                <p className="error_text">{errors.password}</p>
                                )}

                                {capsLockOn.password && (
                                <p className="warning_text">CapsLock이 켜져 있습니다!</p>
                                )}

                            </div>

                            <div className='password_check'>
                                <input
                                    type='password'
                                    placeholder="비밀번호 확인"
                                    value={passwordCheck}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setPasswordCheck(value);

                                        const errorMessage = validatePasswordCheck(password, value);
                                        setErrors((prevErrors) => ({
                                        ...prevErrors,
                                        passwordCheck: errorMessage
                                        }));
                                        }}
                                    onFocus={() => {
                                        const errorMessage = validatePasswordCheck(password, passwordCheck);
                                        setErrors((prevErrors) => ({
                                        ...prevErrors,
                                        passwordCheck: errorMessage
                                        }));
                                    }}    // 포커스 시 에러 검증
                                    onKeyDown={(e) =>                   // capslock 버튼 감지
                                        setCapsLockOn((prev) => ({ ...prev, passwordCheck: e.getModifierState("CapsLock") }))
                                    }
                                    onBlur={() =>{
                                        setCapsLockOn((prev) => ({ ...prev, passwordCheck: false }));
                                        setErrors('');} // ← 이 줄 추가하면 blur 시 에러 메시지 제거됨

                                    }
                                />
                                {!capsLockOn.passwordCheck && errors.passwordCheck && (
                                <p className="error_text">{errors.passwordCheck}</p>
                                )}

                                {capsLockOn.passwordCheck && (
                                <p className="warning_text">CapsLock이 켜져 있습니다!</p>
                                )}
                            </div>

                            <div className='email'>
                                <div className='email_input'>
                                    <input
                                        type='text'
                                        placeholder="email"
                                        value={email}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setEmail(value);
                                            
                                            const errorMessage = validateEmail(value, domain);
                                                setErrors((prevErrors) => ({
                                                ...prevErrors,
                                                email: errorMessage
                                            }));
                                        }}
                                    />

                                    <p>@</p>

                                    <select
                                        name="domain"
                                        value={domain}
                                        onChange={(e) => {
                                                const value = e.target.value;
                                                setDomain(value);
        
                                                const errorMessage = validateEmail(email, value);
                                                setErrors((prevErrors) => ({
                                                ...prevErrors,
                                                email: errorMessage
                                                }));
                                            }}
                                    onFocus={() => {
                                        const errorMessage = validateEmail(email, domain);
                                        setErrors((prevErrors) => ({
                                        ...prevErrors,
                                        email: errorMessage
                                        }));
                                    }}    // 포커스 시 에러 검증
                                    onBlur={() =>
                                        setErrors('') // ← 이 줄 추가하면 blur 시 에러 메시지 제거됨
                                    }
                                    >
                                        <option value="" disabled>선택</option> {/* selected disabled → disabled로 수정함 (확인요망) */}
                                        <option value="google.com">gmail.com</option>
                                        <option value="naver.com">naver.com</option>
                                        <option value="daum.com">daum.net</option>
                                    </select>
                                </div>
                                
                                {errors.email && <p className="error_text">{errors.email}</p>}
    
                            </div>

                            <div className='nickname'>
                                <input
                                    type='text'
                                    placeholder="닉네임"
                                    value={nickname}
                                    onChange={handleChange_nick}
                                    onCompositionStart={handleCompositionStart}
                                    onCompositionEnd={handleCompositionEnd}
                                />
                                {errors.nickname && <p className="error_text">{errors.nickname}</p>}
                            </div>
                            <div className="birth">
                                <div className='birth_input'>
                                    <p>생년월일</p>

                                    <select
                                        name="year"
                                        value={birth.year}
                                        onChange={handleBirthChange}
                                        onFocus={handleBirthFocus}
                                        onBlur={handleBirthBlur}
                                    >
                                        <option value="" disabled>연도</option>
                                        {years.map((year) => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>

                                    <select
                                        name="month"
                                        value={birth.month}
                                        onChange={handleBirthChange}
                                        onFocus={handleBirthFocus}
                                        onBlur={handleBirthBlur}
                                    >
                                        <option value="" disabled>월</option>
                                        {months.map((month) => (
                                            <option key={month} value={month}>{month}</option>
                                        ))}
                                    </select>

                                    <select
                                        name="day"
                                        value={birth.day}
                                        onChange={handleBirthChange}
                                        onFocus={handleBirthFocus}
                                        onBlur={handleBirthBlur}
                                    >
                                        <option value="" disabled>일</option>
                                        {days.map((day) => (
                                            <option key={day} value={day}>{day}</option>
                                        ))}
                                    </select>
                                </div>

                                {errors.birth && <p className="error_text">{errors.birth}</p>}
                            </div>
                            <div className='button'>
                                <button type="submit" onClick={handleSubmit}>회원가입</button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className='Sign_in_img'>
                    <img id='Sign_in' src={Sign_in} alt='Sign_in' onClick={handleSignInClick}/>
                </div>
            </div>
        </div>
    );
}

export default Sign_up;