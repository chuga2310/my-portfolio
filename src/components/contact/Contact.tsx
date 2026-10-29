import { useState, type FormEvent } from 'react';
import type { LangContent } from '../../lib/types';
import { RevealHeading } from '../ui/RevealHeading';
import { Reveal } from '../ui/Reveal';
import { Sprite } from '../ui/viz';
import { ArrowRight } from '../ui/icons';

interface Props { t: LangContent; }

export function Contact({ t }: Props) {
  const c = t.contact;
  const [brief, setBrief] = useState('');

  function send(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({ subject: c.composeSubject });
    if (brief.trim()) params.set('body', brief.trim());
    // URLSearchParams encodes spaces as "+", which mail clients show literally.
    window.location.href = `mailto:${c.email}?${params.toString().replace(/\+/g, '%20')}`;
  }

  return (
    <section id="contact" className="section section-oat contact">
      <div className="wrap contact-wrap">
        <span className="contact-sprite" aria-hidden="true"><Sprite row={6} /></span>
        <div className="eyebrow mono">{c.label}</div>
        <RevealHeading text={c.title} className="section-title serif contact-title" mutedAfterComma={false} />
        <Reveal><p className="contact-sub">{c.sub}</p></Reveal>
        <Reveal className="contact-compose-wrap" delay={0.1}>
          <form className="contact-compose" onSubmit={send}>
            <label htmlFor="contact-brief" className="sr-only">{c.composeLabel}</label>
            <input
              id="contact-brief" type="text" value={brief} placeholder={c.composePlaceholder}
              onChange={(e) => setBrief(e.target.value)}
            />
            <button type="submit" className="btn btn-dark">{c.cta} <ArrowRight size={15} /></button>
          </form>
        </Reveal>
        <ul className="contact-links">
          {c.links.map((l) => (
            <li key={l.k}>
              {l.href ? (
                <a href={l.href} {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}>
                  <span className="contact-k">{l.k}</span>{l.v}
                </a>
              ) : (
                <span className="contact-static"><span className="contact-k">{l.k}</span>{l.v}</span>
              )}
            </li>
          ))}
        </ul>
        <p className="contact-foot">
          {c.foot} · {t.ui.credit} <a href="https://limezu.itch.io" target="_blank" rel="noreferrer">LimeZu</a>
        </p>
      </div>
    </section>
  );
}
