import { useRef, useState, type DragEvent, type KeyboardEvent } from 'react';
import type { JdContent } from '../../lib/types';
import { ACCEPT, countChars } from '../../lib/jd/extractText';
import { fmt } from '../../lib/jd/format';
import { TEXT_MAX, TEXT_MIN } from '../../lib/jd/types';

export type InputTab = 'file' | 'paste';
const TABS: InputTab[] = ['file', 'paste'];

interface Props {
  t: JdContent;
  tab: InputTab;
  onTab: (tab: InputTab) => void;
  pasteText: string;
  onPasteText: (text: string) => void;
  onFile: (file: File) => void;
  onSubmitText: () => void;
  disabled: boolean;
  readingFile: string | null;
  locale: string;
}

export function JdDropzone({ t, tab, onTab, pasteText, onPasteText, onFile, onSubmitText, disabled, readingFile, locale }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const tabRefs = useRef<Record<InputTab, HTMLButtonElement | null>>({ file: null, paste: null });
  const [over, setOver] = useState(false);
  const busy = readingFile !== null;
  const locked = disabled || busy;
  const len = countChars(pasteText);
  const canSubmit = !locked && len >= TEXT_MIN && len <= TEXT_MAX;

  function onTabKey(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    const i = TABS.indexOf(tab);
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? TABS.length - 1
      : (i + (e.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length;
    onTab(TABS[next]);
    tabRefs.current[TABS[next]]?.focus();
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    if (!locked) {
      e.dataTransfer.dropEffect = 'copy';
      setOver(true);
    } else {
      e.dataTransfer.dropEffect = 'none';
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setOver(false);
    const file = e.dataTransfer.files[0];
    if (file && !locked) onFile(file);
  }

  return (
    <div className="jd-input">
      <div className="jd-tabs" role="tablist" aria-label={t.tabs.label}>
        {TABS.map((id) => (
          <button
            key={id}
            ref={(el) => { tabRefs.current[id] = el; }}
            type="button"
            role="tab"
            id={`jd-tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`jd-tabpanel-${id}`}
            tabIndex={tab === id ? 0 : -1}
            className={tab === id ? 'on' : ''}
            onClick={() => onTab(id)}
            onKeyDown={onTabKey}
          >
            {t.tabs[id]}
          </button>
        ))}
      </div>

      <div role="tabpanel" id="jd-tabpanel-file" aria-labelledby="jd-tab-file" hidden={tab !== 'file'}>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) onFile(file);
          }}
        />
        <button
          type="button"
          className={`jd-drop${over ? ' over' : ''}${busy ? ' busy' : ''}`}
          disabled={locked}
          aria-busy={busy}
          aria-describedby="jd-drop-hint"
          onClick={() => inputRef.current?.click()}
          onDragEnter={onDragOver}
          onDragOver={onDragOver}
          onDragLeave={() => setOver(false)}
          onDrop={onDrop}
        >
          {busy ? (
            <>
              <span className="jd-spinner" aria-hidden="true" />
              <span className="jd-drop-title">{fmt(t.drop.reading, { name: readingFile })}</span>
            </>
          ) : (
            <>
              <span className="jd-drop-icon" aria-hidden="true">⇪</span>
              <span className="jd-drop-title">{t.drop.title}</span>
              <span className="jd-drop-browse">{t.drop.browse}</span>
            </>
          )}
          <span className="jd-drop-hint" id="jd-drop-hint">{t.drop.hint}</span>
        </button>
      </div>

      <div role="tabpanel" id="jd-tabpanel-paste" aria-labelledby="jd-tab-paste" hidden={tab !== 'paste'}>
        <label htmlFor="jd-paste" className="sr-only">{t.paste.label}</label>
        <textarea
          id="jd-paste"
          className="jd-paste"
          value={pasteText}
          placeholder={t.paste.placeholder}
          disabled={disabled}
          aria-describedby="jd-paste-count"
          onChange={(e) => onPasteText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && canSubmit) onSubmitText();
          }}
        />
        <div className="jd-paste-row">
          <span id="jd-paste-count" className={`jd-count${len > TEXT_MAX ? ' over' : ''}`}>
            {fmt(t.paste.count, { n: len.toLocaleString(locale), max: TEXT_MAX.toLocaleString(locale) })}
            {len > 0 && len < TEXT_MIN && <> · {fmt(t.paste.min, { min: TEXT_MIN })}</>}
          </span>
          <button type="button" className="btn primary jd-btn" disabled={!canSubmit} onClick={onSubmitText}>
            {t.analyze} <span className="arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
