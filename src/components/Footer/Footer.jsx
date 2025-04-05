import React from 'react';

import './Footer.css';

import footer_logo from '../../assets/images/logo/footer_logo.png';

function Footer() {
  return (
    <div className='footer'>
        <img
            id='footer_logo'
            src={footer_logo}
            alt='footer_logo'
        />

        <div className='footer_content'>
            <p>[61099] 광주광역시 북구 하서로 85</p>
            <p>Email.  jshkms5022@gmail.com</p>
            <p>© 2025 셜LOCK. All rights reserved.</p>
        </div>
    </div>
  );
}

export default Footer;