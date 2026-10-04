import { PrintField } from "./PrintField";

type Props = {
  value: string;
  /** True when the user typed their own value instead of the automatic one. */
  overridden: boolean;
  onChange: (value: string) => void;
  onReset: () => void;
  ariaLabel: string;
  /** Text glued directly behind the field (e.g. a period), without a visible gap. */
  suffix?: string;
};

export function AutoField({ value, overridden, onChange, onReset, ariaLabel, suffix }: Props) {
  return (
    <span className="inline-flex items-center gap-1">
      <PrintField value={value} onChange={onChange} ariaLabel={ariaLabel} align="right" line className={suffix ? "w-32 pr-0" : "w-32"} />
      {suffix && <span className="-ml-1">{suffix}</span>}
      {overridden && (
        <button type="button" className="reset no-print" title="Automatisch berechnen" onClick={onReset}>
          ↺
        </button>
      )}
    </span>
  );
}
