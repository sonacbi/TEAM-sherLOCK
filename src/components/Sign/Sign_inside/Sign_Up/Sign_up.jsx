import { useState } from 'react';

import Logo from '../../../Header_Logo/Header_Logo';
import './Sign_up.css';
import handleSubmitFunc from './Sign_up_validateSubmit'; // 분리된 유효성검사 로직 → Sign_up_submit.js (프론트 제출폼) 연동
import { validateId, validatePassword, validatePasswordCheck, validateNickname, validateEmail, validateBirth} from './Sign_up_validateSubmit'; 

import Sign_in from '../../../../assets/images/Sign/Sign_In.png';
import X from '../../../../assets/images/Sign/X.png';

function Sign_up({ onClose, onSignInClick }) {
    /* -----(기존) 회원가입 화면 기본값 세팅----- */
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1899 }, (_, i) => 1900 + i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    const [birth, setBirth] = useState({
        year: '',
        month: '',
        day: ''
    });

    const handleChange = (e) => {
        setBirth({
        ...birth,
        [e.target.name]: e.target.value
        });
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

    /* -----(추가) 회원가입 폼 제출 액션 ----- */
    
    // (유효성 검사 로직 분리)

    const handleSubmit = (e) => { // 임포트한 코드 객체 생성
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


    /* -------------------------------------- */

    return (
        <div className='Sign_up'>
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
                                />
                                    {errors.userId && <p className="error">{errors.userId}</p>}
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
                                />
                                {errors.password && <p className="error">{errors.password}</p>}
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
                                />
                                {errors.passwordCheck && <p className="error">{errors.passwordCheck}</p>}
                            </div>

                            <div className='email'>
                                <input
                                    type='text'
                                    placeholder="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />

                                <p>@</p>

                                <select
                                    name="domain"
                                    value={domain}
                                    onChange={(e) => {
                                            const value = e.target.value;
                                            setDomain(value);
    
                                            const errorMessage = validateEmail(value);
                                            setErrors((prevErrors) => ({
                                            ...prevErrors,
                                            email: errorMessage
                                            }));
                                        }}
                                >
                                    <option value="" disabled>선택</option> {/* selected disabled → disabled로 수정함 (확인요망) */}
                                    <option value="google.com">gmail.com</option>
                                    <option value="naver.com">naver.com</option>
                                    <option value="daum.com">daum.net</option>
                                </select>
                                {errors.email && <p className="error">{errors.email}</p>}
    
                            </div>

                            <div className='nickname'>
                                <input
                                    type='text'
                                    placeholder="닉네임"
                                    value={nickname}
                                    onChange={(e) => 
                                        {
                                            const value = e.target.value;
                                            setNickname(value);
    
                                            const errorMessage = validateNickname(value);
                                            setErrors((prevErrors) => ({
                                            ...prevErrors,
                                            nickname: errorMessage
                                            }));
                                        }}
                                />
                                {errors.nickname && <p className="error">{errors.nickname}</p>}
                            </div>

                            <div className="birth">
                                <p>생년월일</p>

                                <select name="year" value={birth.year}
                                    onChange={(e) => {
                                        handleChange(e);
                                        const newBirth = {
                                            ...birth,
                                            [e.target.name]: e.target.value
                                        };
                                        const errorMessage = validateBirth(newBirth);
                                        setErrors((prevErrors) => ({
                                            ...prevErrors,
                                            birth: errorMessage
                                        }));
                                    }}>
                                    <option value="" disabled>연도</option>
                                    {years.map((year) => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>

                                <select name="month" value={birth.month}
                                    onChange={(e) => {
                                        handleChange(e);
                                        const newBirth = {
                                            ...birth,
                                            [e.target.name]: e.target.value
                                        };
                                        const errorMessage = validateBirth(newBirth);
                                        setErrors((prevErrors) => ({
                                            ...prevErrors,
                                            birth: errorMessage
                                        }));
                                    }}>
                                    <option value="" disabled>월</option>
                                    {months.map((month) => (
                                        <option key={month} value={month}>{month}</option>
                                    ))}
                                </select>

                                <select name="day" value={birth.day}
                                    onChange={(e) => {
                                        handleChange(e);
                                        const newBirth = {
                                            ...birth,
                                            [e.target.name]: e.target.value
                                        };
                                        const errorMessage = validateBirth(newBirth);
                                        setErrors((prevErrors) => ({
                                            ...prevErrors,
                                            birth: errorMessage
                                        }));
                                    }}>
                                    <option value="" disabled>일</option>
                                    {days.map((day) => (
                                        <option key={day} value={day}>{day}</option>
                                    ))}
                                </select>
                                {errors.birth && <p className="error">{errors.birth}</p>}
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