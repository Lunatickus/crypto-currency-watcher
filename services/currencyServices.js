const axios = require('axios');
const WebSocket = require('ws');
const Currency = require('../models/currencyModel');
const { API_URL, WEBSOCKET_URL } = require('../constants/constants')
const { HttpError, ctrlWrapper } = require("../helpers");

const { API_KEY } = process.env;

const getAndSaveCurrencyPrice = async (currencySlug) => {
    const { data } = await axios.get(`${API_URL}exchangerate/${currencySlug}/USD`, {
        headers: {
            'X-CoinAPI-Key': API_KEY
        }
    });

    const result = await Currency.findOne({
        where: {
            asset_id_base: currencySlug
        }
    });

    if(!data && !result) {
        throw HttpError(404, "Not found");
    }

    if(!data) {
        return result;
    }

    const { time, asset_id_base, asset_id_quote, rate } = data;

    if(!result) {
        return await Currency.create({
            time,
            asset_id_base,
            asset_id_quote,
            rate
        });
    }

    if(result.time !== time || result.rate !== rate) {
        await Currency.update({
            time,
            rate
        }, {
            where: {
                asset_id_base: currencySlug
            }
        });

        return await Currency.findOne({
            where: {
                asset_id_base: currencySlug
            }
        });
    }

    return result;
}

const getAllCurrencies = async () => {
    const response = await axios.get(`${API_URL}assets`, {
        headers: {
            'X-CoinAPI-Key': API_KEY
        }
    });

    if(!response.data) {
        throw HttpError(404, "Not found");
    }

    const cryptoCurrencies = response.data.filter(asset => asset.type_is_crypto !== 0);

    const currenciesToCreate = cryptoCurrencies.map(cryptoCurrency => ({
        asset_id_base: cryptoCurrency.asset_id,
        asset_id_quote: "USD",
        rate: isNaN(parseFloat(cryptoCurrency.price_usd)) ? 0 : parseFloat(cryptoCurrency.price_usd),
        time: new Date()
    }));

    return await Currency.bulkCreate(currenciesToCreate);
}

const subscribeToCurrencyUpdates = (currencySlug) => {
    const ws = new WebSocket(WEBSOCKET_URL);

    ws.on('open', () => {
        console.log('Connected to WebSocket API');
        ws.send(JSON.stringify({
            type: "subscribe",
            apikey: API_KEY,
            heartbeat: false,
            subscribe_data_type: ["trade"],
            subscribe_filter_asset_id: [currencySlug]
        }));
    });

    ws.on('message', async (message) => {
        console.log(message.toString())
        const data = JSON.parse(message);
        if (data.type === 'trade') {
            const { time_exchange, asset_id_base, asset_id_quote, price } = data;
            const currency = await Currency.findOne({ where: { asset_id_base, asset_id_quote } });
            if (currency) {
                currency.rate = price;
                currency.time = new Date(time_exchange);
                await currency.save();
                console.log(`Updated ${asset_id_base}/${asset_id_quote} price: ${price}`);
            }
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
}

module.exports = { getAndSaveCurrencyPrice, getAllCurrencies, subscribeToCurrencyUpdates }