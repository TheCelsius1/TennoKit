module.exports = async function handler(req, res) {
    // Permitir CORS (muy importante para evitar bloqueos)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const fetchHeaders = { ...req.headers };
        delete fetchHeaders.host;
        delete fetchHeaders.connection;
        fetchHeaders['Language'] = 'en';
        fetchHeaders['Accept'] = 'application/json';

        const response = await fetch('https://api.warframe.market/v1/items', {
            headers: fetchHeaders
        });
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
