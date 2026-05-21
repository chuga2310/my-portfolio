export function FeaturedWindow() {
  return (
    <div className="window">
      <div className="head"><i /><i /><i /></div>
      <div className="body">
        <span className="line"><span className="pill">/api/search</span> q="quantum entanglement reviews"</span>
        <span className="line"><span className="ok">✓</span> retrieved 42 sources · semantic-scholar, serper</span>
        <span className="line"><span className="ok">✓</span> reranked &amp; deduped → 12 contexts</span>
        <span className="line"><span className="ok">✓</span> LLM call · anthropic-sonnet-4 · 1.2s</span>
        <span className="line">streaming response…<span className="cursor" /></span>
        <span className="line">&nbsp;</span>
        <span className="line" style={{ color: 'var(--text)' }}>"Recent reviews consolidate three regimes…</span>
        <span className="line" style={{ color: 'var(--text-mute)' }}>[1, 2, 5] → expand citations</span>
      </div>
    </div>
  );
}
