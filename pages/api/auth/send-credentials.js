import bcrypt from 'bcrypt';
import { supabaseServer } from '../../../lib/supabaseServer';
import { sendCredentialEmail } from '../../../lib/email';

function randomPassword(len=8){
  const s='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  return Array.from({length:len}, ()=> s[Math.floor(Math.random()*s.length)]).join('');
}

export default async function handler(req,res){
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { voters } = req.body;
  if (!Array.isArray(voters)) return res.status(400).json({ error: 'voters array required' });

  const results = [];
  for (const v of voters) {
    const email = (v.email || '').trim().toLowerCase();
    if (!email) { results.push({ email:null, ok:false, error:'missing email' }); continue; }
    const pwd = randomPassword(8);
    const hash = await bcrypt.hash(pwd, 10);

    const { error } = await supabaseServer.from('users').upsert({ email, password_hash: hash, full_name: v.full_name || null }, { onConflict: 'email' });
    if (error) { results.push({ email, ok:false, error: error.message }); continue; }

    try {
      if (process.env.EMAIL_SMTP_HOST && process.env.EMAIL_SMTP_USER) {
        await sendCredentialEmail(email, pwd);
        results.push({ email, ok:true, sent:true });
      } else {
        results.push({ email, ok:true, password: pwd });
      }
    } catch (e) {
      results.push({ email, ok:true, password: pwd, emailError: e.message });
    }
  }
  res.json({ ok:true, results });
}
