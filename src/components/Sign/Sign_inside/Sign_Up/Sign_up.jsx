import { useState } from 'react';

import Logo from '../../../Header_Logo/Header_Logo';
import './Sign_up.css';
import handleSubmitFunc from './validateSubmit'; // 분리된 유효성검사 로직

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
        }, onSignInClick);
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
                                    onChange={(e) => setUserId(e.target.value)}
                                />
                            </div>

                            <div className='password'>
                                <input
                                    type='password'
                                    placeholder="비밀번호"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <div className='password_check'>
                                <input
                                    type='password'
                                    placeholder="비밀번호 확인"
                                    value={passwordCheck}
                                    onChange={(e) => setPasswordCheck(e.target.value)}
                                />
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
                                    onChange={(e) => setDomain(e.target.value)}
                                >
                                    <option value="" selected disabled>선택</option>
                                    <option value="google.com">gmail.com</option>
                                    <option value="naver.com">naver.com</option>
                                    <option value="daum.com">daum.net</option>
                                </select>
                            </div>

                            <div className='nickname'>
                                <input
                                    type='text'
                                    placeholder="닉네임"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                />
                            </div>

                            <div className="birth">
                                <p>생년월일</p>

                                <select name="year" value={birth.year} onChange={handleChange}>
                                    <option value="" disabled>연도</option>
                                    {years.map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>

                                <select name="month" value={birth.month} onChange={handleChange}>
                                    <option value="" disabled>월</option>
                                    {months.map((month) => (
                                    <option key={month} value={month}>{month}</option>
                                    ))}
                                </select>

                                <select name="day" value={birth.day} onChange={handleChange}>
                                    <option value="" disabled>일</option>
                                    {days.map((day) => (
                                    <option key={day} value={day}>{day}</option>
                                    ))}
                                </select>
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