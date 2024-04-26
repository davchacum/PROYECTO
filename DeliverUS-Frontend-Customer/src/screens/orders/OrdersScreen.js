import React from 'react'
import { useContext, StyleSheet, View, Pressable, FlatList, ImageCard, useEffect, useState } from 'react-native'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { brandPrimary, brandPrimaryTap } from '../../styles/GlobalStyles'
import restaurantLogo from '../../../assets/restaurantLogo.jpeg'
import { getAllOrders } from '../../api/OrderEnpoints'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import { showMessage } from 'react-native-flash-message'
export default function OrdersScreen ({ navigation, route }) {
  const [orders, setOrders] = useState([])
  // const [orderToBeDeleted, setOrderToBeDeleted] = useState(null)
  const { loggedInUser } = useContext(AuthorizationContext)

  useEffect(() => {
    if (loggedInUser) {
      fetchOrders()
    } else {
      setOrders(null)
    }
  }, [loggedInUser, route, orders])

  const renderOrders = ({ item }) => {
    return (
    <ImageCard
      imageUri={item.logo ? { uri: process.env.API_BASE_URL + '/' + item.logo } : restaurantLogo}
      title={item.name}
      onPress={() => {
        navigation.navigate('OrderDetailScreen', { id: item.id })
      }}
    >
    </ImageCard>
    )
  }

  const renderEmptyOrderList = () => {
    return (
    <TextRegular textStyle={styles.emptyList}>
      No orders were retreived. Are you logged in?
    </TextRegular>
    )
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
    {<FlatList
      // style={styles.container}
      // data={orders}
      renderItem={renderOrders}
      keyExtractor={item => item.id.toString()}
      ListEmptyComponent={renderEmptyOrderList}
    />}
    </>
  )
//   return (
//     <View style={styles.container}>
//       <View style={styles.FRHeader}>
//         <TextSemiBold>FR5: Listing my confirmed orders</TextSemiBold>
//         <TextRegular>A Customer will be able to check his/her confirmed orders, sorted from the most recent to the oldest.</TextRegular>
//         <TextSemiBold>FR8: Edit/delete order</TextSemiBold>
//         <TextRegular>If the order is in the state 'pending', the customer can edit or remove the products included or remove the whole order. The delivery address can also be modified in the state 'pending'. If the order is in the state 'sent' or 'delivered' no edition is allowed.</TextRegular>
//       </View>
//         <Pressable
//             onPress={() => {
//               navigation.navigate('OrderDetailScreen', { id: Math.floor(Math.random() * 100) })
//             }}
//             style={({ pressed }) => [
//               {
//                 backgroundColor: pressed
//                   ? brandPrimaryTap
//                   : brandPrimary
//               },
//               styles.button
//             ]}
//         >
//             <TextRegular textStyle={styles.text}>Go to Order Detail Screen</TextRegular>
//         </Pressable>
//     </View>
//   )
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
  }
})
