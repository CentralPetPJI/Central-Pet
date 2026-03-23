import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  accent?: 'cyan' | 'emerald' | 'rose';
}

const accentClassMap = {
  cyan: 'focus:border-cyan-500',
  emerald: 'focus:border-emerald-500',
  rose: 'focus:border-rose-500',
} as const;

const FormInput: React.FC<FormInputProps> = ({ accent = 'cyan', className = '', ...props }) => (
  <input
    {...props}
    className={`w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition ${accentClassMap[accent]} ${className}`.trim()}
  />
);

export default FormInput;
