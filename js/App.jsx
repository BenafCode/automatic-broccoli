function App() {
  const isMobile = useWindowWidth() < 640;
  const [mode, setMode] = useState("menu");
  const [group, setGroup] = useState(() => {
    try { return localStorage.getItem('vocabStudy_group') || "All"; } catch(e) { return "All"; }
  });
  const [direction, setDirection] = useState(() => {
    try { return localStorage.getItem('vocabStudy_direction') || "jp2en"; } catch(e) { return "jp2en"; }
  });
  const [showRomaji, setShowRomaji] = useState(() => {
    try { return localStorage.getItem('vocabStudy_romaji') === 'true'; } catch(e) { return false; }
  });
  const [persistentKnown, setPersistentKnown] = useState(() => {
    try {
      const s = localStorage.getItem('vocabStudy_knownWords');
      return s ? new Set(JSON.parse(s)) : new Set();
    } catch(e) { return new Set(); }
  });
  const [deck, setDeck] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showSentence, setShowSentence] = useState(false);
  const [known, setKnown] = useState(new Set());
  const [unknown, setUnknown] = useState(new Set());
  const [quizOptions, setQuizOptions] = useState([]);
  const [quizSelected, setQuizSelected] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [missedWords, setMissedWords] = useState([]);
  const [listSearch, setListSearch] = useState("");
  const [expandedWord, setExpandedWord] = useState(null);
  const [writeInput, setWriteInput] = useState("");
  const [writeSubmitted, setWriteSubmitted] = useState(false);
  const [writeCorrect, setWriteCorrect] = useState(false);
  const [lastMode, setLastMode] = useState("flashcard");
  const writeInputRef = useRef(null);
  useEffect(() => { try { localStorage.setItem('vocabStudy_group', group); } catch(e) {} }, [group]);
  useEffect(() => { try { localStorage.setItem('vocabStudy_direction', direction); } catch(e) {} }, [direction]);
  useEffect(() => { try { localStorage.setItem('vocabStudy_romaji', showRomaji); } catch(e) {} }, [showRomaji]);
  useEffect(() => {
    try { localStorage.setItem('vocabStudy_knownWords', JSON.stringify([...persistentKnown])); } catch(e) {}
  }, [persistentKnown]);

  const filteredVocab = group === "All" ? vocab : vocab.filter(v => v.group === group);
  const masteredCount = filteredVocab.filter(v => persistentKnown.has(`${v.jp}_${direction}`)).length;

  function startFlashcards() {
    setDeck(shuffle(filteredVocab));
    setIndex(0); setFlipped(false); setShowSentence(false);
    setKnown(new Set()); setUnknown(new Set());
    setLastMode("flashcard"); setMode("flashcard");
  }
  function startQuiz() {
    setDeck(shuffle(filteredVocab));
    setIndex(0); setQuizSelected(null);
    setScore({ correct: 0, total: 0 }); setMissedWords([]);
    setLastMode("quiz"); setMode("quiz");
  }
  function startWrite() {
    setDeck(shuffle(filteredVocab));
    setIndex(0); setWriteInput(""); setWriteSubmitted(false); setWriteCorrect(false);
    setScore({ correct: 0, total: 0 }); setMissedWords([]);
    setLastMode("write"); setMode("write");
  }
  function openList() { setListSearch(""); setExpandedWord(null); setMode("list"); }

  function submitWriteAnswer() {
    const raw = writeInputRef.current ? writeInputRef.current.value : writeInput;
    if (writeSubmitted || !raw.trim()) return;
    const norm = s => typeof wanakana !== 'undefined' ? wanakana.toHiragana(wanakana.toKana(s)) : s;
    const final = norm(raw.trim());
    const correct = final === norm(currentCard.jp);
    setWriteInput(raw);
    setWriteCorrect(correct);
    setWriteSubmitted(true);
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    if (!correct) setMissedWords(m => [...m, currentCard]);
  }

  const makeQuizOptions = useCallback((current, allCards) => {
    const correct = direction === "jp2en" ? current.en : current.jp;
    const pool = allCards.filter(v => (direction === "jp2en" ? v.en : v.jp) !== correct);
    const wrongs = shuffle(pool).slice(0, 3).map(v => direction === "jp2en" ? v.en : v.jp);
    return shuffle([correct, ...wrongs]);
  }, [direction]);

  useEffect(() => {
    if (mode === "quiz" && deck.length > 0) {
      setQuizOptions(makeQuizOptions(deck[index], deck));
      setQuizSelected(null);
    }
  }, [mode, deck, index, makeQuizOptions]);

  const currentCard = deck[index];
  const progress = deck.length > 0 ? (index / deck.length) * 100 : 0;

  function handleQuizAnswer(opt) {
    if (quizSelected !== null) return;
    setQuizSelected(opt);
    const correctAns = direction === "jp2en" ? currentCard.en : currentCard.jp;
    const isCorrect = opt === correctAns;
    setScore(s => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
    if (!isCorrect) setMissedWords(m => [...m, currentCard]);
  }

  function nextCard() {
    setFlipped(false); setShowSentence(false); setQuizSelected(null);
    setWriteInput(""); setWriteSubmitted(false); setWriteCorrect(false);
    if (index + 1 >= deck.length) setMode("done");
    else setIndex(i => i + 1);
  }

  useEffect(() => {
    function handleKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (mode === 'flashcard' && currentCard) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          setFlipped(f => !f);
        } else if (e.key === 'ArrowRight' || e.key === 'l' || e.key === 'L') {
          e.preventDefault();
          const key = `${currentCard.jp}_${direction}`;
          setPersistentKnown(s => new Set(s).add(key));
          setKnown(s => new Set(s).add(index));
          setFlipped(false); setShowSentence(false); setQuizSelected(null);
          if (index + 1 >= deck.length) setMode('done');
          else setIndex(i => i + 1);
        } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          e.preventDefault();
          setUnknown(s => new Set(s).add(index));
          setFlipped(false); setShowSentence(false); setQuizSelected(null);
          if (index + 1 >= deck.length) setMode('done');
          else setIndex(i => i + 1);
        }
      }

      if (mode === 'quiz' && currentCard) {
        if (quizSelected === null && ['1','2','3','4'].includes(e.key)) {
          const opt = quizOptions[parseInt(e.key) - 1];
          if (opt !== undefined) {
            const correctAns = direction === 'jp2en' ? currentCard.en : currentCard.jp;
            const isCorrect = opt === correctAns;
            setQuizSelected(opt);
            setScore(s => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
            if (!isCorrect) setMissedWords(m => [...m, currentCard]);
          }
        } else if (quizSelected !== null && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          setFlipped(false); setShowSentence(false); setQuizSelected(null);
          if (index + 1 >= deck.length) setMode('done');
          else setIndex(i => i + 1);
        }
      }

      if (mode === 'write' && currentCard) {
        if (writeSubmitted && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          nextCard();
        }
      }

      if (mode === 'list' && e.key === 'Escape') {
        setExpandedWord(null);
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mode, currentCard, quizSelected, quizOptions, writeSubmitted, index, direction, deck]);

  // Muted vintage tones — aged paper, ink, and seasonal dyes
  const GROUP_TINTS = {
    "All":             "#f5f0e8",
    "Basics":          "#dce6d8",
    "Countries":       "#e2ddd0",
    "Occupations":     "#e0d8e8",
    "Things & Places": "#e2dbd0",
    "Directions":      "#d8e4de",
    "Transport":       "#d8dce8",
    "Verbs":           "#e8e4d8",
    "Time":            "#d8dce8",
    "Food & Drink":    "#dce6d8",
    "Adjectives":      "#e0d8e8",
    "Colors":          "#e2ddd0",
    "Na-Adjectives":   "#e0d8e8",
    "Body":            "#e2dbd0",
    "Fruit & Veg":     "#dce6d8",
    "Seafood":         "#d8dce8",
    "Clothes":         "#e8e4d8",
    "Hobbies":         "#d8e4de",
  };

  const Frame = ({children}) => (
    <div style={{background: isMobile ? "#f5f0e8" : "#b8b0a4", minHeight:"100vh", padding: isMobile ? "0" : "8px 0", boxSizing:"border-box"}}>
      <div style={{border: isMobile ? "none" : "8px solid #1a1a18", maxWidth:"760px", margin:"0 auto", background:"#fff", fontFamily:"'Times New Roman',Times,serif", color:"#1a1a18", boxSizing:"border-box"}}>
        <div style={{background:"#1a1a18", color:"#f5f0e8", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px"}}>
          <div>
            <div style={{fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"16px", textTransform:"uppercase", color:"#f5f0e8", letterSpacing:"1px"}}>日本語 · Vocabulary Study</div>
            <div style={{fontFamily:"Helvetica,Arial,sans-serif", fontSize:"11px", color:"#a09888", textTransform:"uppercase", letterSpacing:"2px"}}>Build Your Japanese.</div>
          </div>
          <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap:"1px"}}>
            <span style={{fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"900", fontSize:"20px", color:"#c8a84b", lineHeight:1}}>{filteredVocab.length}</span>
            <span style={{fontFamily:"Helvetica,Arial,sans-serif", fontSize:"9px", color:"#a09888", textTransform:"uppercase", letterSpacing:"2px"}}>words</span>
          </div>
        </div>
        <div style={isMobile ? {paddingBottom:"80px"} : {}}>{children}</div>
        <div style={{background:"#f5f0e8", borderTop:"1px solid #1a1a18", padding:"10px 16px", ...(isMobile ? {position:"fixed", bottom:0, left:0, right:0, zIndex:10} : {})}}>
          <div style={{display:"flex", justifyContent:"space-around", borderBottom:"1px solid #c8c0b4", paddingBottom:"8px", marginBottom:"6px"}}>
            {[["HOME",()=>setMode("menu")],["CARDS",startFlashcards],["LIST",openList],["文法",()=>setMode("grammar")]].map(([label,fn])=>(
              <button key={label} onClick={fn} style={{background:"none", border:"none", cursor:"pointer", textAlign:"center", fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"11px", textTransform:"uppercase", color:"#1e3050", padding:"4px 8px"}}>
                {label}
              </button>
            ))}
          </div>
          <div style={{fontFamily:"'Times New Roman',Times,serif", fontSize:"11px", color:"#888078", textAlign:"center", fontStyle:"italic"}}>
            This site is best viewed with browser versions 3.0 and higher.
          </div>
        </div>
      </div>
    </div>
  );

  const S = {
    backBtn: { background:"#f5f0e8", border:"1px solid #1a1a18", color:"#1a1a18", fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"12px", textTransform:"uppercase", cursor:"pointer", padding:"4px 12px" },
    tagLabel: { fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"11px", textTransform:"uppercase", letterSpacing:"1px", color:"#6a6050", marginBottom:"4px" },
    kbHint: { fontFamily:"'Times New Roman',Times,serif", fontSize:"11px", color:"#888078", fontStyle:"italic", textAlign:"center", marginTop:"8px" },
    progressBar: { height:"4px", background:"#ddd6cc", border:"1px solid #1a1a18", overflow:"hidden", flex:1 },
    progressFill: p => ({ height:"100%", width:`${p}%`, background:"#1a1a18" }),
    flipCard: { perspective:"1000px", marginBottom:"12px", cursor:"pointer" },
    flipInner: f => ({ width:"100%", position:"relative", transformStyle:"preserve-3d", transition:"transform 0.5s cubic-bezier(0.4,0,0.2,1)", transform:f?"rotateY(180deg)":"rotateY(0deg)" }),
    flipFace: b => ({ position:b?"absolute":"relative", top:0, left:0, width:"100%", backfaceVisibility:"hidden", WebkitBackfaceVisibility:"hidden", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", transform:b?"rotateY(180deg)":"rotateY(0deg)", background:b?"#f5f0e8":"#fff", padding:"28px 20px", boxSizing:"border-box", minHeight:"180px" }),
    jpText: { fontFamily:"'Times New Roman',Times,serif", fontSize:"clamp(32px,9vw,58px)", fontWeight:"700", color:"#1a1a18", textAlign:"center", lineHeight:1.2 },
    enText: { fontFamily:"'Times New Roman',Times,serif", fontSize:"clamp(18px,4.5vw,26px)", fontWeight:"400", color:"#1a1a18", textAlign:"center" },
    romajiText: { fontFamily:"'Times New Roman',Times,serif", fontSize:"12px", color:"#6a6050", marginTop:"4px", fontStyle:"italic", textAlign:"center" },
    tapHint: { fontFamily:"'Times New Roman',Times,serif", fontSize:"11px", color:"#888078", marginTop:"8px", fontStyle:"italic" },
    sentenceBox: { border:"1px solid #c8c0b4", background:"#f5f0e8", padding:"12px 16px", marginBottom:"12px", fontFamily:"'Times New Roman',Times,serif", fontSize:"14px" },
    sentenceJp: { fontSize:"16px", color:"#1a1a18", fontWeight:"500", marginBottom:"4px", lineHeight:1.5 },
    sentenceEn: { fontSize:"13px", color:"#4a4038", lineHeight:1.5 },
    sentenceToggle: { border:"1px solid #1a1a18", background:"#f5f0e8", color:"#1a1a18", fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"12px", textTransform:"uppercase", padding:"5px 14px", cursor:"pointer", flex:1 },
    actionRow: { display:"flex", gap:"8px", marginBottom:"12px" },
    actionBtn: c => ({ flex:1, padding:"14px 10px", minHeight:"52px", border:"1px solid #1a1a18", background:c==="#f87171"?"#7a2020":c==="#4ade80"?"#2c4f2c":"#f5f0e8", color:c==="#f87171"||c==="#4ade80"?"#f5f0e8":"#1a1a18", fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"14px", textTransform:"uppercase", cursor:"pointer" }),
    startBtn: { display:"block", width:"100%", padding:"12px", border:"1px solid #1a1a18", background:"#1a1a18", color:"#f5f0e8", fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"14px", textTransform:"uppercase", cursor:"pointer", marginBottom:"8px", textAlign:"center" },
    quizOption: s => ({ display:"block", width:"100%", padding:"14px 16px", marginBottom:"8px", minHeight:"52px", border:s==="correct"?"2px solid #3d6b3d":s==="wrong"?"2px solid #7a3030":"1px solid #c8c0b4", background:s==="correct"?"#d8e8d0":s==="wrong"?"#e8d4d4":"#fff", color:"#1a1a18", fontFamily:"'Times New Roman',Times,serif", fontSize:"15px", cursor:quizSelected!==null?"default":"pointer", textAlign:"left" }),
    searchBox: { width:"100%", border:"1px solid #1a1a18", borderTop:"none", padding:"8px 12px", fontFamily:"'Times New Roman',Times,serif", fontSize:"14px", outline:"none", background:"#fff", color:"#1a1a18", boxSizing:"border-box" },
    listGroupHeader: { fontFamily:"'Arial Black','Arial Bold',Helvetica,sans-serif", fontWeight:"900", fontSize:"13px", textTransform:"uppercase", padding:"6px 12px", borderBottom:"1px solid #1a1a18", background:"#ede8da", borderTop:"1px solid #1a1a18", color:"#1a1a18" },
    listItem: e => ({ border:"1px solid #1a1a18", borderTop:"none", background:e?"#f5f0e8":"#fff", cursor:"pointer" }),
    listItemHeader: { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px" },
    listItemJp: { fontFamily:"'Times New Roman',Times,serif", fontSize:"20px", fontWeight:"700", color:"#1a1a18" },
    listItemEn: { fontFamily:"'Times New Roman',Times,serif", fontSize:"13px", color:"#4a4038", marginTop:"1px" },
    listItemExpanded: { padding:"0 14px 12px", borderTop:"1px solid #c8c0b4", fontFamily:"'Times New Roman',Times,serif" },
  };

  function Romaji({ text }) {
    if (!showRomaji) return null;
    const r = toRomaji(text);
    if (!r || r === text) return null;
    return <div style={S.romajiText}>{r}</div>;
  }

  const MenuRibbonCards = () => (
    <>
      <div style={{background:GROUP_TINTS[group]||"#f5f0e8", color:"#1a1a18", fontFamily:"'Arial Black','Arial Bold',Helvetica,sans-serif", fontWeight:"900", fontSize:"clamp(14px,4vw,26px)", lineHeight:"1.0", padding:"10px 14px", textTransform:"uppercase", borderBottom:"1px solid #1a1a18"}}>
        {group==="All"?"ALL TOPICS":group.toUpperCase()}
        <div style={{fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"11px", marginTop:"4px", color:"#4a4038"}}>{filteredVocab.length} words available</div>
      </div>
      <div style={{borderBottom:"1px solid #1a1a18", padding:"6px 8px", background:"#ede8da", display:"flex", flexWrap:"wrap", gap:"4px"}}>
        {ALL_GROUPS.map(g=>(
          <button key={g} onClick={()=>setGroup(g)} style={{padding:"6px 8px", border:"1px solid #1a1a18", background:group===g?"#1a1a18":(GROUP_TINTS[g]||"#f5f0e8"), color:group===g?"#f5f0e8":"#1a1a18", fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"11px", cursor:"pointer", textTransform:"uppercase", minHeight:"36px"}}>
            {g}
          </button>
        ))}
      </div>
      {(group==="All"?ALL_GROUPS.filter(g=>g!=="All"):[group]).map(g=>{
        const gWords=vocab.filter(v=>v.group===g);
        if(!gWords.length)return null;
        const tint=GROUP_TINTS[g]||"#f5f0e8";
        const gMastered=gWords.filter(w=>persistentKnown.has(`${w.jp}_${direction}`)).length;
        return(
          <div key={g} style={{borderBottom:"1px solid #c8c0b4"}}>
            <div style={{background:"#fff", borderBottom:"1px solid #c8c0b4", fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"12px", padding:"4px 12px", textTransform:"uppercase", display:"flex", justifyContent:"space-between", alignItems:"center", color:"#1a1a18"}}>
              <span>{g}</span>
              <span style={{fontSize:"11px", fontWeight:"400", fontFamily:"'Times New Roman',Times,serif", color:"#6a6050"}}>{gWords.length} words{gMastered>0?` · ${gMastered} mastered`:""}</span>
            </div>
            <div style={{background:tint, color:"#1a1a18", padding:"7px 12px", fontFamily:"'Times New Roman',Times,serif", fontSize:"13px", lineHeight:"1.4", display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
              <div style={{display:"flex", flexWrap:"wrap", gap:"10px"}}>
                {gWords.slice(0,4).map(w => {
                  const r = showRomaji ? toRomaji(w.jp) : '';
                  return (
                    <span key={w.jp} style={{display:"inline-flex", flexDirection:"column"}}>
                      <span>{w.jp}</span>
                      {r && r !== w.jp && <span style={{fontSize:"10px", color:"#6a6050", fontStyle:"italic"}}>{r}</span>}
                    </span>
                  );
                })}
                {gWords.length>4 && <span>…</span>}
              </div>
              {gMastered>0&&<span style={{fontSize:"11px", fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", color:"#2c4f2c", flexShrink:0, marginLeft:"8px"}}>{gMastered}/{gWords.length}</span>}
            </div>
          </div>
        );
      })}
      <div style={{padding:"6px 12px", fontFamily:"'Times New Roman',Times,serif", fontSize:"12px", color:"#888078", fontStyle:"italic"}}>
        {filteredVocab.length} words selected{masteredCount>0?` · ${masteredCount} mastered`:""}
      </div>
    </>
  );

  if (mode === "menu") return (
    <Frame>
      {isMobile ? (
        <div>
          <div style={{background:"#8b1a1a", color:"#f5f0e8", borderTop:"1px solid #1a1a18", padding:"12px 14px"}}>
            {masteredCount>0&&<div style={{fontFamily:"'Times New Roman',Times,serif", fontSize:"12px", color:"#d4b0b0", marginBottom:"6px"}}>{masteredCount} words mastered</div>}
            <div style={{display:"flex", gap:"8px"}}>
              <button style={{flex:1, background:"#1a1a18", color:"#f5f0e8", border:"1px solid #c8a84b", fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"13px", padding:"12px 8px", textTransform:"uppercase", cursor:"pointer", minHeight:"48px"}} onClick={startFlashcards}>→ FLASH CARDS</button>
              <button style={{flex:1, background:"#f5f0e8", color:"#1a1a18", border:"1px solid #1a1a18", fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"13px", padding:"12px 8px", textTransform:"uppercase", cursor:"pointer", minHeight:"48px"}} onClick={startQuiz}>→ QUIZ MODE</button>
            </div>
            <button style={{display:"block", width:"100%", marginTop:"6px", background:"#4a5a8a", color:"#f5f0e8", border:"1px solid #1a1a18", fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"13px", padding:"10px 8px", textTransform:"uppercase", cursor:"pointer", minHeight:"44px"}} onClick={startWrite}>→ WRITE MODE</button>
          </div>
          <div style={{display:"flex", flexWrap:"wrap", gap:"4px", padding:"8px", borderBottom:"1px solid #1a1a18", background:"#ede8da", borderTop:"1px solid #1a1a18"}}>
            {[["JP→EN","jp2en",()=>setDirection("jp2en")],["EN→JP","en2jp",()=>setDirection("en2jp")]].map(([label,val,fn])=>(
              <button key={val} onClick={fn} style={{padding:"8px 12px", border:"1px solid #1a1a18", background:direction===val?"#1a1a18":"#f5f0e8", color:direction===val?"#f5f0e8":"#1e3050", fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"12px", cursor:"pointer", textTransform:"uppercase", minHeight:"44px"}}>{label}</button>
            ))}
            <button onClick={()=>setShowRomaji(r=>!r)} style={{padding:"8px 12px", border:"1px solid #1a1a18", background:showRomaji?"#1a1a18":"#f5f0e8", color:showRomaji?"#f5f0e8":"#1e3050", fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"12px", cursor:"pointer", textTransform:"uppercase", minHeight:"44px"}}>ローマ字 {showRomaji?"ON":"OFF"}</button>
          </div>
          <MenuRibbonCards/>
        </div>
      ) : (
        <div style={{display:"flex", borderTop:"1px solid #1a1a18"}}>
          <div style={{width:"190px", flexShrink:0, borderRight:"1px solid #1a1a18"}}>
            <div style={{background:"#8b1a1a", color:"#f5f0e8", borderBottom:"1px solid #1a1a18", padding:"14px"}}>
              <div style={{fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"13px", textTransform:"uppercase", marginBottom:"6px", letterSpacing:"1px"}}>Study</div>
              <div style={{fontFamily:"'Times New Roman',Times,serif", fontSize:"13px", lineHeight:"1.4", marginBottom:"8px", color:"#e0d0d0"}}>Select a topic, choose your mode, and build your Japanese vocabulary.</div>
              {masteredCount>0&&<div style={{fontFamily:"'Times New Roman',Times,serif", fontSize:"12px", color:"#d4b0b0"}}>{masteredCount} words mastered</div>}
              <button style={{display:"block", width:"100%", marginTop:"8px", background:"#1a1a18", color:"#f5f0e8", border:"1px solid #c8a84b", fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"12px", padding:"6px", textTransform:"uppercase", cursor:"pointer"}} onClick={startFlashcards}>→ FLASH CARDS</button>
              <button style={{display:"block", width:"100%", marginTop:"5px", background:"#f5f0e8", color:"#1a1a18", border:"1px solid #1a1a18", fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"12px", padding:"6px", textTransform:"uppercase", cursor:"pointer"}} onClick={startQuiz}>→ QUIZ MODE</button>
              <button style={{display:"block", width:"100%", marginTop:"5px", background:"#4a5a8a", color:"#f5f0e8", border:"1px solid #1a1a18", fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"12px", padding:"6px", textTransform:"uppercase", cursor:"pointer"}} onClick={startWrite}>→ WRITE MODE</button>
            </div>
            {[["Direction",[["JP → EN","jp2en",()=>setDirection("jp2en")],["EN → JP","en2jp",()=>setDirection("en2jp")]]],["Options",[["ローマ字 "+(showRomaji?"ON":"OFF"),showRomaji?"on":"",()=>setShowRomaji(r=>!r)]]],["Browse",[["Word List","",openList],["Grammar Guide","",()=>setMode("grammar")]]]].map(([sLabel,items])=>(
              <div key={sLabel}>
                <div style={{fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"10px", textTransform:"uppercase", letterSpacing:"1px", padding:"5px 10px", borderBottom:"1px solid #1a1a18", borderTop:"1px solid #1a1a18", background:"#ede8da", color:"#1a1a18"}}>{sLabel}</div>
                {items.map(([label,active,fn])=>(
                  <button key={label} onClick={fn} style={{display:"block", width:"100%", textAlign:"left", padding:"5px 10px", border:"none", borderBottom:"1px solid #c8c0b4", background:active?"#1a1a18":"#fff", color:active?"#f5f0e8":"#1e3050", fontFamily:"Helvetica,Arial,sans-serif", fontWeight:active?"700":"400", fontSize:"12px", cursor:"pointer", textTransform:"uppercase"}}>{label}</button>
                ))}
              </div>
            ))}
          </div>
          <div style={{flex:1, minWidth:0}}>
            <MenuRibbonCards/>
          </div>
        </div>
      )}
    </Frame>
  );

  if (mode === "done") {
    const pct = score.total > 0 ? Math.round((score.correct/score.total)*100) : 0;
    return (
      <Frame>
        <div style={{padding:"16px"}}>
          <div style={{background:"#8b1a1a", color:"#f5f0e8", border:"1px solid #1a1a18", padding:"16px", marginBottom:"12px", textAlign:"center"}}>
            <div style={{fontFamily:"'Arial Black',Helvetica,sans-serif", fontWeight:"900", fontSize:"48px", color:"#f5f0e8", lineHeight:"1.0"}}>{pct}%</div>
            <div style={{fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"14px", textTransform:"uppercase", marginTop:"6px", letterSpacing:"1px"}}>完了 · Session Complete</div>
            {score.total>0&&<div style={{fontFamily:"'Times New Roman',Times,serif", fontSize:"13px", marginTop:"4px", color:"#e0d0d0"}}>{score.correct} / {score.total} correct</div>}
            {score.total===0&&<div style={{fontFamily:"'Times New Roman',Times,serif", fontSize:"13px", marginTop:"4px", color:"#e0d0d0"}}>All cards reviewed.</div>}
          </div>
          {missedWords.length>0&&(
            <div style={{marginBottom:"12px"}}>
              <div style={{fontFamily:"'Arial Black',Helvetica,sans-serif", fontWeight:"900", fontSize:"13px", textTransform:"uppercase", background:"#e8d4d4", color:"#1a1a18", padding:"5px 12px", border:"1px solid #1a1a18"}}>Review These ({missedWords.length})</div>
              <div style={{maxHeight:"200px", overflowY:"auto", border:"1px solid #1a1a18", borderTop:"none"}}>
                {missedWords.map((w,i)=>(
                  <div key={i} style={{padding:"8px 12px", borderBottom:"1px solid #c8c0b4", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"8px", background:i%2===0?"#fff":"#f5f0e8"}}>
                    <div>
                      <div style={{fontFamily:"'Times New Roman',Times,serif", fontSize:"18px", fontWeight:"700", color:"#1a1a18"}}>{w.jp}</div>
                      {showRomaji&&(()=>{const r=toRomaji(w.jp);return r&&r!==w.jp?<div style={{fontSize:"10px",color:"#6a6050",fontStyle:"italic",fontFamily:"'Times New Roman',Times,serif"}}>{r}</div>:null;})()}
                      <div style={{fontFamily:"'Times New Roman',Times,serif", fontSize:"13px", color:"#4a4038"}}>{w.en}</div>
                    </div>
                    <SpeakBtn text={w.jp}/>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{display:"flex", gap:"8px"}}>
            <button style={{flex:1, padding:"10px", border:"1px solid #1a1a18", background:"#f5f0e8", color:"#1a1a18", fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"14px", textTransform:"uppercase", cursor:"pointer"}} onClick={()=>setMode("menu")}>← MENU</button>
            <button style={{...S.startBtn, marginBottom:0, flex:1}} onClick={lastMode==='write'?startWrite:lastMode==='quiz'?startQuiz:startFlashcards}>TRY AGAIN</button>
          </div>
        </div>
      </Frame>
    );
  }

  if (mode === "list") {
    const sl = listSearch.toLowerCase();
    const listVocab = filteredVocab.filter(v => !listSearch || v.jp.includes(listSearch) || v.en.toLowerCase().includes(sl) || v.sentence.includes(listSearch) || v.sentenceEn.toLowerCase().includes(sl));
    const grouped = {};
    listVocab.forEach(v => { if (!grouped[v.group]) grouped[v.group]=[]; grouped[v.group].push(v); });
    return (
      <Frame>
        <div style={{borderBottom:"1px solid #1a1a18", padding:"8px 14px", display:"flex", alignItems:"center", gap:"10px", background:"#ede8da", borderTop:"1px solid #1a1a18"}}>
          <button style={S.backBtn} onClick={()=>setMode("menu")}>← MENU</button>
          <div style={{fontFamily:"'Arial Black',Helvetica,sans-serif", fontWeight:"900", fontSize:"18px", textTransform:"uppercase", color:"#1a1a18"}}>Vocabulary List</div>
          <div style={{marginLeft:"auto", fontFamily:"'Times New Roman',Times,serif", fontSize:"12px", color:"#6a6050"}}>{listVocab.length} words</div>
        </div>
        <input style={S.searchBox} placeholder="Search in Japanese or English…" value={listSearch} onChange={e=>setListSearch(e.target.value)} />
        <div style={{border:"1px solid #1a1a18", borderTop:"none"}}>
          {Object.entries(grouped).map(([grp,words]) => (
            <div key={grp}>
              {!listSearch && <div style={S.listGroupHeader}>{grp} · {words.length}</div>}
              {words.map(v => {
                const expanded = expandedWord === v.jp;
                return (
                  <div key={v.jp} style={S.listItem(expanded)} onClick={()=>setExpandedWord(expanded?null:v.jp)}>
                    <div style={S.listItemHeader}>
                      <div style={{minWidth:0, flex:1}}>
                        <div style={S.listItemJp}>{v.jp}</div>
                        {showRomaji && (() => { const r = toRomaji(v.jp); return r && r !== v.jp ? <div style={{fontSize:"10px",color:"#6a6050",fontStyle:"italic",fontFamily:"'Times New Roman',Times,serif",marginBottom:"1px"}}>{r}</div> : null; })()}
                        <div style={S.listItemEn}>{v.en}</div>
                      </div>
                      <div style={{display:"flex", alignItems:"center", gap:"8px", flexShrink:0, marginLeft:"12px"}}>
                        <SpeakBtn text={v.jp} />
                        <div style={{fontSize:"14px", color:"#6a6050", fontFamily:"Helvetica,Arial,sans-serif"}}>{expanded?"▲":"▼"}</div>
                      </div>
                    </div>
                    {expanded && <div style={S.listItemExpanded}>
                      <div style={{...S.tagLabel, marginBottom:"8px"}}>Example sentence</div>
                      <div style={{display:"flex", alignItems:"flex-start", gap:"8px"}}>
                        <div style={{flex:1}}>
                          <div style={S.sentenceJp}>{v.sentence}</div>
                          {showRomaji && (() => { const r = toRomaji(v.sentence); return r && r !== v.sentence ? <div style={{fontSize:"11px",color:"#6a6050",fontStyle:"italic",fontFamily:"'Times New Roman',Times,serif",marginBottom:"4px"}}>{r}</div> : null; })()}
                          <div style={S.sentenceEn}>{v.sentenceEn}</div>
                        </div>
                        <SpeakBtn text={v.sentence} style={{marginTop:"2px"}} />
                      </div>
                      <div style={{...S.tagLabel, marginTop:"10px", marginBottom:"2px"}}>Group</div>
                      <div style={{fontFamily:"'Times New Roman',Times,serif", fontSize:"12px", color:"#4a4038"}}>{v.group}</div>
                    </div>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Frame>
    );
  }

  if (mode === "flashcard" && currentCard) {
    const front = direction==="jp2en"?currentCard.jp:currentCard.en;
    const back = direction==="jp2en"?currentCard.en:currentCard.jp;
    const frontIsJp = direction==="jp2en";
    const backIsJp = direction==="en2jp";
    const cardTint = GROUP_TINTS[currentCard.group]||"#f5f0e8";
    return (
      <Frame>
        <div style={{padding:"12px 14px"}}>
          <div style={{display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px"}}>
            <button style={S.backBtn} onClick={()=>setMode("menu")}>← MENU</button>
            <div style={S.progressBar}><div style={S.progressFill(progress)}/></div>
            <span style={{fontFamily:"'Times New Roman',Times,serif", fontSize:"12px", color:"#4a4038", whiteSpace:"nowrap"}}>{index+1}/{deck.length}</span>
          </div>
          <div style={{border:"1px solid #1a1a18", marginBottom:"12px"}} onClick={()=>setFlipped(f=>!f)}>
            <div style={{background:"#1a1a18", color:"#f5f0e8", fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"11px", textTransform:"uppercase", letterSpacing:"2px", padding:"5px 12px", display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer"}}>
              <span>{frontIsJp?"Japanese Word":"English Word"}</span>
              <span style={{fontSize:"10px", color:"#a09888", fontWeight:"400"}}>{currentCard.group}</span>
            </div>
            <div style={{...S.flipCard, border:"none", marginBottom:0}}>
              <div style={S.flipInner(flipped)}>
                <div style={S.flipFace(false)}>
                  <div style={S.tagLabel}>{frontIsJp?"Japanese":"English"}</div>
                  <div style={frontIsJp?S.jpText:S.enText}>{front}</div>
                  {frontIsJp && <Romaji text={front} />}
                  <div style={S.tapHint}>— click to reveal —</div>
                </div>
                <div style={{...S.flipFace(true), background:cardTint}}>
                  <div style={S.tagLabel}>{backIsJp?"Japanese":"English"}</div>
                  <div style={backIsJp?S.jpText:S.enText}>{back}</div>
                  {backIsJp && <Romaji text={back} />}
                  <div style={{fontFamily:"Helvetica,Arial,sans-serif", fontSize:"11px", color:"#6a6050", marginTop:"8px", textTransform:"uppercase", letterSpacing:"1px"}}>{currentCard.group}</div>
                </div>
              </div>
            </div>
          </div>
          <div style={{display:"flex", gap:"8px", marginBottom:"12px"}}>
            <button style={S.sentenceToggle} onClick={()=>setShowSentence(s=>!s)}>
              {showSentence?"HIDE EXAMPLE":"SHOW EXAMPLE SENTENCE"}
            </button>
            <SpeakBtn text={currentCard.jp} />
          </div>
          {showSentence && (
            <div style={S.sentenceBox}>
              <div style={{display:"flex", alignItems:"flex-start", gap:"8px"}}>
                <div style={{flex:1}}>
                  <div style={S.sentenceJp}>{currentCard.sentence}</div>
                  {showRomaji && (() => { const r = toRomaji(currentCard.sentence); return r && r !== currentCard.sentence ? <div style={{fontSize:"11px",color:"#6a6050",fontStyle:"italic",fontFamily:"'Times New Roman',Times,serif",marginBottom:"4px"}}>{r}</div> : null; })()}
                  <div style={S.sentenceEn}>{currentCard.sentenceEn}</div>
                </div>
                <SpeakBtn text={currentCard.sentence} style={{marginTop:"2px"}} />
              </div>
            </div>
          )}
          <div style={S.actionRow}>
            <button style={S.actionBtn("#f87171")} onClick={()=>{setUnknown(s=>new Set(s).add(index));nextCard();}}>× AGAIN</button>
            <button style={S.actionBtn("#4ade80")} onClick={()=>{
              const key=`${currentCard.jp}_${direction}`;
              setPersistentKnown(s=>new Set(s).add(key));
              setKnown(s=>new Set(s).add(index));
              nextCard();
            }}>○ GOT IT</button>
          </div>
          <div style={{fontFamily:"'Times New Roman',Times,serif", fontSize:"12px", color:"#6a6050", display:"flex", gap:"16px", justifyContent:"center"}}>
            <span>○ {known.size} known</span><span>× {unknown.size} to review</span>
          </div>
          <div style={S.kbHint}>Space: flip · → Got it · ← Again</div>
        </div>
      </Frame>
    );
  }

  if (mode === "quiz" && currentCard) {
    const question = direction==="jp2en"?currentCard.jp:currentCard.en;
    const correctAns = direction==="jp2en"?currentCard.en:currentCard.jp;
    const questionIsJp = direction==="jp2en";
    const optionsAreJp = direction==="en2jp";
    const cardTint = GROUP_TINTS[currentCard.group]||"#f5f0e8";
    return (
      <Frame>
        <div style={{padding:"12px 14px"}}>
          <div style={{display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px"}}>
            <button style={S.backBtn} onClick={()=>setMode("menu")}>← MENU</button>
            <div style={S.progressBar}><div style={S.progressFill(progress)}/></div>
            <span style={{fontFamily:"'Times New Roman',Times,serif", fontSize:"12px", color:"#4a4038", whiteSpace:"nowrap"}}>{score.correct}/{score.total}</span>
          </div>
          <div style={{border:"1px solid #1a1a18", marginBottom:"12px"}}>
            <div style={{background:"#1a1a18", color:"#f5f0e8", fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"11px", textTransform:"uppercase", letterSpacing:"2px", padding:"5px 12px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <span>{questionIsJp?"What does this mean?":"How do you write this?"}</span>
              <span style={{fontSize:"10px", color:"#a09888", fontWeight:"400"}}>{currentCard.group}</span>
            </div>
            <div style={{background:cardTint, padding:"20px", textAlign:"center", display:"flex", alignItems:"center", justifyContent:"center", gap:"10px", flexWrap:"wrap"}}>
              <div>
                <div style={questionIsJp?S.jpText:{...S.enText,fontSize:"clamp(18px,4.5vw,26px)"}}>{question}</div>
                {questionIsJp && <Romaji text={question} />}
              </div>
              <SpeakBtn text={currentCard.jp} />
            </div>
          </div>
          {quizOptions.map((opt,i)=>{
            const isCorrect=opt===correctAns, isSelected=opt===quizSelected;
            const state=quizSelected===null?null:isCorrect?"correct":isSelected?"wrong":null;
            return (
              <button key={opt} style={S.quizOption(state)} onClick={()=>handleQuizAnswer(opt)}>
                <span style={{fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"11px", color:"#888078", marginRight:"8px"}}>{i+1}</span>
                {opt}
                {optionsAreJp && showRomaji && (() => { const r = toRomaji(opt); return r && r !== opt ? <div style={{fontSize:"11px",color:"#6a6050",marginTop:"2px",fontStyle:"italic",fontFamily:"'Times New Roman',Times,serif"}}>{r}</div> : null; })()}
              </button>
            );
          })}
          {quizSelected !== null && <>
            <div style={S.sentenceBox}>
              <div style={{display:"flex", alignItems:"flex-start", gap:"8px"}}>
                <div style={{flex:1}}>
                  <div style={{...S.tagLabel, marginBottom:"6px"}}>Example sentence</div>
                  <div style={S.sentenceJp}>{currentCard.sentence}</div>
                  {showRomaji && (() => { const r = toRomaji(currentCard.sentence); return r && r !== currentCard.sentence ? <div style={{fontSize:"11px",color:"#6a6050",fontStyle:"italic",fontFamily:"'Times New Roman',Times,serif",marginBottom:"4px"}}>{r}</div> : null; })()}
                  <div style={S.sentenceEn}>{currentCard.sentenceEn}</div>
                </div>
                <SpeakBtn text={currentCard.sentence} style={{marginTop:"2px"}} />
              </div>
            </div>
            <button style={S.startBtn} onClick={nextCard}>NEXT →</button>
          </>}
          {quizSelected === null && <div style={S.kbHint}>1–4: select answer</div>}
          {quizSelected !== null && <div style={S.kbHint}>Enter: next card</div>}
        </div>
      </Frame>
    );
  }

  if (mode === "write" && currentCard) {
    const cardTint = GROUP_TINTS[currentCard.group] || "#f5f0e8";
    const kanaPreview = writeInput && typeof wanakana !== 'undefined' ? wanakana.toKana(writeInput) : writeInput;
    const submittedKana = writeInput.trim() && typeof wanakana !== 'undefined' ? wanakana.toKana(writeInput.trim()) : writeInput.trim();
    return (
      <Frame>
        <div style={{padding:"12px 14px"}}>
          <div style={{display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px"}}>
            <button style={S.backBtn} onClick={()=>setMode("menu")}>← MENU</button>
            <div style={S.progressBar}><div style={S.progressFill(progress)}/></div>
            <span style={{fontFamily:"'Times New Roman',Times,serif", fontSize:"12px", color:"#4a4038", whiteSpace:"nowrap"}}>{score.correct}/{score.total}</span>
          </div>
          <div style={{border:"1px solid #1a1a18", marginBottom:"12px"}}>
            <div style={{background:"#4a5a8a", color:"#f5f0e8", fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"11px", textTransform:"uppercase", letterSpacing:"2px", padding:"5px 12px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <span>Write the Japanese</span>
              <span style={{fontSize:"10px", color:"#b0b8d0", fontWeight:"400"}}>{currentCard.group}</span>
            </div>
            <div style={{background:cardTint, padding:"24px 20px", textAlign:"center"}}>
              <div style={{fontFamily:"'Times New Roman',Times,serif", fontSize:"clamp(20px,5vw,32px)", fontWeight:"700", color:"#1a1a18"}}>{currentCard.en}</div>
            </div>
          </div>

          {!writeSubmitted && (
            <div style={{marginBottom:"12px"}}>
              <div style={{...S.tagLabel, marginBottom:"6px"}}>Type in rōmaji or tap kana directly</div>
              <div style={{display:"flex", gap:"8px"}}>
                <input
                  key={index}
                  ref={writeInputRef}
                  style={{flex:1, border:"2px solid #1a1a18", padding:"10px 14px", fontFamily:"'Times New Roman',Times,serif", fontSize:"20px", outline:"none", background:"#fff", color:"#1a1a18", boxSizing:"border-box"}}
                  onCompositionEnd={e => { setWriteInput(e.currentTarget.value); }}
                  onChange={e => { if (!e.nativeEvent.isComposing) setWriteInput(e.target.value); }}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); submitWriteAnswer(); } }}
                  placeholder="neko, ねこ, ネコ…"
                  lang="ja"
                  autoFocus
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
                <button style={{background:"#1a1a18", color:"#f5f0e8", border:"1px solid #1a1a18", fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"12px", textTransform:"uppercase", cursor:"pointer", padding:"8px 14px"}} onClick={submitWriteAnswer}>CHECK</button>
              </div>
              {kanaPreview && kanaPreview !== writeInput && (
                <div style={{marginTop:"6px", fontFamily:"'Times New Roman',Times,serif", fontSize:"24px", color:"#1a1a18", padding:"8px 14px", background:"#ede8da", border:"1px solid #c8c0b4", letterSpacing:"2px"}}>
                  {kanaPreview}
                </div>
              )}
            </div>
          )}

          {writeSubmitted && (
            <div style={{marginBottom:"12px", border:`2px solid ${writeCorrect?"#3d6b3d":"#7a3030"}`, background:writeCorrect?"#d8e8d0":"#e8d4d4", padding:"14px 16px"}}>
              <div style={{fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"12px", textTransform:"uppercase", letterSpacing:"1px", color:writeCorrect?"#2c5020":"#5c2020", marginBottom:"10px"}}>
                {writeCorrect ? "○ Correct!" : "× Not quite"}
              </div>
              <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'Times New Roman',Times,serif", fontSize:"11px", color:"#6a6050", marginBottom:"3px"}}>Correct answer</div>
                  <div style={{fontFamily:"'Times New Roman',Times,serif", fontSize:"30px", fontWeight:"700", color:"#1a1a18"}}>{currentCard.jp}</div>
                  {showRomaji && (() => { const r = toRomaji(currentCard.jp); return r && r !== currentCard.jp ? <div style={{fontSize:"11px",color:"#6a6050",fontStyle:"italic",fontFamily:"'Times New Roman',Times,serif"}}>{r}</div> : null; })()}
                </div>
                <SpeakBtn text={currentCard.jp}/>
              </div>
              {!writeCorrect && (
                <div style={{marginTop:"10px", paddingTop:"10px", borderTop:"1px solid #c8a0a0"}}>
                  <div style={{fontFamily:"'Times New Roman',Times,serif", fontSize:"11px", color:"#5c2020", marginBottom:"2px"}}>You wrote</div>
                  <div style={{fontFamily:"'Times New Roman',Times,serif", fontSize:"22px", color:"#7a3030", fontWeight:"700"}}>{submittedKana}</div>
                </div>
              )}
            </div>
          )}

          {writeSubmitted && (
            <div style={{...S.sentenceBox, marginBottom:"12px"}}>
              <div style={{display:"flex", alignItems:"flex-start", gap:"8px"}}>
                <div style={{flex:1}}>
                  <div style={{...S.tagLabel, marginBottom:"6px"}}>Example sentence</div>
                  <div style={S.sentenceJp}>{currentCard.sentence}</div>
                  {showRomaji && (() => { const r = toRomaji(currentCard.sentence); return r && r !== currentCard.sentence ? <div style={{fontSize:"11px",color:"#6a6050",fontStyle:"italic",fontFamily:"'Times New Roman',Times,serif",marginBottom:"4px"}}>{r}</div> : null; })()}
                  <div style={S.sentenceEn}>{currentCard.sentenceEn}</div>
                </div>
                <SpeakBtn text={currentCard.sentence} style={{marginTop:"2px"}} />
              </div>
            </div>
          )}

          {writeSubmitted && <button style={S.startBtn} onClick={nextCard}>NEXT →</button>}
          <div style={S.kbHint}>{writeSubmitted ? "Enter: next card" : "Enter: check answer"}</div>
        </div>
      </Frame>
    );
  }

  if (mode === "grammar") {
    return <GrammarView onBack={()=>setMode("menu")} onCards={startFlashcards} onList={openList} showRomaji={showRomaji}/>;
  }

  return null;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
