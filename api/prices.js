module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const url_name = req.query.url_name;
    if (!url_name) return res.status(400).json({ error: 'Missing url_name parameter' });

    try {
        const fetchHeaders = {
            'Language': 'en',
            'Accept': 'application/json',
            'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Platform': req.headers['platform'] || 'pc'
        };
        
        if (req.headers['accept-language']) fetchHeaders['Accept-Language'] = req.headers['accept-language'];
        if (req.headers['sec-ch-ua']) fetchHeaders['sec-ch-ua'] = req.headers['sec-ch-ua'];
        if (req.headers['sec-ch-ua-platform']) fetchHeaders['sec-ch-ua-platform'] = req.headers['sec-ch-ua-platform'];

        const response = await fetch(`https://api.warframe.market/v1/items/${url_name}/orders`, {
            headers: fetchHeaders
        });
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
