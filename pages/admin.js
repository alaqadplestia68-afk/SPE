import { useEffect, useState } from 'react';
import Router from 'next/router';

export default function Admin() {
  const [user,setUser] = useState(null);
  const [stats,setStats] = useState(null);
  const [emails,setEmails] = useState('');
  const [genResult,setGenResult] = useState('');

  useEffect(()=>{
    const u = JSON.parse(localStorage.getItem('election_user') || 'null');
    if (!u) { Router.push('/'); return; }
    if (u.role !== 'admin') { Router.push('/'); return; }
    setUser(u);
    loadStats();
  },[]);

  async function loadStats() {
    const res = await fetch('/api/admin/stats?key=' + encodeURIComponent(process.env.NEXT_PUBLIC_ADMIN_KEY || ''));
    const d = await res.json();
    if (res.ok) setStats(d.stats);
  }

  async function generate() {
    if (!emails.trim()) return alert('Paste emails, one per line');
    const lines = emails.split(/\r?\n/).map(s=>s.trim()).filter(Boolean).map(email=>({email}));
    setGenResult('Generating...');
    const res = await fetch('/api/auth/send-credentials', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ voters: lines }) });
    const d = await res.json();
    if (!res.ok) setGenResult(d.error || 'Error');
    else setGenResult(JSON.stringify(d.results, null, 2));
    loadStats();
  }

  if (!user) return <div className="container"><div className="card">Loading admin...</div></div>;

  return (
    <div className="container">
      <div className="header">
        <h1>Admin Dashboard</h1>
        <div className="small">Manage election & view results</div>
      </div>

      <div className="card">
        <h3>Overview</h3>
        {stats ? (
          <div style={{display:'flex', gap:12}}>
            <div className="card" style={{flex:1}}>
              <div className="small">Total Voters</div>
              <div style={{fontSize:22,fontWeight:700}}>{stats.total_voters}</div>
            </div>
            <div className="card" style={{flex:1}}>
              <div className="small">Votes Cast</div>
              <div style={{fontSize:22,fontWeight:700}}>{stats.votes_cast}</div>
            </div>
            <div className="card" style={{flex:1}}>
              <div className="small">Participation</div>
              <div style={{fontSize:22,fontWeight:700}}>{stats.participation_percent}%</div>
            </div>
          </div>
        ) : <div className="small">Loading stats...</div>}
      </div>

      <div className="card">
        <h3>Results</h3>
        {stats && stats.results.map(pos => (
          <div key={pos.position} style={{marginBottom:12}}>
            <h4>{pos.position}</h4>
            {pos.candidates.map(c=>(
              <div key={c.id} style={{display:'flex',justify-content:'space-between',padding:'6px 0'}}>
                <div>{c.name}</div><div className="small">{c.votes} votes</div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Generate Voter Credentials</h3>
        <p className="small">Paste one email per line. Click Generate to create accounts. Passwords will be returned so you can send them, or set SMTP env vars to have the system email them.</p>
        <textarea className="input" rows={6} value={emails} onChange={e=>setEmails(e.target.value)} />
        <div style={{marginTop:8}}>
          <button className="btn" onClick={generate}>Generate</button>
        </div>
        <pre style={{marginTop:12, background:'#f6f8fb', padding:12, borderRadius:8, maxHeight:300, overflow:'auto'}}>{genResult}</pre>
      </div>
    </div>
  );
}
