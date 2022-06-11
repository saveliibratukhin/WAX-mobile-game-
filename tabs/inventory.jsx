import React, { useEffect, useState, useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, SectionList,  ActivityIndicator, FlatList, Image, TouchableOpacity, Alert, Modal, ImageBackground, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, StackActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {API_URL} from '@env'
import { imgs } from './imgs';
import { generalStyles } from '../generalStyles';

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
    <ImageBackground source={imgs.bgGame} style={generalStyles.container}>
      {isLoading ? <ActivityIndicator/> : (
        <View style={generalStyles.container} >
          <Text style={generalStyles.bigText} >Equipment: </Text>
            <FlatList
              style={styles.flatListEquip}
              data={equipment}
              renderItem={({ item }) => (<TouchableOpacity onPress={() => {
                    if (item.id == 0)
                      return 
                    return navigation.navigate('ChoosenAsset', {
                      itemId: item.id,
                      template: item.template,
                      schema: item.schema,
                      name: item.name
                    })
                  }}>
                <View style={generalStyles.container}>
                  <Text style={generalStyles.smallText} >{item.slot}</Text>
                  <View style={[generalStyles.container, styles.item]}>
                  {item.id == 0? <Text style={styles.nameText}>Nothing...</Text> :
                  <View style={generalStyles.container}>
                      <Text style={styles.nameText} >{item.name}</Text>
                      <Text style={styles.idText}>{'#' + item.id}</Text>
                      
                      <Image source={imgs[item.name] ||imgs.ask} style={styles.tinyLogo}/>
                      </View>
                }
                  </View>
                </View>
                </TouchableOpacity>
              )}
              numColumns={4}
            />
          <Text style={generalStyles.bigText}>Inventory: </Text>
          <FlatList
            style={styles.flatList}
            data={data}
            renderItem={({ item }) => (<TouchableOpacity onPress={() => {
                return navigation.navigate('ChoosenAsset', {
                  itemId: item.id,
                  template: item.template,
                  schema: item.schema,
                  name: item.name
                })
              }}>
                <View style={styles.item} >
                    <Text style={styles.nameText} >{item.name}</Text>
                    <Text style={styles.idText}>{'#' + item.id}</Text>
                    
                    <Image source={imgs[item.name] || require('./imgs/ask.jpg')} style={styles.tinyLogo}/>
                </View>
              </TouchableOpacity>
            )}
            numColumns={4}
          />
        </View>
      )}
    </ImageBackground>
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
      const response = await fetch (`${API_URL}/getAssetInfo`, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json'
        }, 
        body: JSON.stringify({'itemId': route.params.itemId})
      })
      const json = await response.json()
      return setData(json)
    } catch (error) {
      Alert.alert(error);
    } finally {
      setLoading(false);
    } 
  }

  useEffect(() => {
    getAssetData();
  }, [])

  return (
    <ImageBackground source={imgs.bgGame} style={generalStyles.container}>
      {isLoading? <ActivityIndicator /> :
      route.params.schema == 'equipment' ? //обрабатывыаем для не еквимента
      <ScrollView style={generalStyles.scrollView}>
        <View style={generalStyles.container} >
          <Text style={generalStyles.bigText} >{data.name}</Text>
          <Text style={generalStyles.smallText} >#{route.params.itemId}</Text>
          <Image source={imgs[route.params.name] || require('./imgs/ask.jpg')} style={styles.bigLogo}/>
          <Text style={generalStyles.smallText} > Type:  {data.type}</Text>
          <Text style={generalStyles.smallText} > Rarity:  {data.rarity}</Text>
          <Text style={generalStyles.smallText} > Strength:  {data.strength? data.strength : 0}</Text>
          <Text style={generalStyles.smallText} > Vitality:  {data.vitality? data.vitality : 0}</Text>
          <Text style={generalStyles.smallText} > Agility:  {data.agility?  data.agility : 0}</Text>
          <Text style={generalStyles.smallText} > Intelligence:  {data.intelligence? data.intelligence : 0}</Text>
          <Text style={generalStyles.smallText} > Luck:  {data.luck?  data.luck : 0}</Text>
          <Text style={generalStyles.smallText} > Level requirements:  {data.lvlReqs}</Text>

          <TouchableOpacity style={[generalStyles.button, {width: '40%'}]}
            onPress={async () => {
              await equipNFT(data.type)
            }}>
              <Text style={generalStyles.buttonText} >Equip</Text>
          </TouchableOpacity>

          
          {equipmentList.includes(route.params.itemId)?
          <TouchableOpacity style={[generalStyles.button, {width: '40%'}]}
            onPress={async () => {
              await unequipNFT(data.type)
            }}>
              <Text style={generalStyles.buttonText} >Unequip</Text>
        </TouchableOpacity>
          : <Text></Text> }
        </View>
      </ScrollView> :      
      route.params.schema == 'skills'?
      <View style={generalStyles.container}>

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

        <Text style={generalStyles.bigText} >{data.name}</Text>
        <Image source={imgs[route.params.name] || require('./imgs/ask.jpg')} style={styles.bigLogo}/>
        <Text style={generalStyles.smallText} >Rarity: {data.rarity}</Text>
        <Text style={generalStyles.smallText} >Damage: {data.damage}</Text>
        <Text style={generalStyles.smallText} >Cost: {data.cost}</Text>
        <Text style={generalStyles.smallText} >Intelligence requirements: {data.intReqs}</Text>

        <TouchableOpacity style={[generalStyles.button, {width: '40%'}]}
            onPress={() => {
              setModalChooseSlotVisible(true)
            }}>
              <Text style={generalStyles.buttonText} >Equip</Text>
        </TouchableOpacity>

        {equipmentList.includes(route.params.itemId)?
        <TouchableOpacity style={[generalStyles.button, {width: '40%'}]}
            onPress={async () => {
              await unequipNFT('skill', route.params.nftId) 
            }}>
              <Text style={generalStyles.buttonText} >Unequip</Text>
        </TouchableOpacity>  : <View></View>}

      </View> :

      <View style={generalStyles.container}>
        <Text style={generalStyles.bigText}>{data.name}</Text>
        <Image source={imgs[route.params.name] || require('./imgs/ask.jpg')} style={styles.bigLogo}/>
        <Text style={generalStyles.smallText} >{data.description || data.decription}</Text>
      </View> 
      }
    </ImageBackground>
  )
}


export const Inventory = props => {



  return (
      <NavigationContainer independent={true}>
          <Stack.Navigator >
            <Stack.Screen name='Assets' component={Assets} options={{headerShown: false}}/>
            <Stack.Screen name='ChoosenAsset' component={ChoosenAsset} options={{headerTitle: '', headerBackTitle: 'Inventory', headerStyle: {backgroundColor: '#9DECF9'}}} />
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
    //justifyContent: 'center',
    height: 95,
    width: 60,
    backgroundColor: '#00AAFF', //'#f9c2ff',
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
    
    height: '40%',
  },
  idText: {
    fontSize: 5
  },
  nameText: {
    fontSize: 13
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