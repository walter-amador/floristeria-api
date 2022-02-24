const router = require('express').Router();
const passport = require('passport');

const ordersController = require('../../../controllers/orders.controller');

const { limitOffsetSchema, requiredIdSchema } = require('../../../schemas/orders.schema');
const validatorHandler = require('./../../../middlewares/validator.handler');

router.get('/byuser/:id/pending', 
    validatorHandler(requiredIdSchema, 'params'),
    validatorHandler(limitOffsetSchema, 'query'),
    ordersController.userPendingOrders
);

router.get('/byuser/:id/confirmed',
    validatorHandler(requiredIdSchema, 'params'),
    validatorHandler(limitOffsetSchema, 'query'),
    ordersController.userConfirmedOrders
);

router.get('/order-detail/:id',
    validatorHandler(requiredIdSchema, 'params'),
    ordersController.orderDetail
);

module.exports = router;