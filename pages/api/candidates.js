import { supabaseServer } from '../../lib/supabaseServer';

export default async function handler(req,res){
  const { data, error } = await supabaseServer.from('candidates').select('*').order('position');
  if (error) return res.status(500).json({ ok:false, error: error.message });
  res.json({ ok:true, candidates: data });
}
