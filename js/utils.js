const { useState, useEffect, useCallback, useRef } = React;

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
}

const ALL_GROUPS = ["All", ...Array.from(new Set(vocab.map(v => v.group)))];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function toKana(text) {
  try {
    if (typeof wanakana !== 'undefined') return wanakana.toKana(text);
    return text;
  } catch(e) { return text; }
}

function toHiragana(text) {
  try {
    if (typeof wanakana !== 'undefined') return wanakana.toHiragana(text);
    return text;
  } catch(e) { return text; }
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

const KANA_ROWS = [
  ['あ','い','う','え','お'],
  ['か','き','く','け','こ'],
  ['さ','し','す','せ','そ'],
  ['た','ち','つ','て','と'],
  ['な','に','ぬ','ね','の'],
  ['は','ひ','ふ','へ','ほ'],
  ['ま','み','む','め','も'],
  ['や','ゆ','よ','ゃ','ゅ'],
  ['ら','り','る','れ','ろ'],
  ['わ','を','ん','ょ','っ'],
];

const DAKUTEN_MAP = {
  'か':'が','き':'ぎ','く':'ぐ','け':'げ','こ':'ご',
  'さ':'ざ','し':'じ','す':'ず','せ':'ぜ','そ':'ぞ',
  'た':'だ','ち':'ぢ','つ':'づ','て':'で','と':'ど',
  'は':'ば','ひ':'び','ふ':'ぶ','へ':'べ','ほ':'ぼ',
  'カ':'ガ','キ':'ギ','ク':'グ','ケ':'ゲ','コ':'ゴ',
  'サ':'ザ','シ':'ジ','ス':'ズ','セ':'ゼ','ソ':'ゾ',
  'タ':'ダ','チ':'ヂ','ツ':'ヅ','テ':'デ','ト':'ド',
  'ハ':'バ','ヒ':'ビ','フ':'ブ','ヘ':'ベ','ホ':'ボ',
};

const HANDAKUTEN_MAP = {
  'は':'ぱ','ひ':'ぴ','ふ':'ぷ','へ':'ぺ','ほ':'ぽ',
  'ハ':'パ','ヒ':'ピ','フ':'プ','ヘ':'ペ','ホ':'ポ',
};

function KanaKeyboard({ value, onChange }) {
  const [isKatakana, setIsKatakana] = useState(false);

  const rows = isKatakana
    ? KANA_ROWS.map(row => row.map(ch => {
        const c = ch.charCodeAt(0);
        return (c >= 0x3041 && c <= 0x3096) ? String.fromCharCode(c + 0x60) : ch;
      }))
    : KANA_ROWS;

  const insert     = ch => onChange(value + ch);
  const bksp       = () => onChange(value.slice(0, -1));
  const voiced     = () => { const d = DAKUTEN_MAP[value.slice(-1)];   if (d) onChange(value.slice(0,-1) + d); };
  const semiVoiced = () => { const h = HANDAKUTEN_MAP[value.slice(-1)]; if (h) onChange(value.slice(0,-1) + h); };

  const K = { border:'1px solid #c8c0b4', background:'#fff', fontFamily:"'Times New Roman',Times,serif", fontSize:'17px', color:'#1a1a18', cursor:'pointer', padding:'5px 0', minHeight:'36px', lineHeight:1 };
  const C = { ...K, background:'#ede8da', fontFamily:'Helvetica,Arial,sans-serif', fontSize:'12px', fontWeight:'700' };

  return (
    <div style={{marginTop:'8px', border:'1px solid #c8c0b4', background:'#f5f0e8', padding:'6px', userSelect:'none'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'5px'}}>
        <span style={{fontFamily:'Helvetica,Arial,sans-serif', fontWeight:'700', fontSize:'10px', textTransform:'uppercase', letterSpacing:'1px', color:'#6a6050'}}>
          {isKatakana ? 'カタカナ' : 'ひらがな'}
        </span>
        <button style={{...C, padding:'3px 10px', border:'1px solid #1a1a18', fontSize:'13px', fontFamily:"'Times New Roman',Times,serif"}}
          onClick={() => setIsKatakana(k => !k)}>
          {isKatakana ? 'ひ' : 'カ'}
        </button>
      </div>
      {rows.map((row, ri) => (
        <div key={ri} style={{display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'2px', marginBottom:'2px'}}>
          {row.map(ch => <button key={ch} style={K} onClick={() => insert(ch)}>{ch}</button>)}
        </div>
      ))}
      <div style={{display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'2px', marginTop:'4px'}}>
        <button style={C} onClick={voiced}>゛</button>
        <button style={C} onClick={semiVoiced}>゜</button>
        <button style={C} onClick={() => insert('ー')}>ー</button>
        <button style={C} onClick={bksp}>⌫</button>
        <button style={{...C, background:'#e8d4d4', color:'#7a2020'}} onClick={() => onChange('')}>✕</button>
      </div>
    </div>
  );
}

function AntonymHint({ jp }) {
  const opp = ANTONYMS[jp];
  if (!opp) return null;
  const oppWord = vocab.find(v => v.jp === opp);
  return (
    <div style={{fontFamily:"'Times New Roman',Times,serif", fontSize:"11px", color:"#a09888", fontStyle:"italic", marginTop:"6px"}}>
      ↔ {opp}{oppWord ? ` · ${oppWord.en}` : ""}
    </div>
  );
}

function SpeakBtn({ text, style }) {
  return (
    <button
      style={{ background: '#fff', border: '1px solid #000', borderRadius: '0', color: '#000', fontSize: '14px', fontFamily: 'Helvetica,Arial,sans-serif', fontWeight: '700', padding: '8px 12px', cursor: 'pointer', lineHeight: 1, flexShrink: 0, minWidth: '44px', minHeight: '44px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }}
      onClick={e => { e.stopPropagation(); speak(text); }}
      title="Pronounce"
    >♪</button>
  );
}
