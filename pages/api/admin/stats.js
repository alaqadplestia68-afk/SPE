import { supabaseServer } from '../../../lib/supabaseServer';

export default async function handler(req,res){
  const key = req.query.key;
  if (!key || key !== process.env.ADMIN_ACCESS_KEY) return res.status(401).json({ ok:false, error: 'Unauthorized' });

  const { data: total } = await supabaseServer.from('users').select('id', { count:'exact' });
  const { data: votes } = await supabaseServer.from('votes').select('*', { count:'exact' });
  const { data: candidates } = await supabaseServer.from('candidates').select('*');

  const results = {};
  for (const c of candidates) {
    results[c.position] = results[c.position] || [];
    results[c.position].push({ id: c.id, name: c.name, votes: 0 });
  }

  const { data: votesAll } = await supabaseServer.from('votes').select('candidate_id');
  for (const v of votesAll) {
    for (const pos in results) {
      const item = results[pos].find(x=>x.id === v.candidate_id);
      if (item) item.votes++;
    }
  }

  const resultsArray = Object.entries(results).map(([position, arr])=>({ position, candidates: arr.sort((a,b)=>b.votes - a.votes) }));

  res.json({
    ok:true,
    stats: {
      total_voters: total.length,
      votes_cast: votes.length,
      participation_percent: total.length===0?0:Math.round((votes.length/total.length)*100),
      results: resultsArray
    }
  });
}
