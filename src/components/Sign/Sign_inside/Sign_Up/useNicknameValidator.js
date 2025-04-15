// useNicknameValidator.js
// 리액트에서 useState, useEffect 같은 기본 훅들을 조합해서 직접 만드는 재사용 가능한 함수
// 이 함수 이름은 반드시 use로 시작. 예: useNicknameValidator, useTimer, useFormInput 등.

import { useRef, useState } from 'react';
import { checkDuplicated } from './Sign_up_validateSubmit.js';

export const useNicknameValidator = (delay = 300) => {
    const [error, setError] = useState('');
    const debounceTimer = useRef(null);
    const isComposing = useRef(false);

    const validateNickname = (value) => {
        if (!value) return '닉네임을 입력해주세요.';
        if (value.length < 2 || value.length > 10) return '2~10자 이내로 입력해주세요.';
        return '';
    };

    const checkNickname = async (value) => {
      const errorMsg = validateNickname(value);
      if (errorMsg) {
          setError(errorMsg);
          return;
      }
      
      const { success, message } = await checkDuplicated(value, 'nickname');
      if (!success) setError(message);
      else setError('');
    };

    const handleChange = (value) => {
        if (isComposing.current) return;

        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            checkNickname(value);
        }, delay);
    };

    // const handleCompositionStart = () => {
    //     isComposing.current = true;
    // };

    // const handleCompositionEnd = (value) => {
    //     isComposing.current = false;
    //     checkNickname(value);
    // };

    return {
        error,
        handleChange
    };
};
