const axios = require('axios');
const WebSocket = require('ws');
const Currency = require('../models/currency')
const { HttpError, ctrlWrapper } = require("../helpers");

const {API_KEY} = process.env;

const getAndSaveCurrencyPrice = async (req, res) => {
    const {currencySlug} = req.params;
    const result = await Currency.findOne({
        where: {
            asset_id_base: currencySlug
        }
    });

    if(result) {
        res.status(200).json(result)
    } else {
        const response = await axios.get(`https://rest.coinapi.io/v1/exchangerate/${currencySlug}/USD`, {
            headers: {
                'X-CoinAPI-Key': API_KEY
            }
        });

        if(!response.data) {
            throw HttpError(404, "Not found");
        }

        const { time, asset_id_base, asset_id_quote, rate } = response.data;

        await Currency.create({
            time,
            asset_id_base,
            asset_id_quote,
            rate
        });

        res.status(200).json(response.data)
    }
}

const getAllCurrencies = async (req, res) => {
    const response = await axios.get('https://rest.coinapi.io/v1/assets', {
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

    const createdCurrencies = await Currency.bulkCreate(currenciesToCreate);

    res.status(200).json(createdCurrencies)
}

const watchCurrency = (req, res) => {
    const {currencySlug} = req.params;

    const coinApiWs = new WebSocket('wss://ws.coinapi.io/v1/');

    coinApiWs.on('open', () => {
        console.log('WebSocket соединение установлено.');

        const message = JSON.stringify({
            type: 'hello',
            apikey: API_KEY,
            heartbeat: false,
            subscribe_data_type: ['trade'],
            subscribe_filter_asset_id: [currencySlug]
        });

        coinApiWs.send(message);
    });

    coinApiWs.on('message', (data) => {
        console.log('Получено сообщение:', data);
    });

    coinApiWs.on('close', () => {
        console.log('WebSocket соединение закрыто.');
    });

    coinApiWs.on('error', (error) => {
        console.error('Произошла ошибка:', error);
    });
};

module.exports = {
    getAndSaveCurrencyPrice: ctrlWrapper(getAndSaveCurrencyPrice),
    getAllCurrencies: ctrlWrapper(getAllCurrencies),
    watchCurrency: ctrlWrapper(watchCurrency)
}

