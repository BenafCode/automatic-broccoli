const { useState, useEffect, useCallback } = React;

const ALL_GROUPS = ["All", ...Array.from(new Set(vocab.map(v => v.group)))];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function toRomaji(text) {
  try {
    if (typeof wanakana !== 'undefined') return wanakana.toRomaji(text);
    return '';
  } catch(e) { return ''; }
}

function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ja-JP';
  u.rate = 0.85;
  const voices = window.speechSynthesis.getVoices();
  const jpVoice = voices.find(v => v.lang === 'ja-JP') || voices.find(v => v.lang.startsWith('ja'));
  if (jpVoice) u.voice = jpVoice;
  window.speechSynthesis.speak(u);
}

function SpeakBtn({ text, style }) {
  return (
    <button
      style={{ background: '#fff', border: '1px solid #000', borderRadius: '0', color: '#000', fontSize: '12px', fontFamily: 'Helvetica,Arial,sans-serif', fontWeight: '700', padding: '3px 8px', cursor: 'pointer', lineHeight: 1, flexShrink: 0, ...style }}
      onClick={e => { e.stopPropagation(); speak(text); }}
      title="Pronounce"
    >🔊</button>
  );
}
