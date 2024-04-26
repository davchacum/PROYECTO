import { destroy, get } from './helpers/ApiRequestsHelper'

function getAllOrders () {
  return get('/orders')
}

function removeOrderById (id) {
  return destroy(`orders/${id}`)
}

export { getAllOrders, removeOrderById }
