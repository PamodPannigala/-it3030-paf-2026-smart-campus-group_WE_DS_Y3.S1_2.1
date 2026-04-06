import React from 'react';
import './PrimaryButton.css';

const PrimaryButton = ({ children, icon: Icon, onClick, className = "", variant = "primary" }) => {
  return (
    <button 
      className={`btn-premium d-flex align-items-center justify-content-center gap-2 px-4 py-2 rounded-3 fw-bold ${className}`}
      onClick={onClick}
    >
      {/* බටන් එක ඇතුළේ Icon එකක් තියෙනවා නම් ඒක පෙන්වනවා */}
      {Icon && <Icon size={19} strokeWidth={2.5} />}
      <span>{children}</span>
    </button>
  );
};

export default PrimaryButton;