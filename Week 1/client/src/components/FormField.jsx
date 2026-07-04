const FormField = ({ label, error, children, htmlFor }) => (
  <div>
    <label htmlFor={htmlFor} className="label-text">
      {label}
    </label>
    {children}
    {error && <p className="field-error">{error}</p>}
  </div>
);

export default FormField;
