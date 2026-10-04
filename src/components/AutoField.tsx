import { PrintField } from "./PrintField";

type Props = {
  value: string;
  /** True when the user typed their own value instead of the automatic one. */
  overridden: boolean;
  onChange: (value: string) => void;
  onReset: () => void;
  ariaLabel: string;
};

export function AutoField({ value, overridden, onChange, onReset, ariaLabel }: Props) {
  return (
    <span className="inline-flex items-center gap-1">
      <PrintField value={value} onChange={onChange} ariaLabel={ariaLabel} align="right" line className="w-32" />
      {overridden && (
        <button type="button" className="reset no-print" title="Automatisch berechnen" onClick={onReset}>
          ↺
        </button>
      )}
    </span>
  );
}
