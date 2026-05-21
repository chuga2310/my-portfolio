interface Props { value: number; idx: number; total: number; }

export function ScrollProgress({ value, idx, total }: Props) {
  return (
    <div className="scroll-progress">
      <div className="bar"><div className="fill" style={{ width: `${value}%` }} /></div>
      <span>{String(idx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
    </div>
  );
}
