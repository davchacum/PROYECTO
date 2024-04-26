/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { StyleSheet, View, FlatList } from 'react-native'
import TextSemiBold from '../../components/TextSemibold'
import ImageCard from '../../components/ImageCard'
import TextRegular from '../../components/TextRegular'
import restaurantLogo from '../../../assets/restaurantLogo.jpeg'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { showMessage } from 'react-native-flash-message'
import { getAllRestaurants } from '../../api/RestaurantEndpoints'
import { getPopularProducts } from '../../api/ProductEndpoints'

export default function RestaurantsScreen ({ navigation, route }) {
  const [restaurants, setRestaurants] = useState([])
  const [popularProducts, setPopularProducts] = useState([])

  useEffect(() => {
    async function fetchRestaurants () {
      try {
        const fetchedRestaurants = await getAllRestaurants()
        setRestaurants(fetchedRestaurants)
      } catch (err) {
        showMessage({
          message: `There was an error while retrieving restaurants. ${err} `,
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }
    fetchRestaurants()
  }, [route])

  useEffect(() => {
    async function fetchPopularProducts () {
      try {
        const fetchedPopularProducts = await getPopularProducts()
        setPopularProducts(fetchedPopularProducts)
      } catch (err) {
        showMessage({
          message: `There was an error while retrieving popular products. ${err} `,
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }
    fetchPopularProducts()
  }, [route])

  const renderRestaurant = ({ item }) => {
    return (
      <ImageCard
        imageUri={item.logo ? { uri: process.env.API_BASE_URL + '/' + item.logo } : restaurantLogo}
        title={item.name}
        onPress={() => {
          navigation.navigate('RestaurantDetailScreen', { id: item.id })
        }}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        {item.averageServiceMinutes !== null &&
          <TextSemiBold>Avg. service time: <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary }}>{item.averageServiceMinutes} min.</TextSemiBold></TextSemiBold>
        }
        <TextSemiBold>Shipping: <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary }}>{item.shippingCosts.toFixed(2)}€</TextSemiBold></TextSemiBold>
      </ImageCard>
    )
  }

  const renderEmptyRestaurantsList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        There was an error retrieving restaurants
      </TextRegular>
    )
  }

  const renderPopularProducts = ({ item }) => {
    return (
      <View style={styles.product}>
        <ImageCard
          imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : restaurantLogo}
          title={item.name}
          onPress={() => {
            navigation.navigate('RestaurantDetailScreen', { id: item.restaurantId })
          }}
        >
          <TextSemiBold>Description: <TextRegular>{item.description}</TextRegular></TextSemiBold>
          <TextSemiBold>price: <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary }}>{item.price}€</TextSemiBold></TextSemiBold>
        </ImageCard>
      </View>
    )
  }

  const renderEmptyPopularProductsList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        There was an error retrieving popular products
      </TextRegular>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.popProducts}>
        <TextSemiBold style={styles.bigText}>Popular Products</TextSemiBold>
        <FlatList
        horizontal={true}
        data={popularProducts}
        renderItem={renderPopularProducts}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={renderEmptyPopularProductsList}
      />
      </View>
      <View style={styles.restaurants}>
        <TextSemiBold style={styles.bigText}>Restaurants</TextSemiBold>
        <FlatList
        data={restaurants}
        renderItem={renderRestaurant}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={renderEmptyRestaurantsList}
      />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 30
  },
  restaurants: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 30
  },
  popProducts: {
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: -20,
    marginBottom: -10
  },
  product: {
    marginLeft: 100,
    marginRight: 100,
    width: '75%'
  },
  button: {
    borderRadius: 8,
    height: 40,
    margin: 12,
    padding: 10,
    width: '100%'
  },
  bigText: {
    fontSize: 40,
    color: 'black',
    textAlign: 'center'
  },
  text: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center'
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  }
})
