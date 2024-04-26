/* eslint-disable no-mixed-spaces-and-tabs */
import { check } from 'express-validator'
import { Product, Restaurant, Order } from '../../models/models.js'

// TODO: Include validation rules for create that should:
// 1. Check that restaurantId is present in the body and corresponds to an existing restaurant
// 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
// 3. Check that products are available
// 4. Check that all the products belong to the same restaurant

const checkRestaurantExists = async (value, { req }) => {
	try {
		const restaurant = await Restaurant.findByPk(req.body.restaurantId)
		if (!restaurant) {
			return Promise.reject(new Error('The restaurantId does not exist.'))
		} else { return Promise.resolve() }
	} catch (err) {
		return Promise.reject(new Error(err))
	}
}

const checkProductsAvailability = async (value, { req }) => {
	try {
		const products = req.body.products
		const productsids = products.map(product => product.productId)
		const allProducts = await Product.findAll(
			{
				where: {
					id: productsids,
					availability: true
				}
			})

		if (allProducts.length !== req.body.products.length) {
			return Promise.reject(new Error('At least one product is unavailable'))
		} else {
			return Promise.resolve()
		}
	} catch (error) {
		return Promise.reject(new Error(error))
	}
}

const checkProductsBelongToSameRestaurant = async (value, { req }) => {
	try {
	  const orderRestaurantId = parseInt(req.body.restaurantId)
	  const products = await Product.findAll({
			where: {
		  id: req.body.products.map(p => p.productId)
			},
			attributes: ['restaurantId']
	  })
	  if (products.some(p => p.restaurantId !== orderRestaurantId)) {
			return Promise.reject(new Error('Products do not belong to the same restaurant'))
	  } else {
			return Promise.resolve()
	  }
	} catch (err) {
	  return Promise.reject(new Error(err))
	}
}

const create = [
	check('restaurantId').exists().isInt().toInt(),
	check('restaurantId').custom(checkRestaurantExists),
	check('address').exists().isString(),
	check('products').exists().isArray({ min: 1 }).toArray(),
	check('products.*.quantity').isInt({ min: 1 }).toInt(),
	check('products.*.productId').exists().isInt().toInt(),
	check('products').custom(checkProductsAvailability),
	check('products').custom(checkProductsBelongToSameRestaurant)

]

// TODO: Include validation rules for update that should:
// 1. Check that restaurantId is NOT present in the body.
// 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
// 3. Check that products are available
// 4. Check that all the products belong to the same restaurant of the originally saved order that is being edited.
// 5. Check that the order is in the 'pending' state.

const checkProductsBelongToOriginalRestaurant = async (value, { req }) => {
	try {
	  const order = await Order.findByPk(req.params.orderId)
	  const products = req.body.products
	  const productsIds = products.map(product => product.productId)
	  const productsDb = await Product.findAll({
			where: {
		  id: productsIds
			},
			attributes: ['restaurantId']
	  })
	  if (productsDb.some(x => x.restaurantId !== order.restaurantId)) {
			return Promise.reject(new Error('Products do not belong to the same restaurant'))
	  } else {
			return Promise.resolve()
	  }
	} catch (error) {
	  return Promise.reject(new Error(error))
	}
}

const checkOrderIsPending = async (value, { req }) => {
	try {
	  const order = await Order.findByPk(req.params.orderId)
	  if (order.status === 'pending') { // compruebo que esté pendiente
			return Promise.resolve()
	  } else {
			return Promise.reject(new Error('Order is not in pending state'))
	  }
	} catch (error) {
	  return Promise.reject(new Error(error))
	}
}

const update = [
	check('restaurantId').not().exists(),
	check('address').exists().isString(),
	check('products').exists().isArray({ min: 1 }),
	check('products.*.quantity').exists().isInt({ min: 1 }).toInt(),
	check('products.*.productId').exists().isInt({ min: 1 }).toInt(),
	check('products').exists().custom(checkProductsAvailability),
	check('products').exists().custom(checkProductsBelongToOriginalRestaurant),
	check('orderId').exists().custom(checkOrderIsPending)
]

export { create, update }
