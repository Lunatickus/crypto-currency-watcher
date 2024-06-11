const express = require("express");

const ctrl = require("../../controllers/currency");

const router = express.Router();

router.get("/", ctrl.getAllCurrencies);

router.get("/:currencySlug", ctrl.getAndSaveCurrencyPrice);

router.get("/watch/:currencySlug", ctrl.watchCurrency);

module.exports = router;