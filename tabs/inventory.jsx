import React, { useEffect, useState, useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, SectionList,  ActivityIndicator, FlatList, Image, TouchableOpacity, Alert, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, StackActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {API_URL} from '@env'
import { imgs } from './imgs';

const Stack = createNativeStackNavigator();
var equipmentList = []

export const Assets = ({navigation}) => {
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([])
  const [equipment, setEquipment] = useState([])
  //var equipmentList = []


  const getAssets = async () => {
    console.log('get data')
    try {
      const response = await fetch(
       `${API_URL}/getAccountAssets`, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify ( {
            "walletName": await AsyncStorage.getItem('@walletName')
          })
        }
      );
      const json = await response.json();
      setData(json);

      const resp2 = await fetch(
        `${API_URL}/getEquip`, 
         {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json'
           },
           body: JSON.stringify ( {
             "token": await AsyncStorage.getItem('@token')
           })
         }
       ); 
      const jsonEquip = await resp2.json()
      equipmentList = jsonEquip.map(asset => asset.id == 0? null : asset.id)
      console.log(equipmentList)
      return setEquipment(jsonEquip)

    
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    } 
  }

  useEffect(() => {
    const refresh = navigation.addListener('tabPress', async () => {
    getAssets()
    })
      return refresh
  }, [navigation])

  useEffect(() => {
    const refresh = navigation.addListener('focus', async () => {
    setLoading(true)
    getAssets();
    })
      return refresh
  }, [navigation])

  return (
    <View style={styles.container}>
      {isLoading ? <ActivityIndicator/> : (
        <View>
          <Text>Equipment: </Text>
            <FlatList
              style={styles.flatListEquip}
              data={equipment}
              renderItem={({ item }) => (<TouchableOpacity onPress={() => {
                  if (item.id == 0)
                    return 
                  return navigation.navigate('ChoosenAsset', {
                    itemId: item.id,
                    template: item.template,
                    schema: item.schema
                  })
                }}>
                <View style={styles.container}>
                  <Text>{item.slot}</Text>
                  <View style={styles.item} >
                      <Text>{item.template == '398898'? 'Branch': item.template}</Text>
                      <Text style={styles.smallText}>{'#' + item.id}</Text>
                      
                      <Image source={imgs[item.template] || require('./imgs/ask.jpg')} style={styles.tinyLogo}/>
                  </View>
                </View>
                </TouchableOpacity>
              )}
              numColumns={4}
            />
          <Text>Inventory: </Text>
          <FlatList
            style={styles.flatList}
            data={data}
            renderItem={({ item }) => (<TouchableOpacity onPress={() => {
                return navigation.navigate('ChoosenAsset', {
                  itemId: item.id,
                  template: item.template,
                  schema: item.schema
                })
              }}>
                <View style={styles.item} >
                    <Text>{item.template == '513287'? 'Armor': item.template}</Text>
                    <Text style={styles.smallText}>{'#' + item.id}</Text>
                    
                    <Image source={imgs[item.template] || require('./imgs/ask.jpg')} style={styles.tinyLogo}/>
                </View>
              </TouchableOpacity>
            )}
            numColumns={4}
          />
        </View>
      )}
    </View>
  );
}


