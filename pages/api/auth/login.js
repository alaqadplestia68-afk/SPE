import bcrypt from 'bcrypt';
import { supabaseServer } from '../../../lib/supabaseServer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

  const { data, error } = await supabaseServer.from('users').select('id,email,full_name,password_hash,role,has_voted').eq('email', email).limit(1).single();
  if (error || !data) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, data.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  res.json({ ok:true, user: { id: data.id, email: data.email, full_name: data.full_name, role: data.role, has_voted: data.has_voted } });
}
