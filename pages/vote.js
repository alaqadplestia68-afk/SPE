import { useEffect, useState } from 'react';
import Router from 'next/router';

export default function Vote() {
  const [user, setUser] = useState(null);
  const [positionsArr, setPositionsArr] = useState([]);
  const [selections, setSelections] = useState({});
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState('');

  useEffect(()=>{
    const u = JSON.parse(localStorage.getItem('election_user') || 'null');
    if (!u) { Router.push('/'); return; }
    if (u.role === 'admin') { Router.push('/admin'); return; }
    setUser(u);

    fetch('/api/candidates').then(r=>r.json()).then(d=>{
      if (d.ok) {
        const groups = {};
        d.candidates.forEach(c=>{
          groups[c.position] = groups[c.position] || [];
          groups[c.position].push(c);
        });
        const arr = Object.entries(groups).map(([position,cands])=>({ position, cands }));
        setPositionsArr(arr);
      }
    });
  },[]);

  function choose(candidateId) {
    const pos = positionsArr[step].position;
    setSelections(prev => ({ ...prev, [pos]: candidateId }));
  }

  function next() {
    if (!selections[positionsArr[step].position]) { setStatus('Please choose a candidate'); return; }
    setStatus('');
    setStep(s => Math.min(s+1, positionsArr.length-1));
  }

  function prev() {
    setStatus('');
    setStep(s => Math.max(s-1, 0));
  }

  async function submit() {
    setStatus('Submitting votes...');
    const payload = { voter_id: user.id, selections: Object.values(selections) };
    const res = await fetch('/api/vote', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) setStatus(data.error || 'Vote failed');
    else setStatus('Thanks — your vote has been recorded');
  }

  if (!user) return <div className="container"><div className="card">Loading...</div></div>;

  if (positionsArr.length === 0) return <div className="container"><div className="card">No candidates configured yet.</div></div>;

  const current = positionsArr[step];

  return (
    <div className="container">
      <div className="header">
        <h1>Welcome, {user.email}</h1>
        <div className="small">Step {step+1} of {positionsArr.length} — {current.position}</div>
      </div>

      <div className="card">
        <h2>{current.position}</h2>
        <div className="grid">
          {current.cands.map(c=>(
            <label key={c.id} className="candidate">
              <input type="radio" name={current.position} checked={selections[current.position]===c.id} onChange={()=>choose(c.id)} />
              <div style={{marginLeft:10}}>
                <div style={{fontWeight:700}}>{c.name}</div>
                <div className="small">{current.position}</div>
              </div>
            </label>
          ))}
        </div>

        <div style={{marginTop:12, display:'flex', gap:8}}>
          <button className="btn" onClick={prev} disabled={step===0}>Previous</button>
          {step < positionsArr.length-1 ? (
            <button className="btn" onClick={next}>Next</button>
          ) : (
            <button className="btn" onClick={submit}>Submit Votes</button>
          )}
          <span className="small" style={{marginLeft:12}}>{status}</span>
        </div>
      </div>
    </div>
  );
}
