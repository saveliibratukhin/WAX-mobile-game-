import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, Button, SectionList,  ActivityIndicator, FlatList, Image, Alert } from 'react-native';
import {Inventory} from './tabs/inventory'
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {Profile} from './tabs/profile'
import {Shop} from './tabs/shop'
import { Main } from './tabs/main';
import { Auth } from './tabs/auth'
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AuthContext} from './tabs/authContext'
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Game } from './tabs/game';
import { GameContext } from './tabs/gameContext';
import {API_URL} from '@env'
import { LoadingView } from './tabs/loadingView';
import { Header } from './tabs/header';

const Tab = createBottomTabNavigator();


const MyTabs = () => {

    return (
        <Tab.Navigator screenOptions={{ header: ({ navigation, route, options }) => {
            return <Header navigation={navigation} options={options}/> 
            }}} >
          <Tab.Screen name="Shop" component={Shop} />
          <Tab.Screen name="Inventory" component={Inventory} />
          <Tab.Screen name='Main' component={Main} />
          <Tab.Screen name="Profile" component={Profile} />
        </Tab.Navigator>
    );
}




export default function App() {
  const [isAuth, setIsAuth] = useState(false)
  const [isInGame, setIsInGame] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const verification = async () => {
    //setTimeout(() => {if (isLoading) Alert.alert('Error', 'Check your Internet connection')}, 10000)
    try {
      const token = await AsyncStorage.getItem('@token')
      const walletName = await AsyncStorage.getItem('@walletName')
      console.log(token)
      if(token !== null) {
        const response = await fetch(
          `${API_URL}/verifyToken`, 
           {
             method: 'POST',
             headers: {
               'Content-Type': 'application/json'
             },
             body: JSON.stringify ( {
               "token":  token,
               "walletName": walletName
             })
           }
         )    //.catch(() => {Alert.alert('Error')})
         console.log(response.status)
         if (response.status == 400){
           Alert.alert('Error', await response.text())
           setIsAuth(false)
         }
         else {
           //const json = await response.json();
           setIsAuth(true)
         }
      }

    } catch(e) {
      Alert.alert(e)
    }
    return setIsLoading(false)
  }

  useEffect(() => {
    //добавим проверку работы сервера
    verification()
  }, [])
  

  return isLoading? <LoadingView /> : (
      <AuthContext.Provider value={[isAuth, setIsAuth]}>
        { !isAuth? (<Auth />) : 
        (<GameContext.Provider value={[isInGame, setIsInGame]}>{
            isInGame? (<Game />) :
              (<NavigationContainer>
                <MyTabs />
              </NavigationContainer>)}
          </GameContext.Provider>)
        }
        </AuthContext.Provider> 

  )}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#aaa',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
  },
  header: {
    //alignItems: 'center',
    marginTop: '7%',
    flexDirection: 'row',
    backgroundColor: 'red',
    //alignContent: 'center',
   // height: '10%',
    //justifyContent: 'center',
    justifyContent: 'space-around', //space-between
    padding: 5,
  },
});
