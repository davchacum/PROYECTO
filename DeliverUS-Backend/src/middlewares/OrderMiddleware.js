import { Order, Restaurant } from '../models/models.js'

const validateRestaurantId = async (req, res, next) => {
	try {
		const restaurantId = req.body.restaurantId

		if (!Number.isInteger(Number(restaurantId))) {
			return res.status(409).json({ error: 'El ID del restaurante debe ser un número entero' })
		} else {
			next()
		}
	} catch (err) {
		return res.status(500).send(err)
	}
}

// TODO: Implement the following function to check if the order belongs to current loggedIn customer (order.userId equals or not to req.user.id)
const checkOrderCustomer = async (req, res, next) => {
	try {
		const order = await Order.findByPk(req.params.orderId)
		if (!order) {
			return res.status(404).send('Not Found. This order does not exist')
		}
		if (order.userId === req.user.id) {
			return next()
		} else {
			return res.status(403).send('Not enough privileges. This entity does not belong to you')
		}
	} catch (err) {
		return res.status(500).send(err)
	}
}

// TODO: Implement the following function to check if the restaurant of the order exists
const checkRestaurantExists = async (req, res, next) => {
	try {
		const order = await Order.findByPk(req.params.orderId, {
			include: {
				model: Restaurant,
				as: 'restaurant'
			}
		})
		if (!order) {
			return res.status(404).send('Not Found. This order does not exist')
		} else if (req.order.restaurant.id === order.restaurant.id) {
			return next()
		} else {
			return res.status(409).send('Not found.The restaurant associated to this order does not exist')
		}
	} catch (err) {
		return res.status(500).send(err)
	}
}

const checkOrderOwnership = async (req, res, next) => {
	try {
		const order = await Order.findByPk(req.params.orderId, {
			include: {
				model: Restaurant,
				as: 'restaurant'
			}
		})
		if (req.user.id === order.restaurant.userId) {
			return next()
		} else {
			return res.status(403).send('Not enough privileges. This entity does not belong to you')
		}
	} catch (err) {
		return res.status(500).send(err)
	}
}

const checkOrderVisible = (req, res, next) => {
	if (req.user.userType === 'owner') {
		checkOrderOwnership(req, res, next)
	} else if (req.user.userType === 'customer') {
		checkOrderCustomer(req, res, next)
	}
}

const checkOrderIsPending = async (req, res, next) => {
	try {
		const order = await Order.findByPk(req.params.orderId)
		const isPending = !order.startedAt
		if (isPending) {
			return next()
		} else {
			return res.status(409).send('The order has already been started')
		}
	} catch (err) {
		return res.status(500).send(err.message)
	}
}

const checkOrderCanBeSent = async (req, res, next) => {
	try {
		const order = await Order.findByPk(req.params.orderId)
		const isShippable = order.startedAt && !order.sentAt
		if (isShippable) {
			return next()
		} else {
			return res.status(409).send('The order cannot be sent')
		}
	} catch (err) {
		return res.status(500).send(err.message)
	}
}
const checkOrderCanBeDelivered = async (req, res, next) => {
	try {
		const order = await Order.findByPk(req.params.orderId)
		const isDeliverable = order.startedAt && order.sentAt && !order.deliveredAt
		if (isDeliverable) {
			return next()
		} else {
			return res.status(409).send('The order cannot be delivered')
		}
	} catch (err) {
		return res.status(500).send(err.message)
	}
}

export { checkOrderOwnership, checkOrderCustomer, checkOrderVisible, checkOrderIsPending, checkOrderCanBeSent, checkOrderCanBeDelivered, checkRestaurantExists, validateRestaurantId }
