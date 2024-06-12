const express = require("express");

const currencyController = require("../../controllers/currencyController");

const router = express.Router();

router.get("/", currencyController.getAllCurrencies);

router.get("/:currencySlug", currencyController.getAndSaveCurrencyPrice);

router.get("/subscribe/:currencySlug", currencyController.subscribeToCurrencyUpdates);

module.exports = router;