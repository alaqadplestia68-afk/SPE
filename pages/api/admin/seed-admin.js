import bcrypt from 'bcrypt';
import { supabaseServer } from '../../../lib/supabaseServer';

export default async function handler(req,res){
  const seedKey = req.query.key;
  if (!seedKey || seedKey !== process.env.ADMIN_SEED_KEY) return res.status(401).json({ ok:false, error:'Unauthorized' });

  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@speuniben.org';
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'password123';

  const { data: existing } = await supabaseServer.from('users').select('*').eq('email', adminEmail).limit(1).maybeSingle();
  if (existing) return res.json({ ok:true, message:'Admin already exists', admin: { email: adminEmail } });

  const hash = await bcrypt.hash(adminPassword, 10);
  const { error } = await supabaseServer.from('users').insert([{ email: adminEmail, password_hash: hash, role: 'admin' }]);
  if (error) return res.status(500).json({ ok:false, error: error.message });

  res.json({ ok:true, message:'Admin seeded', admin: { email: adminEmail } });
}
