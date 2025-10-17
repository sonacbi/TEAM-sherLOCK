import React from 'react';

import './Loading.css';

import Loading_lock_img from '../../assets/images/Loading/Loading_lock_img.png';

function Loading({ message, className = '' }) {
  return (
    <div className={`Loading_wrap ${className}`}>
      <div className='Loading_content'>
        <div className='Loading_line_lock'>
          <div className='Loading_line'></div>
          <img id='Loading_lock_img' src={Loading_lock_img} alt='Loading_lock_img' />
        </div>

        <p>{message}</p>
      </div>
    </div>
  );
}

export default Loading;