function GrammarView({ onBack, onCards, onList, showRomaji }) {
  const isMobile = useWindowWidth() < 640;
  const [section, setSection] = useState("basics");
  const [expandedId, setExpandedId] = useState(null);

  const topics = section === "basics" ? grammar.basics : grammar.adjectives;

  const Gs = {
    wrap: { background: isMobile ? "#f5f0e8" : "#b8b0a4", minHeight:"100vh", padding: isMobile ? "0" : "8px 0", boxSizing:"border-box", paddingBottom: isMobile ? "80px" : "0" },
    backBtn: { background:"#f5f0e8", border:"none", color:"#1a1a18", fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"12px", textTransform:"uppercase", cursor:"pointer", padding:"4px 12px" },
    tab: a => ({ flex:1, padding: isMobile ? "12px" : "8px 12px", minHeight:"44px", border:"none", borderRight:"1px solid #1a1a18", background:a?"#1a1a18":"#ede8da", color:a?"#f5f0e8":"#1e3050", fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"12px", cursor:"pointer", textTransform:"uppercase" }),
    topicCard: open => ({ borderBottom:"1px solid #c8c0b4", background:open?"#f5f0e8":"#fff", cursor:"pointer" }),
    topicHeader: { display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"10px 14px" },
    topicTitle: { fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"14px", textTransform:"uppercase", color:"#1a1a18" },
    topicSubtitle: { fontSize:"12px", color:"#6a6050", marginTop:"2px" },
    topicSummary: { fontFamily:"'Times New Roman',Times,serif", fontSize:"13px", color:"#4a4038", marginTop:"4px", lineHeight:1.4 },
    topicBody: { padding:"0 14px 14px" },
    tipBox: { background:"#f5f0e8", border:"1px solid #c8a84b", padding:"10px 12px", marginTop:"4px", marginBottom:"10px" },
    tipText: { fontFamily:"'Times New Roman',Times,serif", fontSize:"13px", color:"#1a1a18", lineHeight:1.5 },
    tableWrap: { overflowX:"auto", marginTop:"8px", marginBottom:"4px" },
    table: { width:"100%", borderCollapse:"collapse", fontSize:"13px", fontFamily:"'Times New Roman',Times,serif" },
    th: { padding:"6px 10px", textAlign:"left", fontSize:"10px", letterSpacing:"2px", textTransform:"uppercase", color:"#1a1a18", borderBottom:"1px solid #1a1a18", fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", background:"#ede8da" },
    tdBase: { padding:"7px 10px", borderBottom:"1px solid #c8c0b4", verticalAlign:"top", fontFamily:"'Times New Roman',Times,serif", fontSize:"13px", color:"#1a1a18" },
    tdJp: (c) => ({ padding:"7px 10px", borderBottom:"1px solid #c8c0b4", color: c||"#1a1a18", fontWeight:"600", verticalAlign:"top", fontFamily:"'Times New Roman',Times,serif", fontSize:"13px" }),
    specialBox: { background:"#f5f0e8", border:"1px solid #7a3030", padding:"12px 14px", marginTop:"8px" },
    specialTitle: { fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"12px", textTransform:"uppercase", color:"#7a3030", marginBottom:"8px" },
    // pattern card colors keyed on the original color tokens from grammar.js data
    patternCard: c => ({
      background: c==='#4ade80' ? "#d8e8d0"
                : c==='#f87171' ? "#e8d4d4"
                : c==='#fb923c' ? "#ece0c8"
                : c==='#c084fc' ? "#ddd4e8"
                : c==='#38bdf8' ? "#d4dce8"
                : c==='#818cf8' ? "#d8dae8"
                : c==='#f472b6' ? "#e8d4e0"
                : "#f0ece0",
      border: `2px solid ${
                c==='#4ade80' ? "#3d6b3d"
              : c==='#f87171' ? "#7a3030"
              : c==='#fb923c' ? "#7a5020"
              : c==='#c084fc' ? "#5a4070"
              : c==='#38bdf8' ? "#2c4a6b"
              : c==='#818cf8' ? "#303878"
              : c==='#f472b6' ? "#6b3058"
              : "#6b6050"}`,
      padding:"10px 12px",
      marginBottom:"10px",
    }),
    patternLabel: c => ({
      fontFamily:"Helvetica,Arial,sans-serif",
      fontWeight:"700",
      fontSize:"10px",
      letterSpacing:"2px",
      textTransform:"uppercase",
      color: c==='#4ade80' ? "#2c5020"
           : c==='#f87171' ? "#5c2020"
           : c==='#fb923c' ? "#5c3818"
           : c==='#c084fc' ? "#3e2860"
           : c==='#38bdf8' ? "#1c3458"
           : c==='#818cf8' ? "#202878"
           : c==='#f472b6' ? "#502040"
           : "#4a3828",
      marginBottom:"4px",
    }),
    patternFormula: { fontFamily:"'Courier New',monospace", fontSize:"14px", fontWeight:"700", color:"#1a1a18", marginBottom:"6px" },
    exampleJp: { fontFamily:"'Times New Roman',Times,serif", fontSize:"14px", color:"#1a1a18", lineHeight:1.5 },
    exampleEn: { fontFamily:"'Times New Roman',Times,serif", fontSize:"12px", color:"#6a6050", marginTop:"2px" },
    romajiSmall: { fontFamily:"'Times New Roman',Times,serif", fontSize:"11px", color:"#888078", fontStyle:"italic", marginBottom:"2px" },
  };

  function R({ text }) {
    if (!showRomaji) return null;
    if (typeof wanakana === 'undefined') return null;
    const r = wanakana.toRomaji(text);
    if (!r || r === text) return null;
    return <div style={Gs.romajiSmall}>{r}</div>;
  }

  function PatternBlock({ p }) {
    return (
      <div style={Gs.patternCard(p.color)}>
        <div style={Gs.patternLabel(p.color)}>{p.label}</div>
        <div style={Gs.patternFormula}>{p.formula}</div>
        <div style={{display:"flex", alignItems:"flex-start", gap:"8px"}}>
          <div style={{flex:1}}>
            <R text={p.example.jp}/>
            <div style={Gs.exampleJp}>{p.example.jp}</div>
            <div style={Gs.exampleEn}>{p.example.en}</div>
          </div>
          <SpeakBtn text={p.example.jp} style={{marginTop:"2px"}}/>
        </div>
      </div>
    );
  }

  function ConjTable({ examples, type }) {
    const isNounMod = type === "noun-mod";
    return (
      <div style={Gs.tableWrap}>
        <table style={Gs.table}>
          <thead>
            <tr>
              <th style={Gs.th}>Base</th>
              <th style={Gs.th}>Meaning</th>
              {isNounMod ? <th style={Gs.th}>+ noun</th> : <th style={Gs.th}>Affirmative</th>}
              {isNounMod ? <th style={Gs.th}>Type</th> : <th style={Gs.th}>Negative</th>}
            </tr>
          </thead>
          <tbody>
            {examples.map((ex, i) => (
              <tr key={i}>
                <td style={Gs.tdBase}>
                  <div style={{fontWeight:"700", color:"#1a1a18", fontSize:"15px"}}>{ex.base}</div>
                  <R text={ex.base}/>
                </td>
                <td style={{...Gs.tdBase, color:"#6a6050"}}>{ex.en}</td>
                {isNounMod ? (
                  <>
                    <td style={Gs.tdJp("#1a1a18")}>
                      {ex.combined}
                      <R text={ex.combined}/>
                      <div style={{fontSize:"11px", color:"#6a6050", marginTop:"2px"}}>{ex.en}</div>
                    </td>
                    <td style={{...Gs.tdBase}}>
                      <span style={{fontSize:"11px", padding:"2px 7px", background:ex.type==="い"?"#d8e8d0":"#ddd4e8", color:ex.type==="い"?"#2c5020":"#3e2860", fontWeight:"700", border:`1px solid ${ex.type==="い"?"#3d6b3d":"#5a4070"}`}}>{ex.type}</span>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={Gs.tdJp("#2c5020")}>
                      {ex.aff}
                      <R text={ex.aff}/>
                    </td>
                    <td style={Gs.tdJp("#7a2020")}>
                      {ex.neg}
                      <R text={ex.neg}/>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div style={Gs.wrap}>
      <div style={{border: isMobile ? "none" : "8px solid #1a1a18", maxWidth:"760px", margin:"0 auto", background:"#fff", fontFamily:"'Times New Roman',Times,serif", color:"#1a1a18", boxSizing:"border-box"}}>
        <div style={{background:"#1a1a18", color:"#f5f0e8", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px"}}>
          <div>
            <div style={{fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"16px", textTransform:"uppercase", color:"#f5f0e8", letterSpacing:"1px"}}>日本語 · Grammar Guide</div>
            <div style={{fontFamily:"Helvetica,Arial,sans-serif", fontSize:"11px", color:"#a09888", textTransform:"uppercase", letterSpacing:"2px"}}>文法 Reference</div>
          </div>
          <button style={Gs.backBtn} onClick={onBack}>← BACK</button>
        </div>
        <div style={{fontFamily:"'Arial Black',Helvetica,sans-serif", fontWeight:"900", fontSize:"clamp(14px,3vw,22px)", textTransform:"uppercase", color:"#1a1a18", padding:"10px 16px", borderBottom:"1px solid #1a1a18", background:"#4a5a8a", color:"#f5f0e8"}}>文法 Grammar Reference</div>
        <div style={{display:"flex", borderBottom:"1px solid #1a1a18"}}>
          <button style={Gs.tab(section==="basics")} onClick={()=>{setSection("basics");setExpandedId(null);}}>Basics</button>
          <button style={Gs.tab(section==="adjectives")} onClick={()=>{setSection("adjectives");setExpandedId(null);}}>Adjectives</button>
        </div>

      {topics.map(topic => {
        const open = expandedId === topic.id;
        return (
          <div key={topic.id} style={Gs.topicCard(open)} onClick={()=>setExpandedId(open ? null : topic.id)}>
            <div style={Gs.topicHeader}>
              <div style={{flex:1, minWidth:0}}>
                <div style={Gs.topicTitle}>{topic.title} <span style={{fontSize:"13px", color:"#6a6050", fontWeight:"400", fontFamily:"'Times New Roman',Times,serif", textTransform:"none"}}>— {topic.titleJp}</span></div>
                <div style={Gs.topicSummary}>{topic.summary}</div>
              </div>
              <div style={{fontSize:"14px", color:"#6a6050", marginLeft:"12px", flexShrink:0, fontFamily:"Helvetica,Arial,sans-serif"}}>{open?"▲":"▼"}</div>
            </div>

            {open && (
              <div style={Gs.topicBody} onClick={e=>e.stopPropagation()}>
                {topic.patterns && topic.patterns.map((p,i) => <PatternBlock key={i} p={p}/>)}

                {topic.tip && (
                  <div style={Gs.tipBox}>
                    <div style={{...Gs.patternLabel("#8e8a25"), marginBottom:"6px", color:"#8b6a14"}}>TIP</div>
                    <div style={Gs.tipText}>{topic.tip}</div>
                  </div>
                )}

                {topic.examples && (
                  <>
                    <div style={{fontSize:"11px", letterSpacing:"2px", textTransform:"uppercase", color:"#1a1a18", marginBottom:"8px", marginTop:"4px", fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700"}}>Examples</div>
                    <ConjTable examples={topic.examples} type={topic.id === "adj-noun" ? "noun-mod" : "conj"}/>
                  </>
                )}

                {topic.special && (
                  <div style={Gs.specialBox}>
                    <div style={Gs.specialTitle}>{topic.special.title}</div>
                    {topic.special.rows.map((r,i)=>(
                      <div key={i} style={{display:"flex", gap:"10px", alignItems:"flex-start", marginBottom:"6px"}}>
                        <div style={{fontSize:"10px", color:"#7a2020", letterSpacing:"1px", textTransform:"uppercase", width:"90px", flexShrink:0, paddingTop:"2px", fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700"}}>{r.label}</div>
                        <div>
                          <div style={{fontSize:"15px", fontWeight:"700", color:"#1a1a18", fontFamily:"'Times New Roman',Times,serif"}}>{r.jp}</div>
                          <R text={r.jp}/>
                          <div style={{fontSize:"12px", color:"#6a6050", fontFamily:"'Times New Roman',Times,serif"}}>{r.en}</div>
                        </div>
                        <SpeakBtn text={r.jp} style={{marginLeft:"auto", flexShrink:0}}/>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
        {!isMobile && (
          <div style={{borderTop:"1px solid #c8c0b4", padding:"10px 16px", textAlign:"center", background:"#f5f0e8"}}>
            <div style={{fontFamily:"'Times New Roman',Times,serif", fontSize:"11px", color:"#888078", fontStyle:"italic"}}>This site is best viewed with browser versions 3.0 and higher.</div>
          </div>
        )}
      </div>
      {isMobile && (
        <div style={{position:"fixed", bottom:0, left:0, right:0, background:"#f5f0e8", borderTop:"1px solid #1a1a18", padding:"10px 16px", zIndex:10}}>
          <div style={{display:"flex", justifyContent:"space-around", borderBottom:"1px solid #c8c0b4", paddingBottom:"8px", marginBottom:"6px"}}>
            {[["HOME",onBack],["CARDS",onCards],["LIST",onList],["文法",null]].map(([label,fn])=>(
              <button key={label} onClick={fn||undefined} style={{background:"none", border:"none", cursor:fn?"pointer":"default", textAlign:"center", fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"11px", textTransform:"uppercase", color:fn?"#1e3050":"#1a1a18", padding:"4px 8px", textDecoration:!fn?"underline":"none"}}>
                {label}
              </button>
            ))}
          </div>
          <div style={{fontFamily:"'Times New Roman',Times,serif", fontSize:"11px", color:"#888078", textAlign:"center", fontStyle:"italic"}}>
            This site is best viewed with browser versions 3.0 and higher.
          </div>
        </div>
      )}
    </div>
  );
}
