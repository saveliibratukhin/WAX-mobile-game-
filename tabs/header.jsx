import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, Button, SectionList,  ActivityIndicator, FlatList, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_URL} from '@env'
import { useIsFocused } from '@react-navigation/native';
import { generalStyles } from '../generalStyles';
import { AuthContext } from './authContext';

export const Header = ({ navigation, route, options }) => {
    const [wallet, setWallet] = useState('')
    const [exp, setExp] = useState(0)
    const [lvl, setLvl] = useState(0)
    const [gold, setGold] = useState(0)
    const [isAuth, setIsAuth] = useContext(AuthContext)
  
    const getUserData = async () => {
      try{
        const token = await AsyncStorage.getItem('@token')
        if (token === null)
          return
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


    // useEffect(() => {
    //   const refresh = navigation.addEventListener('focus', async() => {
    //     await getUserData()
    //   })
    //   return refresh
    // }, [navigation])
  
    return(
      <View style={styles.header}>
        <Text style={generalStyles.smallText}>{wallet}</Text>
        <Text style={generalStyles.smallText}>Level: {lvl}</Text>
        <Text style={generalStyles.smallText}>Exp: {exp}</Text>
        <Text style={generalStyles.smallText}>Gold: {gold}</Text>
      </View> 
    )
  }

const styles = StyleSheet.create({
    header: {
        //alignItems: 'center',
        marginTop: '7%',
        flexDirection: 'row',
        backgroundColor: '#00AAFF',
        //alignContent: 'center',
       // height: '10%',
        //justifyContent: 'center',
        justifyContent: 'space-around', //space-between
        padding: 5,
      },
})