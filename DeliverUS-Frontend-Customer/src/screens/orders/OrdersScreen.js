
/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, FlatList, Pressable, View } from 'react-native'

import { getAllOrders, removeOrderById } from '../../api/OrderEnpoints'
import ImageCard from '../../components/ImageCard'
import TextSemiBold from '../../components/TextSemibold'
import TextRegular from '../../components/TextRegular'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import { showMessage } from 'react-native-flash-message'
import DeleteModal from '../../components/DeleteModal'
import restaurantLogo from '../../../assets/restaurantLogo.jpeg'

export default function RestaurantsScreen ({ navigation, route }) {
  const [orders, setOrders] = useState([])
  const [orderToBeDeleted, setOrderToBeDeleted] = useState(null)
  const { loggedInUser } = useContext(AuthorizationContext)

  useEffect(() => {
    if (loggedInUser) {
      fetchOrders()
    } else {
      setOrders(null)
    }
  }, [loggedInUser, route, orders])

  const renderOrder = ({ item }) => {
    return (
      <ImageCard
        imageUri={item.restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + item.restaurant.logo } : restaurantLogo}
        title={item.restaurant.name}
        onPress={() => {
          navigation.navigate('OrderDetailScreen', { id: item.id })
        }}
      >
        <TextRegular>Status: <TextSemiBold textStyle={item.status === 'in process' ? { color: GlobalStyles.brandSecondary } : item.status === 'sent' ? { color: GlobalStyles.brandGreen } : item.status === 'delivered' ? { color: 'blue' } : { color: GlobalStyles.brandPrimary }}>{item.status}</TextSemiBold></TextRegular>
        <TextRegular>Price: <TextSemiBold>{item.price}€</TextSemiBold></TextRegular>
        <TextRegular>Date: <TextSemiBold>{renderFechaHora(item.createdAt)}</TextSemiBold></TextRegular>
        {item.status === 'pending' &&
        <View style={styles.actionButtonsContainer}>
          <Pressable
           onPress={() => navigation.navigate('EditOrderScreen', { id: item.id })}
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
              <TextRegular textStyle={styles.text}>
                Edit
              </TextRegular>
            </View>
          </Pressable>
          <Pressable
            onPress={() => { setOrderToBeDeleted(item) }}
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
              <TextRegular textStyle={styles.text}>
                Delete
              </TextRegular>
            </View>
          </Pressable>
        </View>}
      </ImageCard>
    )
  }

  const removeOrder = async (order) => {
    try {
      await removeOrderById(order.id)
      await fetchOrders()
      setOrderToBeDeleted(null)
      showMessage({
        message: `Order ${order.id} succesfully removed`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    } catch (error) {
      console.log(error)
      setOrderToBeDeleted(null)
      showMessage({
        message: `Order ${order.id} could not be removed.`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const renderEmptyOrdersList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        No orders were retreived. Are you logged in?
      </TextRegular>
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

  const fetchOrders = async () => {
    try {
      const fetchedOrders = await getAllOrders()
      setOrders(fetchedOrders)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving orders. ${error} `,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  return (
    <>
    <FlatList
      style={styles.container}
      data={orders}
      renderItem={renderOrder}
      keyExtractor={item => item.id.toString()}
      ListEmptyComponent={renderEmptyOrdersList}
    />
    <DeleteModal
      isVisible={orderToBeDeleted !== null}
      onCancel={() => setOrderToBeDeleted(null)}
      onConfirm={() => removeOrder(orderToBeDeleted)}>
        <TextRegular>The products of this restaurant will be deleted as well</TextRegular>
        <TextRegular>If the restaurant has orders, it cannot be deleted.</TextRegular>
    </DeleteModal>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
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
  actionButton: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    margin: '1%',
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'column',
    width: '50%'
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    bottom: 5,
    position: 'absolute',
    width: '90%',
    height: '35%'
  },
  text: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center',
    marginLeft: 5
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  }
})
