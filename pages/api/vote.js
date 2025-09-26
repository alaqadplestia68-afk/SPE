import { supabaseServer } from '../../lib/supabaseServer';

export default async function handler(req,res){
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { voter_id, selections } = req.body || {};
  if (!voter_id || !Array.isArray(selections)) return res.status(400).json({ error: 'voter_id and selections required' });

  const { data: voter } = await supabaseServer.from('users').select('id,has_voted').eq('id', voter_id).limit(1).single();
  if (!voter) return res.status(400).json({ error: 'Invalid voter' });
  if (voter.has_voted) return res.status(400).json({ error: 'You have already voted' });

  for (const candidate_id of selections) {
    const { error } = await supabaseServer.from('votes').insert({ voter_id, candidate_id });
    if (error) return res.status(500).json({ error: error.message });
  }

  await supabaseServer.from('users').update({ has_voted: true }).eq('id', voter_id);
  res.json({ ok:true });
}
