import React from 'react';

interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  accent?: 'cyan' | 'rose';
  label: string;
}

const accentClassMap = {
  cyan: 'text-cyan-600',
  rose: 'text-rose-600',
} as const;

const FormCheckbox: React.FC<FormCheckboxProps> = ({
  accent = 'cyan',
  className = '',
  label,
  ...props
}) => (
  <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
    <input
      {...props}
      type="checkbox"
      className={`h-4 w-4 rounded border-slate-300 ${accentClassMap[accent]} ${className}`.trim()}
    />
    {label}
  </label>
);

export default FormCheckbox;
