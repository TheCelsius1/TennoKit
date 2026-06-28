module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const url_name = req.query.url_name;
    if (!url_name) return res.status(400).json({ error: 'Missing url_name parameter' });

    try {
        const response = await fetch(`https://api.warframe.market/v2/orders/item/${url_name}`, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('API Orders Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
