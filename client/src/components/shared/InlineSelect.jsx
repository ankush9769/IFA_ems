const InlineSelect = ({ label, value, onChange, options }) => (
  <label className="inline-select">
    <span>{label}</span>
    <select value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </label>
);

export default InlineSelect;

