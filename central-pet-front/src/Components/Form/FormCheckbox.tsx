import React, { forwardRef } from 'react';

interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  accent?: 'cyan' | 'rose';
  label: string;
}

const accentClassMap = {
  cyan: 'text-primary-400',
  rose: 'text-rose-600',
} as const;

const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ accent = 'cyan', className = '', label, ...props }, ref) => (
    <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 cursor-pointer">
      <input
        {...props}
        ref={ref}
        type="checkbox"
        className={`h-4 w-4 rounded border-slate-300 ${accentClassMap[accent]} ${className}`.trim()}
      />
      {label}
    </label>
  ),
);

FormCheckbox.displayName = 'FormCheckbox';

export default FormCheckbox;
