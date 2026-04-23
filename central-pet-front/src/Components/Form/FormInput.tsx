import React, { forwardRef } from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  accent?: 'cyan' | 'emerald' | 'rose';
}

const accentClassMap = {
  cyan: 'focus:border-primary-300',
  emerald: 'focus:border-emerald-500',
  rose: 'focus:border-rose-500',
} as const;

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ accent = 'cyan', className = '', ...props }, ref) => (
    <input
      {...props}
      ref={ref}
      className={`w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition ${accentClassMap[accent]} ${className}`.trim()}
    />
  ),
);

FormInput.displayName = 'FormInput';

export default FormInput;
