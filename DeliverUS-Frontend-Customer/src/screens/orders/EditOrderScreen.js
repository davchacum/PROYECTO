import React, { useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View, FlatList } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as yup from 'yup'
import { getOrderDetails, updateOrderById } from '../../api/OrderEnpoints'
import InputItem from '../../components/InputItem'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { showMessage } from 'react-native-flash-message'
import { Formik } from 'formik'
import ImageCard from '../../components/ImageCard'
import TextError from '../../components/TextError'
import { buildInitialValues } from '../Helper'

export default function EditOrderScreen ({ navigation, route }) {
  const [backendErrors, setBackendErrors] = useState()
  const [counts, setCount] = useState(new Map())
  const [order, setOrder] = useState({})
  const [initialOrderValues, setInitialOrderValues] = useState({ address: null })

  useEffect(() => {
    async function fetchOrderDetail () {
      try {
        const fetchedOrder = await getOrderDetails(route.params.id)
        setOrder(fetchedOrder)
        const newProducts = new Map(counts)
        // newProducts.set(1, 1)
        fetchedOrder.products.forEach(p => newProducts.set(p.id, p.OrderProducts.quantity))
        setCount(newProducts)

        const initialValues = buildInitialValues(fetchedOrder, initialOrderValues)
        setInitialOrderValues(initialValues)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving order details (id ${route.params.id}). ${error}`,
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }
    fetchOrderDetail()
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

  const updateOrder = async (values) => {
    setBackendErrors([])
    try {
      const productQuantity = [...counts].map(([productId, quantity]) => ({ productId, quantity }))
        .filter(element => element.quantity > 0)
      const valuess = { address: values.address, products: productQuantity }

      const updatedOrder = await updateOrderById(order.id, valuess)
      showMessage({
        message: `Order ${updatedOrder.name} succesfully updated`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
      navigation.navigate('OrdersScreen', { dirty: true })
    } catch (error) {
      console.log(error)
      setBackendErrors(error.errors)
    }
  }
  const validationSchema = yup.object().shape({
    address: yup
      .string()
      .max(255, 'Address too long')
      .required('Address is required')
  })

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

  return (
    <Formik
      validationSchema={validationSchema}
      enableReinitialize
      initialValues={initialOrderValues}
      onSubmit={updateOrder}
      >
      {({ handleSubmit, values }) => (
        <ScrollView>
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: '60%' }}>
              <InputItem
                name='address'
                label='Address:'
                value={values.address}
              />

              {backendErrors &&
                backendErrors.map((error, index) => <TextError key={index}>{error.param}-{error.msg}</TextError>)
              }
              <Pressable
                onPress={handleSubmit}
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed
                      ? GlobalStyles.brandSuccessTap
                      : GlobalStyles.brandSuccess
                  },
                  styles.button
                ]}>
                <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
                  <MaterialCommunityIcons name='content-save' color={'white'} size={20}/>
                  <TextRegular textStyle={styles.text}>
                    Save
                  </TextRegular>
                </View>
              </Pressable>
            </View>
          </View>
          <FlatList
                // ListHeaderComponent={renderHeader}
                style={styles.container}
                data={order.products}

                renderItem={renderProduct}
                keyExtractor={item => item.id.toString()}
                />
        </ScrollView>
      )}
    </Formik>

  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  button: {
    borderRadius: 8,
    height: 40,
    padding: 10,
    width: '100%',
    marginTop: 20,
    marginBottom: 20
  },
  text: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginLeft: 5
  },
  imagePicker: {
    height: 40,
    paddingLeft: 10,
    marginTop: 20,
    marginBottom: 80
  },
  image: {
    width: 100,
    height: 100,
    borderWidth: 1,
    alignSelf: 'center',
    marginTop: 5
  },
  availability: {
    margin: '0%',
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    position: 'absolute',
    width: '90%',
    marginTop: 30,
    justifyContent: 'flex-end',
    fontStyle: 'bold',
    fontSize: 20,
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
