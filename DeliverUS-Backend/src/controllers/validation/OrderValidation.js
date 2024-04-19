import { check } from 'express-validator'
import { Restaurant } from '../../models/models.js'
// TODO: Include validation rules for create that should:
// 1. Check that restaurantId is present in the body and corresponds to an existing restaurant
// 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
// 3. Check that products are available
// 4. Check that all the products belong to the same restaurant

const checkRestaurantExists = async (value, { req }) => {
	try {
		const restaurant = await Restaurant.findByPk(req.body.restaurantId)
		if (restaurant == null) {
			return Promise.reject(new Error('The restaurantId does not exist.'))
		} else { return Promise.resolve() }
	} catch (err) {
		return Promise.reject(new Error(err))
	}
}

const checkProducts = async (value) => {
	try {
		const productsValid = value.every(product => {
			return product.exists('productId') && product.productId > 0 &&
                   product.orderProduct.exists('quantity') && product.orderProduct.quantity > 0
		})
		if (!productsValid) {
			return Promise.reject(new Error('Each product must have a valid productId and quantity'))
		}
		return Promise.resolve()
	} catch (error) {
		return Promise.reject(new Error(error))
	}
}

const checkProductsAvailability = async (value, { req }) => {
	try {
		const products = req.body.products
		for (const product of products) {
			if (!product.availability) {
				return Promise.reject(new Error('At least one product is unavailable'))
			}
		}
		return Promise.resolve()
	} catch (error) {
		return Promise.reject(new Error(error))
	}
}

const checkProductsBelongToSameRestaurant = async (value) => {
	try {
		const restId = value.restaurantId
		const allProductsBelongToSameRestaurant = value.every(product => product.restaurantId === restId)

		if (!allProductsBelongToSameRestaurant) {
			return Promise.reject(new Error('All products must belong to the same restaurant'))
		}
		return Promise.resolve()
	} catch (error) {
		return Promise.reject(new Error(error))
	}
}

const create = [
	check('restaurantId').exists().isInt({ min: 1 }).toInt().custom(checkRestaurantExists),
	check('products.*.quantity').isArray({ min: 1 }).custom(checkProducts),
	check('products').custom(checkProductsAvailability),
	check('products').custom(checkProductsBelongToSameRestaurant),
	check('address').exists()
]

// TODO: Include validation rules for update that should:
// 1. Check that restaurantId is NOT present in the body.
// 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
// 3. Check that products are available
// 4. Check that all the products belong to the same restaurant of the originally saved order that is being edited.
// 5. Check that the order is in the 'pending' state.

const checkProductsBelongToRestaurant = async (value, { req }) => {
	try {
		const restaurantId = req.order.restaurantId
		const productsBelongToRestaurant = value.every(product => product.restaurantId === restaurantId)

		if (!productsBelongToRestaurant) {
			return Promise.reject(new Error('All products must belong to the restaurant that is being edited'))
		}
		return Promise.resolve()
	} catch (error) {
		return Promise.reject(new Error(error))
	}
}

const update = [
	check('restaurantId').not().exists(),
	check('products.*.quantity').isArray({ min: 1 }).custom(checkProducts),
	check('products').custom(checkProductsAvailability),
	check('products').custom(checkProductsBelongToRestaurant),
	check('createdAt').exists(),
	check('startedAt').not().exists() // An order is pending if it has been created but has not been started.
]

export { create, update }
