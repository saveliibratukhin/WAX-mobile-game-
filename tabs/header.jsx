import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, Button, SectionList,  ActivityIndicator, FlatList, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_URL} from '@env'

export const Header = ({ navigation, route, options }) => {
    const [wallet, setWallet] = useState('')
    const [exp, setExp] = useState(0)
    const [lvl, setLvl] = useState(0)
    const [gold, setGold] = useState(0)
  
  
    const getUserData = async () => {
      try{
        const token = await AsyncStorage.getItem('@token')
        const responce = await fetch (`${API_URL}/getUserData`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify ({
            'token': token
          })
        })
        const json = await responce.json()
        console.log(json)
        setWallet(json[0].walletName)
        setExp(json[0].exp)
        setLvl(json[0].level)
        setGold(json[0].gold)
      }
      catch(e){
        Alert.alert(e)
      }
    }
  
    useEffect(() => {
      getUserData()
    }, [])


    //меняется каждый раз при изменении вкладки или вызова setOptions (отправляет запрос по 4 раза, не знаю как исправить)
    useEffect(() => {
      const refresh = () => {
         getUserData()
      }
      return refresh
    }, [options])
  
    return(
      <View style={styles.header}>
        <Text>{wallet}</Text>
        <Text>Level: {lvl}</Text>
        <Text>Exp: {exp}</Text>
        <Text>Gold: {gold}</Text>
      </View> 
    )
  }

const styles = StyleSheet.create({
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
})