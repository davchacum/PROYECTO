/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, View, FlatList, ImageBackground, Image, Pressable } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { getDetail } from '../../api/RestaurantEndpoints'
import ImageCard from '../../components/ImageCard'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import * as GlobalStyles from '../../styles/GlobalStyles'
import defaultProductImage from '../../../assets/product.jpeg'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { AuthorizationContext } from '../../context/AuthorizationContext'

export default function RestaurantDetailScreen ({ navigation, route }) {
  const [restaurant, setRestaurant] = useState({})
  const [counts, setCount] = useState(new Map()) // Estado para el valor del botón del medio
  const { loggedInUser } = useContext(AuthorizationContext)
  useEffect(() => {
    fetchRestaurantDetail()
  }, [route])

  const myValue = (id) => {
    if (!counts.has(id)) {
      const newCounts = new Map(counts)
      newCounts.set(id, 0)
      setCount(newCounts)
    }
    return counts.get(id)
  }

  const incrementCountById = (id) => {
    const newCounts = new Map(counts)
    newCounts.set(id, newCounts.get(id) + 1)
    setCount(newCounts)

    return newCounts.get(id)
  }
  const decrementCountById = (id) => {
    if (counts.get(id) > 0) {
      const newCounts = new Map(counts)
      newCounts.set(id, newCounts.get(id) - 1)
      setCount(newCounts)
      return newCounts.get(id)
    } else {
      return 0
    }
  }

  const renderHeader = () => {
    return (
      <View>
        <ImageBackground source={(restaurant?.heroImage) ? { uri: process.env.API_BASE_URL + '/' + restaurant.heroImage, cache: 'force-cache' } : undefined} style={styles.imageBackground}>
          <View style={styles.restaurantHeaderContainer}>
            <TextSemiBold textStyle={styles.textTitle}>{restaurant.name}</TextSemiBold>
            <Image style={styles.image} source={restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + restaurant.logo, cache: 'force-cache' } : undefined} />
            <TextRegular textStyle={styles.description}>{restaurant.description}</TextRegular>
            <TextRegular textStyle={styles.description}>{restaurant.restaurantCategory ? restaurant.restaurantCategory.name : ''}</TextRegular>
          </View>
        </ImageBackground>
        <Pressable
          onPress={ () => {
            if (!loggedInUser) {
              showMessage({
                message: 'If you want to place an order you must be logged in',
                type: 'danger',
                style: GlobalStyles.flashStyle,
                titleStyle: GlobalStyles.flashTextStyle
              })
              navigation.navigate('Profile')
            }
          }}
          style={({ pressed }) => [
            {
              backgroundColor: pressed
                ? GlobalStyles.brandGreenTap
                : GlobalStyles.brandGreen
            },
            styles.button
          ]}>
          <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
            <MaterialCommunityIcons name='plus-circle' color={'white'} size={20} />
            <TextRegular textStyle={styles.text}>
              Create product
            </TextRegular>
          </View>
        </Pressable>
        <Pressable
          onPress={ () => {
            if (!loggedInUser) {
              showMessage({
                message: 'If you want delete an order you must be logged in',
                type: 'danger',
                style: GlobalStyles.flashStyle,
                titleStyle: GlobalStyles.flashTextStyle
              })
              navigation.navigate('Profile')
            }
          }}
          style={({ pressed }) => [
            {
              backgroundColor: pressed
                ? GlobalStyles.brandPrimaryTap
                : GlobalStyles.brandPrimary
            },
            styles.button
          ]}>
          <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
            <MaterialCommunityIcons name='minus-circle' color={'white'} size={20} />
            <TextRegular textStyle={styles.text}>
              Delete product
            </TextRegular>
          </View>
        </Pressable>
      </View>

    )
  }

  const renderProduct = ({ item }) => {
    return (

      <ImageCard
        imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : defaultProductImage}
        title={item.name}
      >

        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        <TextSemiBold textStyle={styles.price}>{item.price.toFixed(2)}€</TextSemiBold>
        {!item.availability &&
          <TextRegular textStyle={styles.availability }>Not available</TextRegular>
        }
        {item.availability && (
          <View style={styles.actionButtonsContainer}>
            <Pressable
              onPress={() => decrementCountById(item.id)}
              style={({ pressed }) => [
                {
                  backgroundColor: pressed
                    ? '#808080'
                    : '#808080'
                },
                styles.actionButton
              ]}>
              <View style={[{ flex: 200, flexDirection: 'row', justifyContent: 'center' }]}>
                <MaterialCommunityIcons name='minus-circle' color={'white'} size={20}/>
              </View>
            </Pressable>
            <View style={styles.quantity}>{myValue(item.id)}</View>
            <Pressable
              onPress={() => incrementCountById(item.id)}
              style={({ pressed }) => [
                {
                  backgroundColor: pressed
                    ? '#808080'
                    : '#808080'
                },
                styles.actionButton
              ]}>
              <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
                <MaterialCommunityIcons name='plus-circle' color={'white'} size={20}/>
              </View>
            </Pressable>
          </View>
        )}

      </ImageCard>
    )
  }

  const renderEmptyProductsList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        This restaurant has no products yet.
      </TextRegular>
    )
  }

  const fetchRestaurantDetail = async () => {
    try {
      const fetchedRestaurant = await getDetail(route.params.id)
      setRestaurant(fetchedRestaurant)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving restaurant details (id ${route.params.id}). ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  return (
      <FlatList
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyProductsList}
          style={styles.container}
          data={restaurant.products}

          renderItem={renderProduct}
          keyExtractor={item => item.id.toString()}
        />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  row: {
    padding: 15,
    marginBottom: 5,
    backgroundColor: GlobalStyles.brandSecondary
  },
  restaurantHeaderContainer: {
    height: 250,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'column',
    alignItems: 'center'
  },
  imageBackground: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center'
  },
  image: {
    height: 100,
    width: 100,
    margin: 10
  },
  description: {
    color: 'white'
  },
  textTitle: {
    fontSize: 20,
    color: 'white'
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  },
  button: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    width: '80%'
  },
  text: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center',
    marginLeft: 5
  },
  availability: {
    textAlign: 'right',
    marginRight: 5,
    color: GlobalStyles.brandSecondary
  },
  actionButton: {
    borderRadius: 20,
    height: 40,
    marginTop: 12,
    margin: '0%',
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'column',
    width: '5%'
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    bottom: 5,
    position: 'absolute',
    width: '90%',
    alignSelf: 'center',
    marginTop: 30,
    justifyContent: 'flex-end'
  },
  quantity: {
    borderRadius: 0,
    height: 40,
    marginTop: 12,
    margin: '-1.4%',
    padding: 10,
    textAlign: 'center',
    flexDirection: 'column',
    width: '5%',
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#808080'

  },
  quantityContainer: {
    alignItems: 'center' // Alinea el contenido horizontalmente
  }
})
