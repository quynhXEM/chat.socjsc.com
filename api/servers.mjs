/* eslint-disable matrix-org/require-copyright-header */
const fetch = require("node-fetch");

export default async function handler(req, res) {
    const APP_ID = process.env.REACT_APP_ID;
    const APP_TOKEN = process.env.REACT_APP_TOKEN;

    if (!APP_ID || !APP_TOKEN) {
        res.status(500).json({ error: "Missing REACT_APP_ID/REACT_APP_TOKEN in environment" });
        return;
    }

    try {
        const { limit = 100, fields = "domain,is_default", meta = "filter_count" } = req.query;

        const url = `https://soc.socjsc.com/items/connect_server?filter[app_id]=${encodeURIComponent(
            APP_ID,
        )}&filter[status]=published&limit=${encodeURIComponent(String(limit))}&fields=${encodeURIComponent(fields)}&meta=${encodeURIComponent(meta)}`;

        const upstream = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${APP_TOKEN}`,
            },
        });

        const contentType = upstream.headers.get("content-type") || "application/json";
        const text = await upstream.text();
        res.status(upstream.status).setHeader("Content-Type", contentType).send(text);
    } catch (e) {
        res.status(500).json({ error: "Proxy error" });
    }
}


