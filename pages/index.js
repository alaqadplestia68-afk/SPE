import { useState } from 'react';
import Router from 'next/router';

export default function Login() {
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [msg,setMsg] = useState('');

  async function login(e){
    e.preventDefault();
    setMsg('Signing in...');
    const res = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if (!res.ok) { setMsg(data.error || 'Login failed'); return; }
    localStorage.setItem('election_user', JSON.stringify(data.user));
    if (data.user.role === 'admin') Router.push('/admin');
    else Router.push('/vote');
  }

  return (
    <div className="container">
      <div className="header">
        <h1>SPE UNIBEN Election</h1>
        <div className="small">Secure • One-time vote • Fast</div>
      </div>

      <div className="card" style={{maxWidth:520, margin:'0 auto'}}>
        <h2>Login</h2>
        <p className="small">Enter your email and the password sent to your email.</p>
        <form onSubmit={login} style={{marginTop:12}}>
          <div style={{marginBottom:8}}>
            <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div style={{marginBottom:12}}>
            <input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          <div style={{display:'flex',gap:8}}>
            <button className="btn" type="submit">Sign in</button>
            <button type="button" className="btn" style={{background:'#374151'}} onClick={()=>{setEmail('admin@speuniben.org'); setPassword('password123')}}>Quick Admin</button>
          </div>
        </form>
        <p className="small" style={{marginTop:12}}>{msg}</p>
      </div>
    </div>
  );
}
