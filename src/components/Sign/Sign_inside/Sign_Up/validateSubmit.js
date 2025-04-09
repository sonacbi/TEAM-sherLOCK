// sign_validate.js
import signSubmit from './sign_submit';

const handleSubmit = async (e, formData, onSuccess, onFailure) => {
    e.preventDefault();

    const { userId, password, passwordCheck, nickname, email, domain, birth } = formData;

    if (password !== passwordCheck) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }

    const result = await signSubmit({ userId, password, nickname, email, domain, birth });

    if (result.success) {
        alert('회원가입 성공!');
        onSuccess();
    } else {
        alert(result.message || '회원가입 실패!');
        if (onFailure) onFailure(result);
    }
};

export default handleSubmit;
