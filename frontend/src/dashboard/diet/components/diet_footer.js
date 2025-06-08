import React from 'react';
import '../../physio/components/Footer.css';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p>© {new Date().getFullYear()} BalanceBite Dashboard. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
