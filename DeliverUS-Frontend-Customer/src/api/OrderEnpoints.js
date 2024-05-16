import { get, post, destroy, put } from './helpers/ApiRequestsHelper'

function getAllOrders () {
  return get('orders')
}

function getOrderDetails (id) {
  return get(`orders/${id}`)
}

function createOrder (data) {
  return post('orders', data)
}

function removeOrderById (id) {
  return destroy(`orders/${id}`)
}

function updateOrderById (id, data) {
  return put(`orders/${id}`, data)
}

export { getAllOrders, getOrderDetails, createOrder, removeOrderById, updateOrderById }
