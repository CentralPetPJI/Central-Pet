import React, { forwardRef } from 'react';

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  accent?: 'cyan' | 'emerald';
  children: React.ReactNode;
}

const accentClassMap = {
  cyan: 'focus:border-cyan-500',
  emerald: 'focus:border-emerald-500',
} as const;

const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ accent = 'cyan', children, className = '', ...props }, ref) => (
    <select
      {...props}
      ref={ref}
      className={`w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition ${accentClassMap[accent]} ${className}`.trim()}
    >
      {children}
    </select>
  ),
);

FormSelect.displayName = 'FormSelect';

export default FormSelect;
