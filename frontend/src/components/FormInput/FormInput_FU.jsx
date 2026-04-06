import React from "react";
import './FormInput.css';

const FormInput = ({
  icon: Icon,
  placeholder,
  onChange,
  value,
  type = "text",
  className = "",
}) => {
  return (
    <div
      className={`custom-input-group d-flex align-items-center px-3 py-2 rounded-4 shadow-sm ${className}`}
    >
      {/* Lucide Icon එක මෙතන පෙන්වනවා */}
      {Icon && (
        <Icon className="text-slate-400 me-2" size={20} strokeWidth={2} />
      )}

      <input
        type={type}
        className="form-control border-0 bg-transparent no-focus py-1"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{ fontSize: "0.95rem", fontWeight: "500" }}
      />
    </div>
  );
};

export default FormInput;
