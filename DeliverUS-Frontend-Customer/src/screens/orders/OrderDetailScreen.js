/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { StyleSheet, View, FlatList, ImageBackground, Image, Pressable, BackHandler } from 'react-native'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import OrdersScreen from './OrdersScreen'
import { showMessage } from 'react-native-flash-message'
// import { getAllOrders } from '../../api/OrderEnpoints'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { getOrderDetails } from '../../api/OrderEnpoints'

import { getDetail } from '../../api/RestaurantEndpoints'
import ImageCard from '../../components/ImageCard'

import defaultProductImage from '../../../assets/product.jpeg'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function OrderDetailScreen ({ navigation, route }) {
  // useEffect(() => {

  // }, [route])

  const [order, setOrder] = useState({})

  useEffect(() => {
    fetchOrderDetail()
  }, [route])

  const renderHeader = () => {
    return (
          <View style={styles.orderHeaderContainer}>
            <TextSemiBold textStyle={styles.bigText}> YOUR ORDER #{order.id}</TextSemiBold>
            <TextRegular textStyle={styles.smallText}>{order.price} €</TextRegular> {order.shippingCosts > 0 && <TextRegular textStyle={styles.smallText }>Shipping Costs = {order.shippingCosts} €</TextRegular>}
            <TextRegular textStyle={styles.smallText}>Address: {order.address}</TextRegular>
          </View>

    )
  }

  const renderEmptyOrderDetails = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
       This order is empty.
      </TextRegular>
    )
  }

  const renderProduct = ({ item }) => {
    return (
      <ImageCard
        imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : defaultProductImage}
        title={item.name}
      >
        {
          <TextRegular> {item.price} €</TextRegular>
        }
      </ImageCard>
    )
  }

  const fetchOrderDetail = async () => {
    try {
      const fetchedOrders = await getOrderDetails(route.params.id)
      setOrder(fetchedOrders)
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
    <View style={styles.container}>
        <FlatList
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyOrderDetails}
        data={order.products}
        renderItem={renderProduct}
        keyExtractor={item => item.id.toString()}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  FRHeader: { // TODO: remove this style and the related <View>. Only for clarification purposes
    justifyContent: 'center',
    alignItems: 'left',
    margin: 50
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 50
  },
  smallText: {
    fontSize: 15,
    color: 'black',
    textAlign: 'left'
  },
  bigText: {
    fontSize: 40,
    color: 'red',
    textAlign: 'center'
  },
  product: {
    marginLeft: 100,
    marginRight: 100,
    width: '75%'
  },
  orderHeaderContainer: {
    height: 25,
    padding: 100,
    backgroundColor: BackHandler,
    flexDirection: 'column',
    alignItems: 'center'
  },
  imageBackground: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center'
  }
})
