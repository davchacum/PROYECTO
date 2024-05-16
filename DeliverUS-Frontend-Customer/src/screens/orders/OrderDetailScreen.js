/* eslint-disable react/prop-types */
import React, { useEffect, useState, useCallback } from 'react'
import { StyleSheet, View, FlatList, ImageBackground, Image, Pressable } from 'react-native'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import OrdersScreen from './OrdersScreen'
import { showMessage } from 'react-native-flash-message'
// import { getAllOrders } from '../../api/OrderEnpoints'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { getOrderDetails } from '../../api/OrderEnpoints'
import DeleteModal from '../../components/DeleteModal'

// import { getDetail } from '../../api/RestaurantEndpoints'
import ImageCard from '../../components/ImageCard'

import defaultProductImage from '../../../assets/product.jpeg'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function OrderDetailScreen ({ navigation, route }) {
  // useEffect(() => {

  // }, [route])

  const [order, setOrder] = useState({})

  const [orderToBeDeleted, setOrderToBeDeleted] = useState(null)

  useEffect(() => {
    fetchOrderDetail()
  }, [route])

  const renderHeader = () => {
    const getStatusStyle = (status) => {
      let textShadowColor
      switch (status) {
        case 'in process':
          textShadowColor = GlobalStyles.brandSecondary
          break
        case 'sent':
          textShadowColor = GlobalStyles.brandGreen
          break
        case 'delivered':
          textShadowColor = 'blue'
          break
        default:
          textShadowColor = GlobalStyles.brandPrimary
      }
      return {
        textShadowColor,
        textShadowOffset: { width: 1.5, height: -1.5 },
        textShadowRadius: 1
      }
    }

    return (
        <View>
        <ImageBackground source={(order.restaurant?.logo) ? { uri: process.env.API_BASE_URL + '/' + order.restaurant.logo, cache: 'force-cache' } : undefined}>
          <View style={styles.orderHeaderContainer}>
            <TextSemiBold textStyle={styles.restaurantNameStyle}>{(order.restaurant?.name) ? order.restaurant.name : 'Restaurante Name'}</TextSemiBold>
            <Image source={(order.restaurant?.logo) ? { uri: process.env.API_BASE_URL + '/' + order.restaurant.logo, cache: 'force-cache' } : undefined} />
            <TextSemiBold textStyle={styles.orderIdStyle}> YOUR ORDER #{order.id}</TextSemiBold>
            <TextRegular textStyle={styles.smallText}> Status: {''}
              <TextRegular style={[styles.smallText, getStatusStyle(order.status)]}>{order.status}</TextRegular>
            </TextRegular>
            <TextRegular textStyle={styles.smallText}>Price: {order.price} €</TextRegular> {order.shippingCosts > 0 && <TextRegular textStyle={styles.smallText }>Shipping Costs = {order.shippingCosts} €</TextRegular>}
            <TextRegular textStyle={styles.smallText}>Address: {order.address}</TextRegular>
            <TextRegular textStyle={styles.smallText}>Ordered at: {renderFechaHora(order.createdAt)}</TextRegular>
          </View>
        </ImageBackground>
        {order.status === 'pending' &&
        <View style={styles.actionButtonsContainer}>
          <Pressable
           onPress={() => navigation.navigate('EditOrderScreen', { orderId: order.id })}
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? GlobalStyles.brandBlueTap
                  : GlobalStyles.brandBlue
              },
              styles.actionButton
            ]}>
            <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
              <MaterialCommunityIcons name='pencil' color={'white'} size={20}/>
              <TextRegular textStyle={styles.smallText}>
                Edit
              </TextRegular>
            </View>
          </Pressable>
          <Pressable
            onPress={() => { setOrderToBeDeleted(order) }}
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? GlobalStyles.brandPrimaryTap
                  : GlobalStyles.brandPrimary
              },
              styles.actionButton
            ]}>
            <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
              <MaterialCommunityIcons name='delete' color={'white'} size={20}/>
              <TextRegular textStyle={styles.smallText}>
                Delete
              </TextRegular>
            </View>
          </Pressable>
        </View>}
      </View>
    )
  }

  function renderFechaHora (fecha) {
    const fechaObjeto = new Date(fecha)
    const dia = fechaObjeto.getDate()
    const mes = fechaObjeto.getMonth() + 1
    const anyo = fechaObjeto.getFullYear()
    const horas = fechaObjeto.getHours()
    const minutos = fechaObjeto.getMinutes()
    return `${dia}/${mes}/${anyo} ${horas}:${minutos}`
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
          <TextRegular> {item.price} €</TextRegular>
          <TextRegular> Quantity: {item.OrderProducts.quantity }</TextRegular>
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
  <>
    <FlatList
      ListEmptyComponent={renderEmptyOrderDetails}
      data={order.products}
      renderItem={renderProduct}
      keyExtractor={item => item.id.toString()}
      ListHeaderComponent={renderHeader}
    />
    <DeleteModal
      isVisible={orderToBeDeleted !== null}
      onCancel={() => setOrderToBeDeleted(null)}
      onConfirm={() => OrdersScreen.removeOrder(orderToBeDeleted)}>
      <TextRegular>The order will be cancelled</TextRegular>
    </DeleteModal>
  </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  smallText: {
    fontSize: 15,
    color: 'white',
    textAlign: 'left'
  },
  orderIdStyle: {
    fontSize: 40,
    color: 'white',
    textAlign: 'center'
  },
  product: {
    marginLeft: 100,
    marginRight: 100,
    width: '75%'
  },
  orderHeaderContainer: {
    height: 250,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.75)',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionButton: {
    borderRadius: 8,
    height: 40,
    marginTop: 8,
    margin: '1%',
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'column',
    width: '20%'
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    bottom: 5,
    position: 'relative',
    width: '90%',
    height: '35%',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center'
  },
  restaurantNameStyle: {
    fontSize: 18,
    color: 'white'
  }
})
