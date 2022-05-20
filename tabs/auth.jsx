import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState, useContext } from 'react';
import {View, Text, TextInput, Button, StyleSheet, Alert} from 'react-native'
import { Registration } from './registration';
import { NavigationContainer, StackActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from './authContext';
import {API_URL} from '@env' 

const Stack = createNativeStackNavigator();

function Authorization({navigation}) {

  
  const[walletName, setWalletName] = useState()
  const[password, setPassword] = useState()
  const [isAuth, setIsAuth] = useContext(AuthContext)

  
  const login = async () => {
    try {
     const response = await fetch(
       `${API_URL}/login`, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify ( {
            "walletName": walletName,
            "password": password
          })
        }
      );
      if (response.status == 400){
        Alert.alert('Error', await response.text())
      }
      else {
        const json = await response.json();
        await AsyncStorage.setItem("@walletName", json.walletName)
        await AsyncStorage.setItem("@token", json.token)
        console.log(json.walletName, json.token)
        setIsAuth(true)
      }
    } catch (error) {

     console.error(error);
    } finally {
     //loading
    } }



  return (
    <View style={styles.container}>
        <TextInput style={styles.textInput} onChangeText={text => setWalletName(text.toLowerCase())} placeholder="Wallet"></TextInput>
        <TextInput style={styles.textInput} secureTextEntry={true} onChangeText={setPassword} placeholder='Password'></TextInput>
        <Button title='Auth' onPress={async () => {
            if (walletName && password){
              await login()
            }
            else{
                Alert.alert('Fill in all the fields')
            }
        }}></Button>
        <Button title='Registration' onPress={() => {
          return navigation.navigate('Registration')
        }} />
    </View>
)
}

export const Auth = props => {

    return (
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name='Authorization' component={Authorization} />
            <Stack.Screen name='Registration' component={Registration} />
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
    textInput: {
        //backgroundColor: '#000000',
        borderColor: '#000000',
        borderBottomWidth: 2,
        height: 30,
        width: '80%',
        textAlign: 'center',
        
    },
});