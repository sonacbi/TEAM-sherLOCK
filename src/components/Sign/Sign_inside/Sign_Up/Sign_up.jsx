import { useState } from 'react';

import Logo from '../../../Header_Logo/Header_Logo';
import './Sign_up.css';

import Sign_in from '../../../../assets/images/Sign/Sign_In.png';
import X from '../../../../assets/images/Sign/X.png';

function Sign_up({ onClose, onSignInClick }) {
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

    return (
        <div className='Sign_up'>
            <div className='Sign_up_content'>
                <img id='X' src={X} alt='X' onClick={onClose} />

                <Logo />

                <div className='information'>
                    <div className='sherlock'>
                        <form>
                            <div className='id'>
                                <input type='text' placeholder="셜LOCK ID" />
                            </div>

                            <div className='password'>
                                <input type='password' placeholder="비밀번호" />
                            </div>

                            <div className='password_check'>
                                <input type='password' placeholder="비밀번호 확인" />
                            </div>

                            <div className='email'>
                                <input type='text' placeholder="email" />

                                <p>@</p>

                                <select name="domain">
                                    <option value="" selected disabled>선택</option>
                                    <option value="google">gmail.com</option>
                                    <option value="naver">naver.com</option>
                                    <option value="daum">daum.net</option>
                                </select>
                            </div>

                            <div className='nickname'>
                                <input type='text' placeholder="닉네임" />
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
                                <button>회원가입</button>
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