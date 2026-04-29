export default async function handler(req, res) {
  // Allow requests from the app
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const token = req.query.token || process.env.OURA_TOKEN;

  if (!token) {
    return res.status(400).json({ error: 'No Oura token provided' });
  }

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const headers = { 'Authorization': `Bearer ${token}` };

  try {
    const [sleepRes, readyRes, actRes, dailyRes] = await Promise.all([
      fetch(`https://api.ouraring.com/v2/usercollection/sleep?start_date=${yesterday}&end_date=${today}`, { headers }),
      fetch(`https://api.ouraring.com/v2/usercollection/daily_readiness?start_date=${yesterday}&end_date=${today}`, { headers }),
      fetch(`https://api.ouraring.com/v2/usercollection/daily_activity?start_date=${yesterday}&end_date=${today}`, { headers }),
      fetch(`https://api.ouraring.com/v2/usercollection/daily_sleep?start_date=${yesterday}&end_date=${today}`, { headers }),
    ]);

    const [sleep, readiness, activity, daily_sleep] = await Promise.all([
      sleepRes.json(),
      readyRes.json(),
      actRes.json(),
      dailyRes.json(),
    ]);

    return res.status(200).json({ sleep, readiness, activity, daily_sleep });

  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch Oura data', details: error.message });
  }
}
