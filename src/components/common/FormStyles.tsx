import React from 'react';
import { Form } from 'react-bootstrap';

/**
 * RadioButtonGroup - A component for consistent radio button group styling
 * 
 * @param {Object} props - Component props
 * @param {string} props.name - Name attribute for the radio group
 * @param {Array} props.options - Array of options [{value: string, label: string}]
 * @param {string} props.selectedValue - Currently selected value
 * @param {Function} props.onChange - Change handler function
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.inline - Whether to display radio buttons inline
 */
export const RadioButtonGroup = ({ 
  name, 
  options, 
  selectedValue, 
  onChange, 
  className = '', 
  inline = true 
}) => {
  return (
    <Form.Group className={`view-radio-group ${className}`}>
      {options.map((option) => (
        <Form.Check
          key={`${name}-${option.value}`}
          type="radio"
          id={`${name}-${option.value}`}
          name={name}
          label={option.label}
          value={option.value}
          checked={selectedValue === option.value}
          onChange={onChange}
          className={inline ? 'me-3 d-inline-block' : 'mb-2'}
        />
      ))}
    </Form.Group>
  );
};

/**
 * FormSection - A component for consistent form section styling
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Section title
 * @param {React.ReactNode} props.children - Section content
 * @param {string} props.className - Additional CSS classes
 */
export const FormSection = ({ title, children, className = '' }) => {
  return (
    <div className={`mb-4 ${className}`}>
      {title && <h3 className="mb-3">{title}</h3>}
      {children}
    </div>
  );
};