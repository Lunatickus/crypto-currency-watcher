const CurrencyService = require('../services/currencyServices')
const { ctrlWrapper } = require("../helpers");

const { API_KEY } = process.env;

const getAndSaveCurrencyPrice = async (req, res) => {
    const { currencySlug } = req.params;

    const result = await CurrencyService.getAndSaveCurrencyPrice(currencySlug);

    res.status(200).json(result)
}

const getAllCurrencies = async (req, res) => {
    const result = await CurrencyService.getAllCurrencies()

    res.status(200).json(result)
}

const subscribeToCurrencyUpdates = (req, res) => {
    try {
        const { currencySlug } = req.params;
        CurrencyService.subscribeToCurrencyUpdates(currencySlug);
        res.status(200).json({ message: `Subscribed to ${currencySlug} updates` });
    } catch (error) {
        console.error('Error subscribing to currency updates:', error);
        res.status(500).json({ error: 'Failed to subscribe to currency updates' });
    }
};

module.exports = {
    getAndSaveCurrencyPrice: ctrlWrapper(getAndSaveCurrencyPrice),
    getAllCurrencies: ctrlWrapper(getAllCurrencies),
    subscribeToCurrencyUpdates: ctrlWrapper(subscribeToCurrencyUpdates)
}

