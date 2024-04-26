import { destroy, get } from './helpers/ApiRequestsHelper'

function getAllOrders () {
  return get('/orders')
}

function removeOrderById (id) {
  return destroy(`orders/${id}`)
}

function getOrderDetails (id) {
  return get(`orders/${id}`)
}

export { getAllOrders, removeOrderById, getOrderDetails }
