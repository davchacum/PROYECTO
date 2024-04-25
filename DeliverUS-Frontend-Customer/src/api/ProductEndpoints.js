import { get } from './helpers/ApiRequestsHelper'
function getPopularProducts () {
  return get('products/popular')
}

function getProductCategories () {
  return get('productCategories')
}

export { getProductCategories, getPopularProducts }
