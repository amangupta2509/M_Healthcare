import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p>© {new Date().getFullYear()} PhysioCare Dashboard. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
