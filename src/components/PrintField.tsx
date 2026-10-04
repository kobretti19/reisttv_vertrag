type Props = {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
  placeholder?: string;
  align?: "left" | "right";
  /** Show a solid line under the field, also when printed (for blanks inside running text). */
  line?: boolean;
  maxLength?: number;
};

export function PrintField({ value, onChange, ariaLabel, className = "", placeholder, align = "left", line = false, maxLength }: Props) {
  const classes = ["field", line ? "field-line" : "", align === "right" ? "text-right" : "", className]
    .filter(Boolean)
    .join(" ");
  return (
    <input
      type="text"
      className={classes}
      value={value}
      placeholder={placeholder}
      aria-label={ariaLabel}
      maxLength={maxLength}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
