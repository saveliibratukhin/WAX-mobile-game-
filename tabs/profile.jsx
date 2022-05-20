import React, { useEffect, useState } from 'react';
import {View, Text, Button, Alert, ActivityIndicator, StyleSheet, Modal, ScrollView} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './authContext';
import { useContext } from 'react';
import Slider from '@react-native-community/slider';
import {API_URL} from '@env'
import { GameContext } from './gameContext';
import { NavigationContainer, StackActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export const Profile = ({navigation}) => {
    const [isAuth, setIsAuth] = useContext(AuthContext)
    const [userData, setUserData] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [strength, setStrength] = useState(0)
    const [vitality, setVitality] = useState(0)
    const [availableStats, setAvailableStats] = useState(1)
    const [agility, setAgility] = useState(0)
    const [intelligence, setIntelligence] = useState(0)
    const [luck, setLuck] = useState(0)
    const [modalConfirmVisible, setModalConfirmVisible] = useState(false)
    const [isGame, setIsGame] = useContext(GameContext)

    const getData = async () => {
      try{
        const response = await fetch (`${API_URL}/getUserFullData`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify ({
            'token': await AsyncStorage.getItem('@token')
          })
        })
        const json = await response.json()
        console.log(json)
        setUserData(json)
        setStrength(json.strength)
        setVitality(json.vitality)
        setAgility(json.agility)
        setIntelligence(json.intelligence)
        setLuck(json.luck)
        setAvailableStats(json.availableStats)
        console.log(userData)
        return setIsLoading(false)
      }
      catch(e){
        Alert.alert(e)
      }
    }

    const increaseStats = async() => {
      const response = await fetch(`${API_URL}/increaseStats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: await AsyncStorage.getItem('@token'),
          strength: strength,
          vitality: vitality,
          agility: agility,
          intelligence: intelligence,
          luck: luck,
          availableStats: availableStats
        })
      })
      const result = await response.text()
      Alert.alert(result)
    }

    const increasedStats = () => {
      let res = ''
      const strengthIncreased = strength - userData.strength
      const vitalityIncreased = vitality - userData.vitality
      const agilityIncreased = agility - userData.agility
      const intelligenceIncreased = intelligence - intelligence.vitality
      const luckIncreased = luck - luck.vitality
      if (strengthIncreased > 0)
        res += `Strength +${strengthIncreased}`
      if (vitalityIncreased > 0)
        res += `Vitality +${vitalityIncreased}`
      if (agilityIncreased > 0)
        res += `Agility +${agilityIncreased}`
      if (intelligenceIncreased > 0)
        res += `Intelligence +${intelligenceIncreased}`
      if (luckIncreased > 0)
        res += `Luck +${luckIncreased}`
      
    }
  
      
    useEffect(async () => {
      await getData()
    }, [])

    useEffect(() => {
      const refresh = navigation.addListener('tabPress', () => {
      getData()
      })
        return refresh
    }, [navigation])


    const ProfileInfo = ({navigation}) => {
      return (
        <ScrollView>
        {isLoading? (<ActivityIndicator />) :
          <View style={styles.container}>
            <View>
              <Modal
              animationType="slide"
              transparent={true}
              visible={modalConfirmVisible}
              >
                  <View style={styles.container}>
                      <View style={styles.modalView}>
                          <Text>Do you want to increase stats? </Text>
                          <Button title='Yes' onPress={async () => {
                              await increaseStats()
                              setModalConfirmVisible(false)
                              setIsLoading(true)
                              getData()
                          }}/>
                          <Button title='No' onPress={() => {
                              setModalConfirmVisible(false)
                          }} />
                      </View>
                  </View>
              </Modal>


              <Text>{userData.username}</Text>

              <View style={styles.rowView}>
                <Text>{userData.walletName}</Text>
                {userData.isConfirmed == 0?
                  <Button title='Confirm' onPress={async () => {
                    const response = await fetch(`${API_URL}/confirmAccount`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                        token: await AsyncStorage.getItem('@token'),
                      })
                    })
                    const result = await response.text()
                    Alert.alert(result)
                  }} /> : <Text>Confirmed!</Text>
                }
              </View>

              <View style={styles.rowView}>
                <Text>Gold: {userData.gold}</Text>
                <Button title='Withdrawal' onPress={() => {
                  navigation.navigate('Withdrawal')
                }}/>
              </View>

              <Text>Winrate: {userData.loseCount == 0? '100': Math.floor(userData.winCount / (userData.winCount + userData.loseCount) * 1000) / 10}% ({userData.winCount} wins, {userData.loseCount} loses)</Text>

              <Text>Stats: </Text>
              <Text style={{color: availableStats < 0? 'red' : availableStats > 0? 'green' : 'black'}}>Available stats: {availableStats}</Text>
              <Text>Stregth: {strength} (+ {strength - userData.strength})</Text>
              <Text>increases your damage</Text>
              <Slider minimumValue={userData.strength} maximumValue={userData.strength + userData.availableStats} onValueChange={setStrength} 
                onSlidingStart={() => {  
                    setAvailableStats(availableStats + (strength - userData.strength))
                }} 
                onSlidingComplete={()=> {setAvailableStats(availableStats - (strength - userData.strength))}} 
                step={1}/>
              
              <Text>Vitality: {vitality} (+ {vitality - userData.vitality})</Text>
              <Text>increases your hp</Text>
              <Slider minimumValue={userData.vitality} maximumValue={userData.vitality + userData.availableStats} onValueChange={setVitality} 
                onSlidingStart={() => {  
                    setAvailableStats(availableStats + (vitality - userData.vitality))
                }} 
                onSlidingComplete={()=> {setAvailableStats(availableStats - (vitality - userData.vitality))}} 
                step={1}/>

              <Text>Agility: {agility} (+ {agility - userData.agility})</Text>
              <Text>increases your dodge chance</Text>
              <Slider minimumValue={userData.agility} maximumValue={userData.agility + userData.availableStats} onValueChange={setAgility} 
                onSlidingStart={() => {  
                    setAvailableStats(availableStats + (agility - userData.agility))
                }} 
                onSlidingComplete={()=> {setAvailableStats(availableStats - (agility - userData.agility))}} 
                step={1}/>

              <Text>Intelligence: {intelligence} (+ {intelligence - userData.intelligence})</Text>
              <Text>increases your mana</Text>
              <Slider minimumValue={userData.intelligence} maximumValue={userData.intelligence + userData.availableStats} onValueChange={setIntelligence} 
                onSlidingStart={() => {  
                    setAvailableStats(availableStats + (intelligence - userData.intelligence))
                }} 
                onSlidingComplete={()=> {setAvailableStats(availableStats - (intelligence - userData.intelligence))}} 
                step={1}/>

              <Text>Luck: {luck} (+ {luck - userData.luck})</Text>
              <Text>increases your rewards</Text>
              <Slider minimumValue={userData.luck} maximumValue={userData.luck + userData.availableStats} onValueChange={setLuck} 
                onSlidingStart={() => {  
                    setAvailableStats(availableStats + (luck - userData.luck))
                }} 
                onSlidingComplete={()=> {setAvailableStats(availableStats - (luck - userData.luck))}} 
                step={1}/> 
                



              <Button title='Increase stats' disabled={userData.availableStats == 0 || availableStats < 0} onPress={() => {
                setModalConfirmVisible(true)
              }} />

              <Text>Day of registration: {userData.regDay.split('T')[0]}</Text>

              <Button title={'Log out'} onPress={ async () => {
                  setIsAuth(false)
                  await AsyncStorage.clear()
              }}/>
            </View>
          </View>
        }
        </ScrollView>
      )
    }

    const Withdrawal = ({navigation}) => {
      return(
        <View style={styles.container}>
          <Text>I can't withdrawal now...</Text>
          <Button title='OK' onPress={() => {
            navigation.navigate('ProfileInfo')
          }} />
        </View>
      )
    }

    return (
      <NavigationContainer independent={true}>
        <Stack.Navigator>
          <Stack.Screen name='ProfileInfo' component={ProfileInfo} options={{headerShown: false}}/>
          <Stack.Screen name='Withdrawal' component={Withdrawal} options={{}}/>
        </Stack.Navigator>
      </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    //backgroundColor: '#aaa',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    flex: 1,
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
  rowView: {
    flexDirection: 'row',
    //justifyContent: 'center',
    justifyContent: 'space-between',
  }
})