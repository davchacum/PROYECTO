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
    <ImageCard
      imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : restaurantLogo}
      title={item.name}
    >
    </ImageCard>)
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
      <FlatList
        horizontal={true}
        data={popularProducts}
        renderItem={renderPopularProducts}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={renderEmptyPopularProductsList}
      />
      <FlatList
        data={restaurants}
        renderItem={renderRestaurant}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={renderEmptyRestaurantsList}
      />
      {/* <Pressable Este es el boton de ir a los detalles de un restaurante
        onPress={() => {
          navigation.navigate('RestaurantDetailScreen', { id: 1 }) // TODO: Change this to the actual restaurant id as they are rendered as a FlatList
        }}
        style={({ pressed }) => [
          {
            backgroundColor: pressed
              ? GlobalStyles.brandPrimaryTap
              : GlobalStyles.brandPrimary
          },
          styles.button
        ]}
      >
        <TextRegular textStyle={styles.text}>Go to Restaurant Detail Screen</TextRegular>
      </Pressable> */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 50
  },
  button: {
    borderRadius: 8,
    height: 40,
    margin: 12,
    padding: 10,
    width: '100%'
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
