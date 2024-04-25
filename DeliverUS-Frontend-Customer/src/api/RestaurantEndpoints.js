import { get } from './helpers/ApiRequestsHelper'
function getAllRestaurants () {
  return get('restaurants')
}

function getAll () {
  return get('users/myrestaurants')
}

function getDetail (id) {
  return get(`restaurants/${id}`)
}

function getRestaurantCategories () {
  return get('restaurantCategories')
}

export { getAll, getDetail, getRestaurantCategories, getAllRestaurants }
