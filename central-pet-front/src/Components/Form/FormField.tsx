import React from 'react';
import FieldError from '@/Components/Form/FieldError';

interface FormFieldProps {
  children: React.ReactNode;
  error?: string;
  label: string;
}

const FormField: React.FC<FormFieldProps> = ({ children, error, label }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
    {children}
    <FieldError message={error} />
  </label>
);

export default FormField;
