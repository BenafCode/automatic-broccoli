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
    setMode("flashcard");
  }
  function startQuiz() {
    setDeck(shuffle(filteredVocab));
    setIndex(0); setQuizSelected(null);
    setScore({ correct: 0, total: 0 });
    setMissedWords([]);
    setMode("quiz");
  }
  function openList() { setListSearch(""); setExpandedWord(null); setMode("list"); }

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

      if (mode === 'list' && e.key === 'Escape') {
        setExpandedWord(null);
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mode, currentCard, quizSelected, quizOptions, index, direction, deck]);

  const GROUP_TINTS = {
    "All":"#f0f0e8","Basics":"#8e8a25","Countries":"#b3bd95","Occupations":"#d77a7a",
    "Things & Places":"#e6915d","Directions":"#c0d4a7","Transport":"#9ab6c8",
    "Verbs":"#a5b8c0","Time":"#8c9ae0","Food & Drink":"#c0d4a7","Adjectives":"#b3bd95",
    "Colors":"#d77a7a","Na-Adjectives":"#e6915d","Body":"#9ab6c8",
    "Fruit & Veg":"#a5b8c0","Seafood":"#8c9ae0","Clothes":"#8e8a25","Hobbies":"#c0d4a7"
  };

  const Frame = ({children}) => (
    <div style={{background: isMobile ? "#fff" : "#888",minHeight:"100vh",padding: isMobile ? "0" : "8px 0",boxSizing:"border-box"}}>
      <div style={{border: isMobile ? "none" : "8px solid #000",maxWidth:"760px",margin:"0 auto",background:"#fff",fontFamily:"'Times New Roman',Times,serif",color:"#000",boxSizing:"border-box"}}>
        <div style={{background:"#000",color:"#fff",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px"}}>
          <div>
            <div style={{fontFamily:"Helvetica,Arial,sans-serif",fontWeight:"700",fontSize:"16px",textTransform:"uppercase",color:"#fff"}}>日本語 · Vocabulary Study</div>
            <div style={{fontFamily:"Helvetica,Arial,sans-serif",fontSize:"11px",color:"#aaa",textTransform:"uppercase",letterSpacing:"1px"}}>Build Your Japanese. Online.</div>
          </div>
          <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
            <span style={{fontFamily:"Helvetica,Arial,sans-serif",fontWeight:"700",fontSize:"14px",color:"#e91d2a"}}>{filteredVocab.length} WORDS</span>
            <div style={{background:"#fcc20f",color:"#000",border:"1px solid #000",fontFamily:"Helvetica,Arial,sans-serif",fontWeight:"700",fontSize:"11px",padding:"4px 8px",textTransform:"uppercase",textAlign:"center",lineHeight:"1.3"}}>STUDY<br/>NOW</div>
          </div>
        </div>
        {children}
        <div style={{background:"#fff",borderTop:"1px solid #000",padding:"10px 16px",...(isMobile?{position:"sticky",bottom:0,zIndex:10}:{})}}>
          <div style={{display:"flex",justifyContent:"space-around",borderBottom:"1px solid #000",paddingBottom:"8px",marginBottom:"6px"}}>
            {[["🏠","HOME",()=>setMode("menu")],["🃏","CARDS",startFlashcards],["📋","LIST",openList],["📖","GRAMMAR",()=>setMode("grammar")]].map(([icon,label,fn])=>(
              <button key={label} onClick={fn} style={{background:"none",border:"none",cursor:"pointer",textAlign:"center",fontFamily:"Helvetica,Arial,sans-serif",fontWeight:"700",fontSize:"11px",textTransform:"uppercase",color:"#0000ee",textDecoration:"underline",display:"flex",flexDirection:"column",alignItems:"center",gap:"3px",padding:"4px 8px"}}>
                <span style={{fontSize:"18px"}}>{icon}</span>{label}
              </button>
            ))}
          </div>
          <div style={{fontFamily:"'Times New Roman',Times,serif",fontSize:"11px",color:"#555",textAlign:"center",fontStyle:"italic"}}>
            This site is best viewed with browser versions 3.0 and higher.
          </div>
        </div>
      </div>
    </div>
  );

  const S = {
    topRow: { display:"flex",alignItems:"center",gap:"10px",marginBottom:"12px" },
    backBtn: { background:"#fff",border:"1px solid #000",color:"#000",fontFamily:"Helvetica,Arial,sans-serif",fontWeight:"700",fontSize:"12px",textTransform:"uppercase",cursor:"pointer",padding:"4px 12px" },
    tagLabel: { fontFamily:"Helvetica,Arial,sans-serif",fontWeight:"700",fontSize:"11px",textTransform:"uppercase",letterSpacing:"1px",color:"#555",marginBottom:"4px" },
    kbHint: { fontFamily:"'Times New Roman',Times,serif",fontSize:"11px",color:"#555",fontStyle:"italic",textAlign:"center",marginTop:"8px" },
    counterChip: { fontFamily:"'Times New Roman',Times,serif",fontSize:"13px",color:"#333" },
    progressBar: { height:"4px",background:"#ddd",border:"1px solid #000",overflow:"hidden",flex:1 },
    progressFill: p => ({ height:"100%",width:`${p}%`,background:"#000" }),
    flipCard: { perspective:"1000px",marginBottom:"12px",cursor:"pointer" },
    flipInner: f => ({ width:"100%",position:"relative",transformStyle:"preserve-3d",transition:"transform 0.5s cubic-bezier(0.4,0,0.2,1)",transform:f?"rotateY(180deg)":"rotateY(0deg)" }),
    flipFace: b => ({ position:b?"absolute":"relative",top:0,left:0,width:"100%",backfaceVisibility:"hidden",WebkitBackfaceVisibility:"hidden",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",transform:b?"rotateY(180deg)":"rotateY(0deg)",background:b?"#f0f0e8":"#fff",padding:"28px 20px",boxSizing:"border-box",minHeight:"180px" }),
    jpText: { fontFamily:"'Times New Roman',Times,serif",fontSize:"clamp(32px,9vw,58px)",fontWeight:"700",color:"#000",textAlign:"center",lineHeight:1.2 },
    enText: { fontFamily:"'Times New Roman',Times,serif",fontSize:"clamp(18px,4.5vw,26px)",fontWeight:"400",color:"#000",textAlign:"center" },
    romajiText: { fontFamily:"'Times New Roman',Times,serif",fontSize:"12px",color:"#555",marginTop:"4px",fontStyle:"italic",textAlign:"center" },
    tapHint: { fontFamily:"'Times New Roman',Times,serif",fontSize:"11px",color:"#555",marginTop:"8px",fontStyle:"italic" },
    sentenceBox: { border:"1px solid #000",background:"#f8f8f0",padding:"12px 16px",marginBottom:"12px",fontFamily:"'Times New Roman',Times,serif",fontSize:"14px" },
    sentenceJp: { fontSize:"16px",color:"#000",fontWeight:"500",marginBottom:"4px",lineHeight:1.5 },
    sentenceEn: { fontSize:"13px",color:"#333",lineHeight:1.5 },
    sentenceToggle: { border:"1px solid #000",background:"#fff",color:"#000",fontFamily:"Helvetica,Arial,sans-serif",fontWeight:"700",fontSize:"12px",textTransform:"uppercase",padding:"5px 14px",cursor:"pointer",flex:1 },
    actionRow: { display:"flex",gap:"8px",marginBottom:"12px" },
    actionBtn: c => ({ flex:1,padding:"14px 10px",minHeight:"52px",border:"1px solid #000",background:c==="#f87171"?"#990000":c==="#4ade80"?"#004400":"#fff",color:c==="#f87171"||c==="#4ade80"?"#fff":"#000",fontFamily:"Helvetica,Arial,sans-serif",fontWeight:"700",fontSize:"14px",textTransform:"uppercase",cursor:"pointer" }),
    startBtn: { display:"block",width:"100%",padding:"12px",border:"1px solid #000",background:"#000",color:"#fff",fontFamily:"Helvetica,Arial,sans-serif",fontWeight:"700",fontSize:"14px",textTransform:"uppercase",cursor:"pointer",marginBottom:"8px",textAlign:"center" },
    quizOption: s => ({ display:"block",width:"100%",padding:"14px 16px",marginBottom:"8px",minHeight:"52px",border:s==="correct"?"2px solid #004400":s==="wrong"?"2px solid #990000":"1px solid #000",background:s==="correct"?"#c0d4a7":s==="wrong"?"#d77a7a":"#fff",color:"#000",fontFamily:"'Times New Roman',Times,serif",fontSize:"15px",cursor:quizSelected!==null?"default":"pointer",textAlign:"left" }),
    searchBox: { width:"100%",border:"1px solid #000",borderTop:"none",padding:"8px 12px",fontFamily:"'Times New Roman',Times,serif",fontSize:"14px",outline:"none",background:"#fff",color:"#000",boxSizing:"border-box" },
    listGroupHeader: { fontFamily:"'Arial Black','Arial Bold',Helvetica,sans-serif",fontWeight:"900",fontSize:"13px",textTransform:"uppercase",padding:"6px 12px",borderBottom:"1px solid #000",background:"#f0f0f0",borderTop:"1px solid #000" },
    listItem: e => ({ border:"1px solid #000",borderTop:"none",background:e?"#f8f8f0":"#fff",cursor:"pointer" }),
    listItemHeader: { display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px" },
    listItemJp: { fontFamily:"'Times New Roman',Times,serif",fontSize:"20px",fontWeight:"700",color:"#000" },
    listItemEn: { fontFamily:"'Times New Roman',Times,serif",fontSize:"13px",color:"#333",marginTop:"1px" },
    listItemExpanded: { padding:"0 14px 12px",borderTop:"1px solid #ccc",fontFamily:"'Times New Roman',Times,serif" },
    card: { border:"1px solid #000",background:"#fff",padding:"16px" },
    sectionLabel: { fontFamily:"Helvetica,Arial,sans-serif",fontWeight:"700",fontSize:"11px",textTransform:"uppercase",letterSpacing:"1px",color:"#000",marginBottom:"6px",borderBottom:"1px solid #ccc",paddingBottom:"3px" },
    groupGrid: { display:"flex",flexWrap:"wrap",gap:"4px",marginBottom:"12px" },
    groupBtn: a => ({ padding:"3px 8px",border:"1px solid #000",background:a?"#000":"#fff",color:a?"#fff":"#0000ee",fontFamily:"Helvetica,Arial,sans-serif",fontWeight:a?"700":"400",fontSize:"11px",cursor:"pointer",textTransform:"uppercase",textDecoration:a?"none":"underline" }),
    modeRow: { display:"flex",gap:"8px",marginBottom:"10px" },
    modeBtn: a => ({ flex:1,padding:"8px 6px",border:"1px solid #000",background:a?"#000":"#fff",color:a?"#fff":"#000",fontFamily:"Helvetica,Arial,sans-serif",fontWeight:"700",fontSize:"12px",cursor:"pointer",textTransform:"uppercase" }),
    dirBtn: a => ({ flex:1,padding:"7px",border:"1px solid #000",background:a?"#000":"#fff",color:a?"#fff":"#0000ee",fontFamily:"Helvetica,Arial,sans-serif",fontWeight:a?"700":"400",fontSize:"12px",cursor:"pointer",textTransform:"uppercase",textDecoration:a?"none":"underline" }),
    title: { fontFamily:"'Arial Black','Arial Bold',Helvetica,sans-serif",fontWeight:"900",fontSize:"clamp(20px,5vw,36px)",textTransform:"uppercase",color:"#000",textAlign:"center" },
    subtitle: { fontFamily:"Helvetica,Arial,sans-serif",fontSize:"12px",color:"#555",textTransform:"uppercase",letterSpacing:"2px",textAlign:"center" },
    app: { background:"#888",minHeight:"100vh",padding:"8px 0" },
  };

  function Romaji({ text }) {
    if (!showRomaji) return null;
    const r = toRomaji(text);
    if (!r || r === text) return null;
    return <div style={S.romajiText}>{r}</div>;
  }

  const MenuRibbonCards = () => (
    <>
      <div style={{background:GROUP_TINTS[group]||"#f0f0e8",color:"#000",fontFamily:"'Arial Black','Arial Bold',Helvetica,sans-serif",fontWeight:"900",fontSize:"clamp(14px,4vw,26px)",lineHeight:"1.0",padding:"10px 14px",textTransform:"uppercase",borderBottom:"1px solid #000"}}>
        {group==="All"?"ALL TOPICS":group.toUpperCase()}
        <div style={{fontFamily:"Helvetica,Arial,sans-serif",fontWeight:"700",fontSize:"11px",marginTop:"4px"}}>{filteredVocab.length} words available</div>
      </div>
      <div style={{borderBottom:"1px solid #000",padding:"6px 8px",background:"#f8f8f8",display:"flex",flexWrap:"wrap",gap:"4px"}}>
        {ALL_GROUPS.map(g=>(
          <button key={g} onClick={()=>setGroup(g)} style={{padding:"6px 8px",border:"1px solid #000",background:group===g?"#000":(GROUP_TINTS[g]||"#fff"),color:group===g?"#fff":"#000",fontFamily:"Helvetica,Arial,sans-serif",fontWeight:"700",fontSize:"11px",cursor:"pointer",textTransform:"uppercase",minHeight:"36px"}}>
            {g}
          </button>
        ))}
      </div>
      {(group==="All"?ALL_GROUPS.filter(g=>g!=="All"):[group]).map(g=>{
        const gWords=vocab.filter(v=>v.group===g);
        if(!gWords.length)return null;
        const tint=GROUP_TINTS[g]||"#f0f0e8";
        const gMastered=gWords.filter(w=>persistentKnown.has(`${w.jp}_${direction}`)).length;
        return(
          <div key={g} style={{borderBottom:"1px solid #000"}}>
            <div style={{background:"#fff",borderBottom:"1px solid #000",fontFamily:"Helvetica,Arial,sans-serif",fontWeight:"700",fontSize:"12px",padding:"4px 12px",textTransform:"uppercase",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span>{g}</span>
              <span style={{fontSize:"11px",fontWeight:"400",fontFamily:"'Times New Roman',Times,serif"}}>{gWords.length} words{gMastered>0?` · ✓${gMastered}`:""}</span>
            </div>
            <div style={{background:tint,color:"#000",padding:"7px 12px",fontFamily:"'Times New Roman',Times,serif",fontSize:"13px",lineHeight:"1.4",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span>{gWords.slice(0,4).map(w=>w.jp).join(" · ")}{gWords.length>4?" · …":""}</span>
              {gMastered>0&&<span style={{fontSize:"11px",fontFamily:"Helvetica,Arial,sans-serif",fontWeight:"700",color:"#004400",flexShrink:0,marginLeft:"8px"}}>✓{gMastered}/{gWords.length}</span>}
            </div>
          </div>
        );
      })}
      <div style={{padding:"6px 12px",fontFamily:"'Times New Roman',Times,serif",fontSize:"12px",color:"#555",fontStyle:"italic"}}>
        {filteredVocab.length} words selected{masteredCount>0?` · ✓ ${masteredCount} mastered`:""}
      </div>
    </>
  );

  if (mode === "menu") return (
    <Frame>
      {isMobile ? (
        <div>
          <div style={{background:"#e91d2a",color:"#fff",borderTop:"1px solid #000",padding:"12px 14px"}}>
            {masteredCount>0&&<div style={{fontFamily:"'Times New Roman',Times,serif",fontSize:"12px",color:"#ffcccc",marginBottom:"6px"}}>✓ {masteredCount} words mastered</div>}
            <div style={{display:"flex",gap:"8px"}}>
              <button style={{flex:1,background:"#000",color:"#fff",border:"1px solid #fff",fontFamily:"Helvetica,Arial,sans-serif",fontWeight:"700",fontSize:"13px",padding:"12px 8px",textTransform:"uppercase",cursor:"pointer",minHeight:"48px"}} onClick={startFlashcards}>▶ FLASH CARDS</button>
              <button style={{flex:1,background:"#fff",color:"#000",border:"1px solid #000",fontFamily:"Helvetica,Arial,sans-serif",fontWeight:"700",fontSize:"13px",padding:"12px 8px",textTransform:"uppercase",cursor:"pointer",minHeight:"48px"}} onClick={startQuiz}>▶ QUIZ MODE</button>
            </div>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:"4px",padding:"8px",borderBottom:"1px solid #000",background:"#f0f0f0",borderTop:"1px solid #000"}}>
            {[["JP→EN","jp2en",()=>setDirection("jp2en")],["EN→JP","en2jp",()=>setDirection("en2jp")]].map(([label,val,fn])=>(
              <button key={val} onClick={fn} style={{padding:"8px 12px",border:"1px solid #000",background:direction===val?"#000":"#fff",color:direction===val?"#fff":"#0000ee",fontFamily:"Helvetica,Arial,sans-serif",fontWeight:"700",fontSize:"12px",cursor:"pointer",textTransform:"uppercase",textDecoration:direction===val?"none":"underline",minHeight:"44px"}}>{label}</button>
            ))}
            <button onClick={()=>setShowRomaji(r=>!r)} style={{padding:"8px 12px",border:"1px solid #000",background:showRomaji?"#000":"#fff",color:showRomaji?"#fff":"#0000ee",fontFamily:"Helvetica,Arial,sans-serif",fontWeight:"700",fontSize:"12px",cursor:"pointer",textTransform:"uppercase",textDecoration:showRomaji?"none":"underline",minHeight:"44px"}}>ローマ字 {showRomaji?"ON":"OFF"}</button>
            <button onClick={openList} style={{padding:"8px 12px",border:"1px solid #000",background:"#fff",color:"#0000ee",fontFamily:"Helvetica,Arial,sans-serif",fontWeight:"700",fontSize:"12px",cursor:"pointer",textTransform:"uppercase",textDecoration:"underline",minHeight:"44px"}}>📋 LIST</button>
            <button onClick={()=>setMode("grammar")} style={{padding:"8px 12px",border:"1px solid #000",background:"#fff",color:"#0000ee",fontFamily:"Helvetica,Arial,sans-serif",fontWeight:"700",fontSize:"12px",cursor:"pointer",textTransform:"uppercase",textDecoration:"underline",minHeight:"44px"}}>📖 GRAMMAR</button>
          </div>
          <MenuRibbonCards/>
        </div>
      ) : (
        <div style={{display:"flex",borderTop:"1px solid #000"}}>
          <div style={{width:"190px",flexShrink:0,borderRight:"1px solid #000"}}>
            <div style={{background:"#e91d2a",color:"#fff",borderBottom:"1px solid #000",padding:"14px"}}>
              <div style={{fontFamily:"Helvetica,Arial,sans-serif",fontWeight:"700",fontSize:"13px",textTransform:"uppercase",marginBottom:"6px"}}>Start Studying</div>
              <div style={{fontFamily:"'Times New Roman',Times,serif",fontSize:"13px",lineHeight:"1.4",marginBottom:"8px"}}>Select a topic, choose your study mode, and build your Japanese vocabulary.</div>
              {masteredCount>0&&<div style={{fontFamily:"'Times New Roman',Times,serif",fontSize:"12px",color:"#ffcccc"}}>✓ {masteredCount} words mastered</div>}
              <button style={{display:"block",width:"100%",marginTop:"8px",background:"#000",color:"#fff",border:"1px solid #fff",fontFamily:"Helvetica,Arial,sans-serif",fontWeight:"700",fontSize:"12px",padding:"6px",textTransform:"uppercase",cursor:"pointer"}} onClick={startFlashcards}>▶ FLASH CARDS</button>
              <button style={{display:"block",width:"100%",marginTop:"5px",background:"#fff",color:"#000",border:"1px solid #000",fontFamily:"Helvetica,Arial,sans-serif",fontWeight:"700",fontSize:"12px",padding:"6px",textTransform:"uppercase",cursor:"pointer"}} onClick={startQuiz}>▶ QUIZ MODE</button>
            </div>
            {[["Direction",[["JP → EN","jp2en",()=>setDirection("jp2en")],["EN → JP","en2jp",()=>setDirection("en2jp")]]],["Options",[["ローマ字 "+(showRomaji?"ON":"OFF"),showRomaji?"on":"",()=>setShowRomaji(r=>!r)]]],["Browse",[["📋 Word List","",openList],["📖 Grammar Guide","",()=>setMode("grammar")]]]].map(([sLabel,items])=>(
              <div key={sLabel}>
                <div style={{fontFamily:"Helvetica,Arial,sans-serif",fontWeight:"700",fontSize:"10px",textTransform:"uppercase",letterSpacing:"1px",padding:"5px 10px",borderBottom:"1px solid #000",borderTop:"1px solid #000",background:"#f0f0f0",color:"#000"}}>{sLabel}</div>
                {items.map(([label,active,fn])=>(
                  <button key={label} onClick={fn} style={{display:"block",width:"100%",textAlign:"left",padding:"5px 10px",border:"none",borderBottom:"1px solid #ccc",background:active?"#000":"#fff",color:active?"#fff":"#0000ee",fontFamily:"Helvetica,Arial,sans-serif",fontWeight:active?"700":"400",fontSize:"12px",cursor:"pointer",textTransform:"uppercase",textDecoration:active?"none":"underline"}}>{label}</button>
                ))}
              </div>
            ))}
          </div>
          <div style={{flex:1,minWidth:0}}>
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
          <div style={{background:"#e91d2a",color:"#fff",border:"1px solid #000",padding:"16px",marginBottom:"12px",textAlign:"center"}}>
            <div style={{fontFamily:"'Arial Black',Helvetica,sans-serif",fontWeight:"900",fontSize:"48px",color:"#fff",lineHeight:"1.0"}}>{pct}%</div>
            <div style={{fontFamily:"Helvetica,Arial,sans-serif",fontWeight:"700",fontSize:"14px",textTransform:"uppercase",marginTop:"6px"}}>完了！ Session Complete</div>
            {score.total>0&&<div style={{fontFamily:"'Times New Roman',Times,serif",fontSize:"13px",marginTop:"4px"}}>{score.correct} / {score.total} correct</div>}
            {score.total===0&&<div style={{fontFamily:"'Times New Roman',Times,serif",fontSize:"13px",marginTop:"4px"}}>All cards reviewed!</div>}
          </div>
          {missedWords.length>0&&(
            <div style={{marginBottom:"12px"}}>
              <div style={{fontFamily:"'Arial Black',Helvetica,sans-serif",fontWeight:"900",fontSize:"13px",textTransform:"uppercase",background:"#d77a7a",color:"#000",padding:"5px 12px",border:"1px solid #000"}}>Missed Words ({missedWords.length})</div>
              <div style={{maxHeight:"200px",overflowY:"auto",border:"1px solid #000",borderTop:"none"}}>
                {missedWords.map((w,i)=>(
                  <div key={i} style={{padding:"8px 12px",borderBottom:"1px solid #ccc",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"8px",background:i%2===0?"#fff":"#f8f8f0"}}>
                    <div>
                      <div style={{fontFamily:"'Times New Roman',Times,serif",fontSize:"18px",fontWeight:"700",color:"#000"}}>{w.jp}</div>
                      {showRomaji&&(()=>{const r=toRomaji(w.jp);return r&&r!==w.jp?<div style={{fontSize:"10px",color:"#555",fontStyle:"italic",fontFamily:"'Times New Roman',Times,serif"}}>{r}</div>:null;})()}
                      <div style={{fontFamily:"'Times New Roman',Times,serif",fontSize:"13px",color:"#333"}}>{w.en}</div>
                    </div>
                    <SpeakBtn text={w.jp}/>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{display:"flex",gap:"8px"}}>
            <button style={{flex:1,padding:"10px",border:"1px solid #000",background:"#fff",color:"#000",fontFamily:"Helvetica,Arial,sans-serif",fontWeight:"700",fontSize:"14px",textTransform:"uppercase",cursor:"pointer"}} onClick={()=>setMode("menu")}>← MENU</button>
            <button style={{...S.startBtn,marginBottom:0,flex:1}} onClick={score.total>0?startQuiz:startFlashcards}>TRY AGAIN</button>
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
        <div style={{borderBottom:"1px solid #000",padding:"8px 14px",display:"flex",alignItems:"center",gap:"10px",background:"#f0f0f0",borderTop:"1px solid #000"}}>
          <button style={S.backBtn} onClick={()=>setMode("menu")}>← BACK</button>
          <div style={{fontFamily:"'Arial Black',Helvetica,sans-serif",fontWeight:"900",fontSize:"18px",textTransform:"uppercase",color:"#000"}}>Vocabulary List</div>
          <div style={{marginLeft:"auto",fontFamily:"'Times New Roman',Times,serif",fontSize:"12px",color:"#555"}}>{listVocab.length} words</div>
        </div>
        <input style={S.searchBox} placeholder="Search in Japanese or English…" value={listSearch} onChange={e=>setListSearch(e.target.value)} />
        <div style={{border:"1px solid #000",borderTop:"none"}}>
          {Object.entries(grouped).map(([grp,words]) => (
            <div key={grp}>
              {!listSearch && <div style={S.listGroupHeader}>{grp} · {words.length}</div>}
              {words.map(v => {
                const expanded = expandedWord === v.jp;
                return (
                  <div key={v.jp} style={S.listItem(expanded)} onClick={()=>setExpandedWord(expanded?null:v.jp)}>
                    <div style={S.listItemHeader}>
                      <div style={{minWidth:0,flex:1}}>
                        <div style={S.listItemJp}>{v.jp}</div>
                        {showRomaji && (() => { const r = toRomaji(v.jp); return r && r !== v.jp ? <div style={{fontSize:"10px",color:"#555",fontStyle:"italic",fontFamily:"'Times New Roman',Times,serif",marginBottom:"1px"}}>{r}</div> : null; })()}
                        <div style={S.listItemEn}>{v.en}</div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:"8px",flexShrink:0,marginLeft:"12px"}}>
                        <SpeakBtn text={v.jp} />
                        <div style={{fontSize:"14px",color:"#555",fontFamily:"Helvetica,Arial,sans-serif"}}>{expanded?"▲":"▼"}</div>
                      </div>
                    </div>
                    {expanded && <div style={S.listItemExpanded}>
                      <div style={{...S.tagLabel,marginBottom:"8px"}}>Example sentence</div>
                      <div style={{display:"flex",alignItems:"flex-start",gap:"8px"}}>
                        <div style={{flex:1}}>
                          <div style={S.sentenceJp}>{v.sentence}</div>
                          {showRomaji && (() => { const r = toRomaji(v.sentence); return r && r !== v.sentence ? <div style={{fontSize:"11px",color:"#555",fontStyle:"italic",fontFamily:"'Times New Roman',Times,serif",marginBottom:"4px"}}>{r}</div> : null; })()}
                          <div style={S.sentenceEn}>{v.sentenceEn}</div>
                        </div>
                        <SpeakBtn text={v.sentence} style={{marginTop:"2px"}} />
                      </div>
                      <div style={{...S.tagLabel,marginTop:"10px",marginBottom:"2px"}}>Group</div>
                      <div style={{fontFamily:"'Times New Roman',Times,serif",fontSize:"12px",color:"#333"}}>{v.group}</div>
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
    const cardTint = GROUP_TINTS[currentCard.group]||"#f0f0e8";
    return (
      <Frame>
        <div style={{padding:"12px 14px",paddingBottom: isMobile ? "80px" : "12px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"12px"}}>
            <button style={S.backBtn} onClick={()=>setMode("menu")}>← MENU</button>
            <div style={S.progressBar}><div style={S.progressFill(progress)}/></div>
            <span style={{fontFamily:"'Times New Roman',Times,serif",fontSize:"12px",color:"#333",whiteSpace:"nowrap"}}>{index+1}/{deck.length}</span>
          </div>
          <div style={{border:"1px solid #000",marginBottom:"12px"}} onClick={()=>setFlipped(f=>!f)}>
            <div style={{background:"#000",color:"#fff",fontFamily:"Helvetica,Arial,sans-serif",fontWeight:"700",fontSize:"11px",textTransform:"uppercase",letterSpacing:"2px",padding:"5px 12px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
              <span>{frontIsJp?"Japanese Word":"English Word"}</span>
              <span style={{fontSize:"10px",color:"#aaa",fontWeight:"400"}}>{currentCard.group}</span>
            </div>
            <div style={{...S.flipCard,border:"none",marginBottom:0}}>
              <div style={S.flipInner(flipped)}>
                <div style={S.flipFace(false)}>
                  <div style={S.tagLabel}>{frontIsJp?"Japanese":"English"}</div>
                  <div style={frontIsJp?S.jpText:S.enText}>{front}</div>
                  {frontIsJp && <Romaji text={front} />}
                  <div style={S.tapHint}>— click to reveal —</div>
                </div>
                <div style={{...S.flipFace(true),background:cardTint}}>
                  <div style={S.tagLabel}>{backIsJp?"Japanese":"English"}</div>
                  <div style={backIsJp?S.jpText:S.enText}>{back}</div>
                  {backIsJp && <Romaji text={back} />}
                  <div style={{fontFamily:"Helvetica,Arial,sans-serif",fontSize:"11px",color:"#555",marginTop:"8px",textTransform:"uppercase",letterSpacing:"1px"}}>{currentCard.group}</div>
                </div>
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:"8px",marginBottom:"12px"}}>
            <button style={S.sentenceToggle} onClick={()=>setShowSentence(s=>!s)}>
              {showSentence?"HIDE EXAMPLE":"SHOW EXAMPLE SENTENCE"}
            </button>
            <SpeakBtn text={currentCard.jp} />
          </div>
          {showSentence && (
            <div style={S.sentenceBox}>
              <div style={{display:"flex",alignItems:"flex-start",gap:"8px"}}>
                <div style={{flex:1}}>
                  <div style={S.sentenceJp}>{currentCard.sentence}</div>
                  {showRomaji && (() => { const r = toRomaji(currentCard.sentence); return r && r !== currentCard.sentence ? <div style={{fontSize:"11px",color:"#555",fontStyle:"italic",fontFamily:"'Times New Roman',Times,serif",marginBottom:"4px"}}>{r}</div> : null; })()}
                  <div style={S.sentenceEn}>{currentCard.sentenceEn}</div>
                </div>
                <SpeakBtn text={currentCard.sentence} style={{marginTop:"2px"}} />
              </div>
            </div>
          )}
          <div style={S.actionRow}>
            <button style={S.actionBtn("#f87171")} onClick={()=>{setUnknown(s=>new Set(s).add(index));nextCard();}}>✗ AGAIN</button>
            <button style={S.actionBtn("#4ade80")} onClick={()=>{
              const key=`${currentCard.jp}_${direction}`;
              setPersistentKnown(s=>new Set(s).add(key));
              setKnown(s=>new Set(s).add(index));
              nextCard();
            }}>✓ GOT IT</button>
          </div>
          <div style={{fontFamily:"'Times New Roman',Times,serif",fontSize:"12px",color:"#555",display:"flex",gap:"16px",justifyContent:"center"}}>
            <span>✓ {known.size} known</span><span>✗ {unknown.size} to review</span>
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
    const cardTint = GROUP_TINTS[currentCard.group]||"#f0f0e8";
    return (
      <Frame>
        <div style={{padding:"12px 14px",paddingBottom: isMobile ? "80px" : "12px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"12px"}}>
            <button style={S.backBtn} onClick={()=>setMode("menu")}>← MENU</button>
            <div style={S.progressBar}><div style={S.progressFill(progress)}/></div>
            <span style={{fontFamily:"'Times New Roman',Times,serif",fontSize:"12px",color:"#333",whiteSpace:"nowrap"}}>{score.correct}/{score.total}</span>
          </div>
          <div style={{border:"1px solid #000",marginBottom:"12px"}}>
            <div style={{background:"#000",color:"#fff",fontFamily:"Helvetica,Arial,sans-serif",fontWeight:"700",fontSize:"11px",textTransform:"uppercase",letterSpacing:"2px",padding:"5px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span>{questionIsJp?"What does this mean?":"How do you write this?"}</span>
              <span style={{fontSize:"10px",color:"#aaa",fontWeight:"400"}}>{currentCard.group}</span>
            </div>
            <div style={{background:cardTint,padding:"20px",textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:"10px",flexWrap:"wrap"}}>
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
                <span style={{fontFamily:"Helvetica,Arial,sans-serif",fontWeight:"700",fontSize:"11px",color:"#555",marginRight:"8px"}}>{i+1}</span>
                {opt}
                {optionsAreJp && showRomaji && (() => { const r = toRomaji(opt); return r && r !== opt ? <div style={{fontSize:"11px",color:"#555",marginTop:"2px",fontStyle:"italic",fontFamily:"'Times New Roman',Times,serif"}}>{r}</div> : null; })()}
              </button>
            );
          })}
          {quizSelected !== null && <>
            <div style={S.sentenceBox}>
              <div style={{display:"flex",alignItems:"flex-start",gap:"8px"}}>
                <div style={{flex:1}}>
                  <div style={{...S.tagLabel,marginBottom:"6px"}}>Example sentence</div>
                  <div style={S.sentenceJp}>{currentCard.sentence}</div>
                  {showRomaji && (() => { const r = toRomaji(currentCard.sentence); return r && r !== currentCard.sentence ? <div style={{fontSize:"11px",color:"#555",fontStyle:"italic",fontFamily:"'Times New Roman',Times,serif",marginBottom:"4px"}}>{r}</div> : null; })()}
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

  if (mode === "grammar") {
    return <GrammarView onBack={()=>setMode("menu")} showRomaji={showRomaji}/>;
  }

  return null;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
