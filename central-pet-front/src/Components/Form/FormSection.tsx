import React from 'react';

interface FormSectionProps {
  accentClassName: string;
  children: React.ReactNode;
  className?: string;
  eyebrow: string;
  title?: string;
}

const FormSection: React.FC<FormSectionProps> = ({
  accentClassName,
  children,
  className = '',
  eyebrow,
  title,
}) => (
  <section className={`rounded-[1.5rem] bg-white p-4 shadow-sm lg:p-5 ${className}`.trim()}>
    <div className="mb-4">
      <span className={`text-sm font-semibold uppercase tracking-[0.2em] ${accentClassName}`}>
        {eyebrow}
      </span>
      {title ? <h2 className="mt-2 text-2xl font-bold text-slate-900">{title}</h2> : null}
    </div>
    {children}
  </section>
);

export default FormSection;
