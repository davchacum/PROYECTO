import { destroy, get, post, put } from './helpers/ApiRequestsHelper'

function getAllOrders () {
  return get('/orders')
}

function removeOrderById (id) {
  return destroy(`orders/${id}`)
}

function getOrderDetails (id) {
  return get(`orders/${id}`)
}
function createOrder (data) {
  return post('/orders', data)
}
function updateOrder (id, data) {
  return put(`/orders/${id}`, data)
}

export { getAllOrders, removeOrderById, getOrderDetails, createOrder, updateOrder }
