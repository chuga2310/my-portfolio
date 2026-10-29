import { useRef, useState, type DragEvent, type RefObject } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { JdContent } from '../../lib/types';
import { ACCEPT, countChars } from '../../lib/jd/extractText';
import { fmt } from '../../lib/jd/format';
import { TEXT_MAX, TEXT_MIN } from '../../lib/jd/types';
import { ArrowUp, Paperclip, Upload } from '../ui/icons';

interface Props {
  t: JdContent;
  text: string;
  onText: (text: string) => void;
  onFile: (file: File) => void;
  onSubmit: () => void;
  disabled: boolean;
  readingFile: string | null;
  locale: string;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}

/** One composer for both inputs: paste into the textarea, or attach / drop a PDF, DOCX, TXT or MD file. */
export function JdComposer({ t, text, onText, onFile, onSubmit, disabled, readingFile, locale, textareaRef }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const busy = readingFile !== null;
  const locked = disabled || busy;
  const len = countChars(text);
  const canSubmit = !locked && len >= TEXT_MIN && len <= TEXT_MAX;

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = locked ? 'none' : 'copy';
    if (!locked) setOver(true);
  }
  function onDrop(e: DragEvent) {
    e.preventDefault();
    setOver(false);
    const file = e.dataTransfer.files[0];
    if (file && !locked) onFile(file);
  }

  return (
    <div
      className={`jd-compose${over ? ' is-over' : ''}${locked ? ' is-locked' : ''}`}
      onDragEnter={onDragOver} onDragOver={onDragOver} onDragLeave={() => setOver(false)} onDrop={onDrop}
    >
      <label htmlFor="jd-paste" className="sr-only">{t.paste.label}</label>
      <textarea
        id="jd-paste" ref={textareaRef} className="jd-textarea" rows={4}
        value={text} placeholder={t.paste.placeholder} disabled={disabled}
        aria-describedby="jd-count jd-hint"
        onChange={(e) => onText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && canSubmit) onSubmit(); }}
      />
      <div className="jd-compose-bar">
        <input
          ref={fileRef} type="file" accept={ACCEPT} className="sr-only" tabIndex={-1} aria-hidden="true"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) onFile(file);
          }}
        />
        <button type="button" className="jd-attach" disabled={locked} aria-describedby="jd-hint" onClick={() => fileRef.current?.click()}>
          <Paperclip size={16} />{t.tabs.file}
        </button>
        <span id="jd-hint" className="jd-hint mono">{t.drop.hint}</span>
        <span className="jd-compose-end">
          <span id="jd-count" className={`jd-count mono${len > TEXT_MAX ? ' is-over' : ''}`}>
            {fmt(t.paste.count, { n: len.toLocaleString(locale), max: TEXT_MAX.toLocaleString(locale) })}
            {len > 0 && len < TEXT_MIN && <> · {fmt(t.paste.min, { min: TEXT_MIN })}</>}
          </span>
          <button type="button" className="jd-send" disabled={!canSubmit} aria-label={t.analyze} title={t.analyze} onClick={onSubmit}>
            <ArrowUp size={18} strokeWidth={2.4} />
          </button>
        </span>
      </div>
      <AnimatePresence>
        {(over || busy) && (
          <motion.div
            className="jd-drop-overlay" aria-busy={busy}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
          >
            {busy
              ? <><span className="jd-spinner" aria-hidden="true" />{fmt(t.drop.reading, { name: readingFile ?? '' })}</>
              : <><span className="jd-drop-icon" aria-hidden="true"><Upload size={20} /></span>{t.drop.title}</>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