const ChoosenAsset = ({route, navigation}) => {
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([])
  const [modalChooseSlotVisible, setModalChooseSlotVisible] = useState(false)

  const equipNFT = async (slot) => {
    const response = await fetch(`${API_URL}/equipNFT`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify ( {
        "token": await AsyncStorage.getItem('@token'),
        //"walletName": await AsyncStorage.getItem('@walletName'),
        "lvlReqs": data.lvlReqs,
        "nftId": route.params.itemId,
        "slot": slot,
      })
    })
    const result = await response.text()
    setModalChooseSlotVisible(false)
    Alert.alert(result)
  }

  const unequipNFT = async (slot) => {
    const response = await fetch(`${API_URL}/unequipNFT`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify ( {
        "token": await AsyncStorage.getItem('@token'),
        "slot": slot,
        "nftId": route.params.itemId,
      })
    })
    const result = await response.text()
    Alert.alert(result)
  }

  const getAssetData = async () => {
    try{
      const response = await fetch (`${API_URL}/getAssetInfo`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({'itemId': route.params.itemId})})
      const json = await response.json()
      return setData(json)
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    } 
  }

  useEffect(() => {
    getAssetData();
  }, [])

  return (
    <View style={styles.container}>
      {isLoading? <ActivityIndicator /> :
      route.params.schema == 'equipment' ? //обрабатывыаем для не еквимента
      <View style={styles.container}>
        <Text>{data.name}</Text>
        <Text>#{route.params.itemId}</Text>
        <Image source={imgs[route.params.template] || require('./imgs/ask.jpg')} style={styles.bigLogo}/>
        <Text> Type:  {data.type}</Text>
        <Text> Rarity:  {data.rarity}</Text>
        <Text> Strength:  {data.strength? data.strength : 0}</Text>
        <Text> Vitality:  {data.vitality? data.vitality : 0}</Text>
        <Text> Agility:  {data.agility?  data.agility : 0}</Text>
        <Text> Intelligence:  {data.intelligence? data.intelligence : 0}</Text>
        <Text> Luck:  {data.luck?  data.luck : 0}</Text>
        <Text> Level requirements:  {data.lvlReqs}</Text>
        <Button title='Equip' onPress= {async() => {
          await equipNFT(data.type)
        }}
        />
        {equipmentList.includes(route.params.itemId)? <Button title='Unequip' onPress={async () => {
          await unequipNFT(data.type)         
        }} /> 
        
        : <Text></Text> }
      </View> :      
      route.params.schema == 'skills'?
      <View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalChooseSlotVisible}
        >
          <View style={styles.container}>
              <View style={styles.modalView}>
                  <Text>Choose slot</Text>
                  <Button title='Slot 1' onPress={async () => {
                      await equipNFT('skill1')
                  }}/>
                  <Button title='Slot 2' onPress={async () => {
                      await equipNFT('skill2')
                  }} />
                  <Button title='Cancel' onPress={() => {
                      setModalChooseSlotVisible(false)
                  }} />
              </View>
          </View>
        </Modal>

        <Text>Skill </Text>
        <Text>Rarity: {data.rarity}</Text>
        <Text>Damage: {data.damage}</Text>
        <Text>Cost: {data.cost}</Text>
        <Text>Intelligence requirements: {data.intReqs}</Text>
        <Button title='Equip' onPress={async () => {
          setModalChooseSlotVisible(true)

        }} />
        <Button title='Unequip' onPress={async () => {
          await unequipNFT('skill', route.params.nftId) 
        }} />
      </View> :
      <View>
        <Text>{data.name}</Text>
        <Image source={imgs[route.params.template] || require('./imgs/ask.jpg')} style={styles.bigLogo}/>
        <Text>{data.decription}</Text>
      </View> 
      }
    </View>
  )
}


export const Inventory = props => {



  return (
      <NavigationContainer independent={true}>
        <Stack.Navigator>
          <Stack.Screen name='Assets' component={Assets} options={{headerShown: false}}/>
          <Stack.Screen name='ChoosenAsset' component={ChoosenAsset} options={{headerTitle: 'Asset'}} />
        </Stack.Navigator>
      </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#aaa',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,

  },
  item: {
    alignItems: 'center',
    height: 80,
    width: 60,
    backgroundColor: '#f9c2ff',
    //padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 5
  },
  tinyLogo: {
    width: 50,
    height: 50,
    borderRadius: 5
  },
  bigLogo: {
    width: 250,
    height: 250,
  },
  flatList: {

  },
  flatListEquip: {
    height: '80%'
  },
  smallText: {
    fontSize: 5
  },
  modalView: {
    flex: 0.4,
    justifyContent: "center",
    alignItems: "center",
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
});