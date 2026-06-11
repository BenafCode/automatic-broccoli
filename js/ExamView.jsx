// Test de niveau japonais (N5) — page d'auto-évaluation en français.
// Réponse active (saisie libre, trous, appariement) + QCM, correction
// tolérante et explication pédagogique à chaque question.
function ExamView({ onBack, onCards, onList, onGrammar }) {
  const isMobile = useWindowWidth() < 640;
  const [screen, setScreen] = useState("home");      // home | quiz | results
  const [deck, setDeck] = useState([]);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState([]);         // [{ q, correct }]
  const [submitted, setSubmitted] = useState(false);
  const [lastResult, setLastResult] = useState({ correct: false, near: false });
  const [mcqSelected, setMcqSelected] = useState(null);
  const [matchSel, setMatchSel] = useState({});
  const inputRefs = useRef({});

  const q = deck[index];
  const PASS = 80;

  function startDeck(mode, value) {
    const d = buildExamDeck(mode, value);
    if (!d.length) return;
    setDeck(d); setIndex(0); setResults([]);
    resetQuestionState();
    setScreen("quiz");
  }
  function resetQuestionState() {
    setSubmitted(false); setLastResult({ correct: false, near: false });
    setMcqSelected(null); setMatchSel({}); inputRefs.current = {};
  }

  function collectAnswer() {
    if (q.type === "mcq") return mcqSelected;
    if (q.type === "match") return matchSel;
    if (q.type === "situation") return inputRefs.current[0] ? inputRefs.current[0].value : "";
    const blanks = q.blanks || 1;
    return Array.from({ length: blanks }, (_, i) =>
      inputRefs.current[i] ? inputRefs.current[i].value : "");
  }

  function submit() {
    if (submitted) return;
    const answer = collectAnswer();
    if (q.type === "mcq" && answer === null) return;
    const res = gradeExam(q, answer);
    setLastResult(res);
    setSubmitted(true);
    setResults(r => [...r, { q, correct: res.correct }]);
  }

  function chooseMcq(i) {
    if (submitted) return;
    setMcqSelected(i);
    const res = gradeExam(q, i);
    setLastResult(res);
    setSubmitted(true);
    setResults(r => [...r, { q, correct: res.correct }]);
  }

  function next() {
    resetQuestionState();
    if (index + 1 >= deck.length) setScreen("results");
    else setIndex(i => i + 1);
  }

  function retryMissed() {
    const missed = results.filter(r => !r.correct).map(r => r.q);
    if (!missed.length) { setScreen("home"); return; }
    setDeck(shuffle(missed)); setIndex(0); setResults([]);
    resetQuestionState(); setScreen("quiz");
  }

  // -- styles ----------------------------------------------------------------
  const E = {
    wrap: { background: isMobile ? "#f5f0e8" : "#b8b0a4", minHeight:"100vh", padding: isMobile ? "0" : "8px 0", boxSizing:"border-box", paddingBottom: isMobile ? "80px" : "0" },
    card: { border: isMobile ? "none" : "8px solid #1a1a18", maxWidth:"760px", margin:"0 auto", background:"#fff", fontFamily:"'Times New Roman',Times,serif", color:"#1a1a18", boxSizing:"border-box" },
    head: { background:"#1a1a18", color:"#f5f0e8", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px" },
    backBtn: { background:"#f5f0e8", border:"none", color:"#1a1a18", fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"12px", textTransform:"uppercase", cursor:"pointer", padding:"6px 12px" },
    banner: { fontFamily:"'Arial Black',Helvetica,sans-serif", fontWeight:"900", fontSize:"clamp(14px,3vw,22px)", textTransform:"uppercase", color:"#f5f0e8", padding:"10px 16px", borderBottom:"1px solid #1a1a18", background:"#8b1a1a" },
    sectionHeader: { fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"10px", textTransform:"uppercase", letterSpacing:"1px", padding:"6px 14px", borderBottom:"1px solid #1a1a18", borderTop:"1px solid #1a1a18", background:"#ede8da", color:"#1a1a18" },
    startBtn: { display:"block", width:"100%", padding:"12px", border:"1px solid #1a1a18", background:"#1a1a18", color:"#f5f0e8", fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"14px", textTransform:"uppercase", cursor:"pointer", marginBottom:"8px", textAlign:"left" },
    badge: d => ({ display:"inline-block", fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"10px", letterSpacing:"1px", padding:"2px 8px", border:"1px solid #1a1a18", background: d==="N1" ? "#d8e8d0" : d==="N2" ? "#ece0c8" : "#ddd4e8", color:"#1a1a18" }),
    prompt: { fontFamily:"'Times New Roman',Times,serif", fontSize:"clamp(16px,4.5vw,20px)", color:"#1a1a18", lineHeight:1.45, padding:"14px 16px" },
    input: { border:"2px solid #1a1a18", padding:"10px 12px", fontFamily:"'Times New Roman',Times,serif", fontSize:"18px", outline:"none", background:"#fff", color:"#1a1a18", WebkitTextFillColor:"#1a1a18", boxSizing:"border-box" },
    mcq: s => ({ display:"block", width:"100%", padding:"13px 16px", marginBottom:"8px", minHeight:"50px", border:s==="correct"?"2px solid #3d6b3d":s==="wrong"?"2px solid #7a3030":"1px solid #c8c0b4", background:s==="correct"?"#d8e8d0":s==="wrong"?"#e8d4d4":"#fff", color:"#1a1a18", fontFamily:"'Times New Roman',Times,serif", fontSize:"16px", cursor:submitted?"default":"pointer", textAlign:"left" }),
    check: { background:"#1a1a18", color:"#f5f0e8", border:"1px solid #1a1a18", fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"13px", textTransform:"uppercase", cursor:"pointer", padding:"10px 18px" },
    explain: { background:"#f5f0e8", border:"1px solid #c8a84b", padding:"10px 12px", marginTop:"12px", fontFamily:"'Times New Roman',Times,serif", fontSize:"13px", lineHeight:1.5, color:"#1a1a18" },
    label: { fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"10px", textTransform:"uppercase", letterSpacing:"1px", color:"#6a6050", marginBottom:"4px" },
    progressBar: { height:"4px", background:"#ddd6cc", border:"1px solid #1a1a18", overflow:"hidden", flex:1 },
    kbHint: { fontFamily:"'Times New Roman',Times,serif", fontSize:"11px", color:"#888078", fontStyle:"italic", textAlign:"center", marginTop:"10px" },
    select: { border:"2px solid #1a1a18", padding:"8px 10px", fontFamily:"'Times New Roman',Times,serif", fontSize:"16px", background:"#fff", color:"#1a1a18", boxSizing:"border-box", minWidth:"140px" },
  };

  // Réponse canonique affichée dans le feedback.
  function correctAnswerText(q) {
    if (q.type === "mcq") return q.options[q.correctIndex];
    if (q.type === "match") return q.pairs.map(p => `${p.l} → ${p.r}`).join("  ·  ");
    if (q.type === "situation") return q.model;
    const blanks = q.blanks || 1;
    return Array.from({ length: blanks }, (_, i) => (q.accepted[i] || [""])[0]).join("   /   ");
  }

  // -- footer (cohérent avec les autres pages) -------------------------------
  function Footer() {
    return (
      <div style={isMobile
        ? { position:"fixed", bottom:0, left:0, right:0, background:"#f5f0e8", borderTop:"1px solid #1a1a18", padding:"10px 16px", zIndex:10 }
        : { borderTop:"1px solid #1a1a18", background:"#f5f0e8", padding:"10px 16px" }}>
        <div style={{display:"flex", justifyContent:"space-around", borderBottom:"1px solid #c8c0b4", paddingBottom:"8px", marginBottom:"6px"}}>
          {[["HOME", onBack], ["CARDS", onCards], ["LIST", onList], ["文法", onGrammar], ["試験", null]].map(([label, fn]) => (
            <button key={label} onClick={fn || undefined} style={{background:"none", border:"none", cursor:fn?"pointer":"default", textAlign:"center", fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"11px", textTransform:"uppercase", color:fn?"#1e3050":"#1a1a18", padding:"4px 8px", textDecoration:!fn?"underline":"none"}}>
              {label}
            </button>
          ))}
        </div>
        <div style={{fontFamily:"'Times New Roman',Times,serif", fontSize:"11px", color:"#888078", textAlign:"center", fontStyle:"italic"}}>
          This site is best viewed with browser versions 3.0 and higher.
        </div>
      </div>
    );
  }

  function Shell({ title, children }) {
    return (
      <div style={E.wrap}>
        <div style={E.card}>
          <div style={E.head}>
            <div>
              <div style={{fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"16px", textTransform:"uppercase", color:"#f5f0e8", letterSpacing:"1px"}}>日本語 · Test N5</div>
              <div style={{fontFamily:"Helvetica,Arial,sans-serif", fontSize:"11px", color:"#a09888", textTransform:"uppercase", letterSpacing:"2px"}}>試験 · Évaluation</div>
            </div>
            <button style={E.backBtn} onClick={screen === "home" ? onBack : () => setScreen("home")}>← {screen === "home" ? "MENU" : "TEST"}</button>
          </div>
          <div style={{paddingBottom: isMobile ? "80px" : "0"}}>{children}</div>
          <Footer/>
        </div>
      </div>
    );
  }

  // ===== ÉCRAN D'ACCUEIL =====================================================
  if (screen === "home") {
    return (
      <Shell>
        <div style={E.banner}>Test de niveau · N5</div>
        <div style={{padding:"12px 16px", fontFamily:"'Times New Roman',Times,serif", fontSize:"14px", lineHeight:1.5, color:"#4a4038", borderBottom:"1px solid #c8c0b4"}}>
          {EXAM_QUESTIONS.length} questions sur les {EXAM_SECTIONS.length} thèmes de l'examen. Questions en français,
          réponses en japonais (rōmaji accepté, kana en bonus). Correction immédiate et explication à chaque question.
        </div>

        <div style={E.sectionHeader}>Mode</div>
        <div style={{padding:"12px 16px", borderBottom:"1px solid #c8c0b4"}}>
          <button style={E.startBtn} onClick={() => startDeck("complete")}>→ Examen complet · {EXAM_QUESTIONS.length} questions mélangées</button>
          <button style={{...E.startBtn, background:"#8b1a1a"}} onClick={() => startDeck("weak")}>→ Mes points faibles · particules, adj. i/na, invitations, katakana</button>
        </div>

        <div style={E.sectionHeader}>Par niveau</div>
        <div style={{display:"flex", gap:"8px", padding:"12px 16px", borderBottom:"1px solid #c8c0b4"}}>
          {[["N1", "Reconnaissance"], ["N2", "Production guidée"], ["N3", "Production libre"]].map(([lvl, desc]) => {
            const n = EXAM_QUESTIONS.filter(x => x.difficulty === lvl).length;
            return (
              <button key={lvl} onClick={() => startDeck("level", lvl)} style={{flex:1, border:"1px solid #1a1a18", background:"#f5f0e8", color:"#1a1a18", cursor:"pointer", padding:"10px 6px", textAlign:"center"}}>
                <div style={{fontFamily:"'Arial Black',Helvetica,sans-serif", fontWeight:"900", fontSize:"18px"}}>{lvl}</div>
                <div style={{fontFamily:"Helvetica,Arial,sans-serif", fontSize:"9px", textTransform:"uppercase", letterSpacing:"1px", color:"#6a6050", marginTop:"2px"}}>{desc}</div>
                <div style={{fontFamily:"'Times New Roman',Times,serif", fontSize:"11px", color:"#888078", marginTop:"2px"}}>{n} q.</div>
              </button>
            );
          })}
        </div>

        <div style={E.sectionHeader}>Par section</div>
        <div>
          {EXAM_SECTIONS.map((s, i) => {
            const n = EXAM_QUESTIONS.filter(x => x.sectionId === s.id).length;
            return (
              <button key={s.id} onClick={() => startDeck("section", s.id)} style={{display:"flex", width:"100%", justifyContent:"space-between", alignItems:"center", border:"none", borderBottom:"1px solid #c8c0b4", background: i % 2 ? "#faf7f0" : "#fff", color:"#1a1a18", cursor:"pointer", padding:"10px 16px", textAlign:"left"}}>
                <span style={{fontFamily:"'Times New Roman',Times,serif", fontSize:"15px"}}>
                  <span style={{fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", color:"#6a6050", fontSize:"12px", marginRight:"8px"}}>{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </span>
                <span style={{fontFamily:"'Times New Roman',Times,serif", fontSize:"12px", color:"#888078", flexShrink:0, marginLeft:"10px"}}>{n} q. →</span>
              </button>
            );
          })}
        </div>
      </Shell>
    );
  }

  // ===== ÉCRAN RÉSULTATS =====================================================
  if (screen === "results") {
    const total = results.length;
    const correct = results.filter(r => r.correct).length;
    const pct = total ? Math.round((correct / total) * 100) : 0;
    const passed = pct >= PASS;
    const missed = results.filter(r => !r.correct);
    // Agrégat par section.
    const bySection = {};
    results.forEach(r => {
      const id = r.q.sectionId;
      if (!bySection[id]) bySection[id] = { correct: 0, total: 0 };
      bySection[id].total++; if (r.correct) bySection[id].correct++;
    });
    return (
      <Shell>
        <div style={{background: passed ? "#2c4f2c" : "#8b1a1a", color:"#f5f0e8", padding:"16px", textAlign:"center", borderBottom:"1px solid #1a1a18"}}>
          <div style={{fontFamily:"'Arial Black',Helvetica,sans-serif", fontWeight:"900", fontSize:"48px", lineHeight:1}}>{pct}%</div>
          <div style={{fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"13px", textTransform:"uppercase", letterSpacing:"1px", marginTop:"6px"}}>{correct} / {total} correct · seuil {PASS}%</div>
          <div style={{fontFamily:"'Times New Roman',Times,serif", fontSize:"14px", marginTop:"4px", color: passed ? "#cfe0cf" : "#e0c0c0"}}>{passed ? "合格 — Réussi !" : "Continuez à réviser — presque !"}</div>
        </div>

        <div style={E.sectionHeader}>Score par section</div>
        <div style={{borderBottom:"1px solid #c8c0b4"}}>
          {Object.entries(bySection).map(([id, s]) => {
            const sp = Math.round((s.correct / s.total) * 100);
            return (
              <div key={id} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 16px", borderBottom:"1px solid #ece6da", fontFamily:"'Times New Roman',Times,serif", fontSize:"13px"}}>
                <span>{EXAM_SECTION_TITLE[id] || id}</span>
                <span style={{flexShrink:0, marginLeft:"10px", fontWeight:"700", color: sp >= PASS ? "#2c5020" : "#7a3030"}}>{s.correct}/{s.total}</span>
              </div>
            );
          })}
        </div>

        {missed.length > 0 && (
          <>
            <div style={{...E.sectionHeader, background:"#e8d4d4"}}>À revoir ({missed.length})</div>
            <div>
              {missed.map((r, i) => (
                <div key={i} style={{padding:"10px 16px", borderBottom:"1px solid #c8c0b4", background: i % 2 ? "#faf7f0" : "#fff"}}>
                  <div style={{fontFamily:"'Times New Roman',Times,serif", fontSize:"13px", color:"#1a1a18", marginBottom:"4px"}}>{r.q.prompt}</div>
                  <div style={{fontFamily:"'Times New Roman',Times,serif", fontSize:"13px", color:"#2c5020"}}>✓ {correctAnswerText(r.q)}</div>
                  <div style={{fontFamily:"'Times New Roman',Times,serif", fontSize:"12px", color:"#6a6050", marginTop:"3px", fontStyle:"italic"}}>{r.q.explanation}</div>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{display:"flex", gap:"8px", padding:"14px 16px"}}>
          {missed.length > 0 && <button style={{...E.startBtn, marginBottom:0, flex:1, textAlign:"center"}} onClick={retryMissed}>Refaire les ratées</button>}
          <button style={{flex:1, padding:"12px", border:"1px solid #1a1a18", background:"#f5f0e8", color:"#1a1a18", fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"14px", textTransform:"uppercase", cursor:"pointer"}} onClick={() => setScreen("home")}>← Modes</button>
        </div>
      </Shell>
    );
  }

  // ===== ÉCRAN QUESTION ======================================================
  if (!q) return <Shell><div style={{padding:"20px"}}>—</div></Shell>;
  const answered = results.length;
  const score = results.filter(r => r.correct).length;
  const progress = (index / deck.length) * 100;

  function renderInputs() {
    if (q.type === "mcq") {
      return q.options.map((opt, i) => {
        const state = !submitted ? null : i === q.correctIndex ? "correct" : i === mcqSelected ? "wrong" : null;
        return (
          <button key={i} style={E.mcq(state)} onClick={() => chooseMcq(i)}>
            <span style={{fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"11px", color:"#888078", marginRight:"8px"}}>{i + 1}</span>{opt}
          </button>
        );
      });
    }
    if (q.type === "match") {
      const opts = shuffle(q.pairs.map(p => p.r));
      return (
        <div>
          {q.pairs.map((p, i) => {
            const ok = submitted && examNormalize(matchSel[i]) === examNormalize(p.r);
            return (
              <div key={i} style={{display:"flex", alignItems:"center", gap:"10px", marginBottom:"8px"}}>
                <span style={{flex:1, fontFamily:"'Times New Roman',Times,serif", fontSize:"16px"}}>{p.l}</span>
                <select style={{...E.select, borderColor: submitted ? (ok ? "#3d6b3d" : "#7a3030") : "#1a1a18", background: submitted ? (ok ? "#d8e8d0" : "#e8d4d4") : "#fff"}}
                  disabled={submitted}
                  value={matchSel[i] || ""}
                  onChange={e => setMatchSel(m => ({ ...m, [i]: e.target.value }))}>
                  <option value="">— choisir —</option>
                  {opts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            );
          })}
        </div>
      );
    }
    if (q.type === "situation") {
      return (
        <textarea key={index} ref={el => { inputRefs.current[0] = el; }} disabled={submitted}
          style={{...E.input, width:"100%", minHeight:"90px", fontSize:"16px", resize:"vertical"}}
          placeholder="Votre présentation en rōmaji…"
          autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" />
      );
    }
    // fill_blank / conjugate / transform / translate / katakana
    const blanks = q.blanks || 1;
    return (
      <div style={{display:"flex", flexWrap:"wrap", gap:"8px"}}>
        {Array.from({ length: blanks }, (_, i) => (
          <input key={`${index}-${i}`} ref={el => { inputRefs.current[i] = el; }} type="text"
            disabled={submitted}
            style={{...E.input, flex: blanks > 1 ? "0 1 160px" : "1 1 auto", minWidth:"140px"}}
            placeholder={blanks > 1 ? `blanc ${i + 1}` : "rōmaji ou kana…"}
            lang="ja" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
            autoFocus={i === 0}
            onKeyDown={e => { if (e.key === "Enter" && !e.nativeEvent.isComposing) { e.preventDefault(); submit(); } }} />
        ))}
      </div>
    );
  }

  const needsCheckBtn = q.type !== "mcq";

  return (
    <Shell>
      <div style={{display:"flex", alignItems:"center", gap:"10px", padding:"10px 16px", borderBottom:"1px solid #c8c0b4"}}>
        <span style={E.badge(q.difficulty)}>{q.difficulty}</span>
        <div style={E.progressBar}><div style={{height:"100%", width:`${progress}%`, background:"#1a1a18"}}/></div>
        <span style={{fontFamily:"'Times New Roman',Times,serif", fontSize:"12px", color:"#4a4038", whiteSpace:"nowrap"}}>{score}/{answered}</span>
      </div>
      <div style={{...E.sectionHeader, borderTop:"none"}}>{EXAM_SECTION_TITLE[q.sectionId]}</div>

      <div style={E.prompt}>{q.prompt}</div>

      <div style={{padding:"0 16px 12px"}}>
        {renderInputs()}

        {needsCheckBtn && !submitted && (
          <div style={{marginTop:"12px"}}>
            <button style={E.check} onClick={submit}>Valider</button>
          </div>
        )}

        {submitted && (
          <div style={{marginTop:"14px"}}>
            <div style={{border:`2px solid ${lastResult.correct ? "#3d6b3d" : "#7a3030"}`, background: lastResult.correct ? "#d8e8d0" : "#e8d4d4", padding:"12px 14px"}}>
              <div style={{fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"13px", textTransform:"uppercase", letterSpacing:"1px", color: lastResult.correct ? "#2c5020" : "#5c2020"}}>
                {lastResult.correct ? "✓ Correct !" : lastResult.near ? "✗ Presque — il manque un mot" : "✗ Faux"}
              </div>
              {!lastResult.correct && (
                <div style={{marginTop:"8px"}}>
                  <div style={E.label}>Bonne réponse</div>
                  <div style={{fontFamily:"'Times New Roman',Times,serif", fontSize:"18px", fontWeight:"700", color:"#1a1a18"}}>{correctAnswerText(q)}</div>
                  {q.kana && <div style={{fontFamily:"'Times New Roman',Times,serif", fontSize:"26px", color:"#1a1a18", marginTop:"4px", letterSpacing:"2px"}}>{q.kana}</div>}
                </div>
              )}
              {lastResult.correct && q.kana && (
                <div style={{fontFamily:"'Times New Roman',Times,serif", fontSize:"26px", color:"#1a1a18", marginTop:"6px", letterSpacing:"2px"}}>{q.kana}</div>
              )}
            </div>
            <div style={E.explain}>
              <span style={{fontFamily:"Helvetica,Arial,sans-serif", fontWeight:"700", fontSize:"10px", textTransform:"uppercase", letterSpacing:"1px", color:"#8b6a14", marginRight:"6px"}}>Règle</span>
              {q.explanation}
            </div>
            <button style={{...E.startBtn, marginTop:"12px", marginBottom:0, textAlign:"center"}} onClick={next}>
              {index + 1 >= deck.length ? "Voir les résultats →" : "Suivant →"}
            </button>
          </div>
        )}

        {!submitted && <div style={E.kbHint}>{needsCheckBtn ? "Entrée : valider" : "Cliquez une réponse"}</div>}
      </div>
    </Shell>
  );
}
