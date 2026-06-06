function GrammarView({ onBack, showRomaji }) {
  const [section, setSection] = useState("basics"); // "basics" | "adjectives"
  const [expandedId, setExpandedId] = useState(null);

  const topics = section === "basics" ? grammar.basics : grammar.adjectives;

  const Gs = {
    wrap: { background:"#888", minHeight:"100vh", padding:"8px 0", boxSizing:"border-box" },
    backBtn: { background:"#fff", border:"none", color:"#000", fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"12px", textTransform:"uppercase", cursor:"pointer", padding:"4px 12px" },
    tab: a => ({ flex:1, padding:"8px 12px", border:"none", borderRight:"1px solid #000", background:a?"#000":"#f0f0f0", color:a?"#fff":"#0000ee", fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"12px", cursor:"pointer", textTransform:"uppercase", textDecoration:a?"none":"underline" }),
    topicCard: open => ({ borderBottom:"1px solid #000", background:open?"#f8f8f0":"#fff", cursor:"pointer" }),
    topicHeader: { display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"10px 14px" },
    topicTitle: { fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"14px", textTransform:"uppercase", color:"#000" },
    topicSubtitle: { fontSize:"12px", color:"#555", marginTop:"2px" },
    topicSummary: { fontFamily:"'Times New Roman',Times,serif", fontSize:"13px", color:"#333", marginTop:"4px", lineHeight:1.4 },
    topicBody: { padding:"0 14px 14px" },
    tipBox: { background:"#fff8dc", border:"1px solid #8e8a25", padding:"10px 12px", marginTop:"4px", marginBottom:"10px" },
    tipText: { fontFamily:"'Times New Roman',Times,serif", fontSize:"13px", color:"#000", lineHeight:1.5 },
    tableWrap: { overflowX:"auto", marginTop:"8px", marginBottom:"4px" },
    table: { width:"100%", borderCollapse:"collapse", fontSize:"13px", fontFamily:"'Times New Roman',Times,serif" },
    th: { padding:"6px 10px", textAlign:"left", fontSize:"10px", letterSpacing:"2px", textTransform:"uppercase", color:"#000", borderBottom:"1px solid #000", fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", background:"#f0f0f0" },
    tdBase: { padding:"7px 10px", borderBottom:"1px solid #ccc", verticalAlign:"top", fontFamily:"'Times New Roman',Times,serif", fontSize:"13px", color:"#000" },
    tdJp: (c) => ({ padding:"7px 10px", borderBottom:"1px solid #ccc", color: c||"#000", fontWeight:"600", verticalAlign:"top", fontFamily:"'Times New Roman',Times,serif", fontSize:"13px" }),
    specialBox: { background:"#fff0f0", border:"1px solid #990000", padding:"12px 14px", marginTop:"8px" },
    specialTitle: { fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"12px", textTransform:"uppercase", color:"#990000", marginBottom:"8px" },
    patternCard: c => ({ background:c==='#4ade80'?"#e8f5e8":c==='#f87171'?"#fdecea":c==='#fb923c'?"#fef3ea":c==='#c084fc'?"#f0eafd":c==='#38bdf8'?"#e8f4fd":"#f0f0e8", border:`2px solid ${c==='#4ade80'?"#006600":c==='#f87171'?"#990000":c==='#fb923c'?"#cc5500":c==='#c084fc'?"#6a26a4":c==='#38bdf8'?"#0066aa":"#555"}`, padding:"10px 12px", marginBottom:"10px" }),
    patternLabel: c => ({ fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"10px", letterSpacing:"2px", textTransform:"uppercase", color:c==='#4ade80'?"#006600":c==='#f87171'?"#990000":c==='#fb923c'?"#cc5500":c==='#c084fc'?"#6a26a4":c==='#38bdf8'?"#0066aa":c==='#8e8a25'?"#5a5a00":"#555", marginBottom:"4px" }),
    patternFormula: { fontFamily:"'Courier New',monospace", fontSize:"14px", fontWeight:"700", color:"#000", marginBottom:"6px" },
    exampleJp: { fontFamily:"'Times New Roman',Times,serif", fontSize:"14px", color:"#000", lineHeight:1.5 },
    exampleEn: { fontFamily:"'Times New Roman',Times,serif", fontSize:"12px", color:"#555", marginTop:"2px" },
    romajiSmall: { fontFamily:"'Times New Roman',Times,serif", fontSize:"11px", color:"#555", fontStyle:"italic", marginBottom:"2px" },
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
        <div style={{display:"flex",alignItems:"flex-start",gap:"8px"}}>
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
                  <div style={{fontWeight:"700",color:"#000",fontSize:"15px"}}>{ex.base}</div>
                  <R text={ex.base}/>
                </td>
                <td style={{...Gs.tdBase,color:"#555"}}>{ex.en}</td>
                {isNounMod ? (
                  <>
                    <td style={Gs.tdJp("#000")}>
                      {ex.combined}
                      <R text={ex.combined}/>
                      <div style={{fontSize:"11px",color:"#555",marginTop:"2px"}}>{ex.en}</div>
                    </td>
                    <td style={{...Gs.tdBase}}>
                      <span style={{fontSize:"11px",padding:"2px 7px",background:ex.type==="い"?"#e8f5e8":"#f0eafd",color:ex.type==="い"?"#006600":"#6a26a4",fontWeight:"700",border:`1px solid ${ex.type==="い"?"#006600":"#6a26a4"}`}}>{ex.type}</span>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={Gs.tdJp("#006600")}>
                      {ex.aff}
                      <R text={ex.aff}/>
                    </td>
                    <td style={Gs.tdJp("#990000")}>
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
      <div style={{border:"8px solid #000",maxWidth:"760px",margin:"0 auto",background:"#fff",fontFamily:"'Times New Roman',Times,serif",color:"#000",boxSizing:"border-box"}}>
        <div style={{background:"#000",color:"#fff",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px"}}>
          <div>
            <div style={{fontFamily:"Helvetica,Arial,sans-serif",fontWeight:"700",fontSize:"16px",textTransform:"uppercase",color:"#fff"}}>日本語 · Grammar Guide</div>
            <div style={{fontFamily:"Helvetica,Arial,sans-serif",fontSize:"11px",color:"#aaa",textTransform:"uppercase",letterSpacing:"1px"}}>文法 Reference</div>
          </div>
          <button style={Gs.backBtn} onClick={onBack}>← BACK</button>
        </div>
        <div style={{fontFamily:"'Arial Black',Helvetica,sans-serif",fontWeight:"900",fontSize:"clamp(14px,3vw,22px)",textTransform:"uppercase",color:"#000",padding:"10px 16px",borderBottom:"1px solid #000",background:"#8c9ae0"}}>文法 Grammar Reference</div>
        <div style={{display:"flex",borderBottom:"1px solid #000"}}>
          <button style={Gs.tab(section==="basics")} onClick={()=>{setSection("basics");setExpandedId(null);}}>Basics</button>
          <button style={Gs.tab(section==="adjectives")} onClick={()=>{setSection("adjectives");setExpandedId(null);}}>Adjectives</button>
        </div>

      {topics.map(topic => {
        const open = expandedId === topic.id;
        return (
          <div key={topic.id} style={Gs.topicCard(open)} onClick={()=>setExpandedId(open ? null : topic.id)}>
            <div style={Gs.topicHeader}>
              <div style={{flex:1,minWidth:0}}>
                <div style={Gs.topicTitle}>{topic.title} <span style={{fontSize:"13px",color:"#555",fontWeight:"400",fontFamily:"'Times New Roman',Times,serif",textTransform:"none"}}>— {topic.titleJp}</span></div>
                <div style={Gs.topicSummary}>{topic.summary}</div>
              </div>
              <div style={{fontSize:"14px",color:"#555",marginLeft:"12px",flexShrink:0,fontFamily:"Helvetica,Arial,sans-serif"}}>{open?"▲":"▼"}</div>
            </div>

            {open && (
              <div style={Gs.topicBody} onClick={e=>e.stopPropagation()}>
                {topic.patterns && topic.patterns.map((p,i) => <PatternBlock key={i} p={p}/>)}

                {topic.tip && (
                  <div style={Gs.tipBox}>
                    <div style={{...Gs.patternLabel("#8e8a25"),marginBottom:"6px"}}>TIP</div>
                    <div style={Gs.tipText}>{topic.tip}</div>
                  </div>
                )}

                {topic.examples && (
                  <>
                    <div style={{fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",color:"#000",marginBottom:"8px",marginTop:"4px",fontFamily:"Helvetica,Arial,sans-serif",fontWeight:"700"}}>Examples</div>
                    <ConjTable examples={topic.examples} type={topic.id === "adj-noun" ? "noun-mod" : "conj"}/>
                  </>
                )}

                {topic.special && (
                  <div style={Gs.specialBox}>
                    <div style={Gs.specialTitle}>{topic.special.title}</div>
                    {topic.special.rows.map((r,i)=>(
                      <div key={i} style={{display:"flex",gap:"10px",alignItems:"flex-start",marginBottom:"6px"}}>
                        <div style={{fontSize:"10px",color:"#990000",letterSpacing:"1px",textTransform:"uppercase",width:"90px",flexShrink:0,paddingTop:"2px",fontFamily:"Helvetica,Arial,sans-serif",fontWeight:"700"}}>{r.label}</div>
                        <div>
                          <div style={{fontSize:"15px",fontWeight:"700",color:"#000",fontFamily:"'Times New Roman',Times,serif"}}>{r.jp}</div>
                          <R text={r.jp}/>
                          <div style={{fontSize:"12px",color:"#555",fontFamily:"'Times New Roman',Times,serif"}}>{r.en}</div>
                        </div>
                        <SpeakBtn text={r.jp} style={{marginLeft:"auto",flexShrink:0}}/>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
        <div style={{borderTop:"1px solid #000",padding:"10px 16px",textAlign:"center",background:"#fff"}}>
          <div style={{fontFamily:"'Times New Roman',Times,serif",fontSize:"11px",color:"#555",fontStyle:"italic"}}>This site is best viewed with browser versions 3.0 and higher.</div>
        </div>
      </div>
    </div>
  );
}
