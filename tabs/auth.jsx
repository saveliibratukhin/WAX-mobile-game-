import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState, useContext, useRef } from 'react';
import {View, Text, TextInput, Button, StyleSheet, Alert, ImageBackground, TouchableOpacity} from 'react-native'
import { Registration } from './registration';
import { NavigationContainer, StackActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from './authContext';
import {API_URL} from '@env' 
import { imgs } from './imgs';
import { generalStyles } from '../generalStyles';

const Stack = createNativeStackNavigator();

function Authorization({navigation}) {

  
  const[walletName, setWalletName] = useState()
  const[password, setPassword] = useState()
  const [isAuth, setIsAuth] = useContext(AuthContext)
  const passwordTextInput = useRef()
  
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
    } 
  }



  return (
    <ImageBackground source={imgs.bgGame} style={generalStyles.container}>
        <Text style={generalStyles.bigText}>Log In</Text>
          <TextInput style={styles.textInput}  placeholder="Wallet" placeholderTextColor={'grey'} returnKeyType='next' onSubmitEditing={() => passwordTextInput.current.focus() }
            onChangeText={text => setWalletName(text.toLowerCase())}/>
          <TextInput style={styles.textInput} secureTextEntry={true} 
            onChangeText={setPassword} placeholder='Password' ref={passwordTextInput} placeholderTextColor={'grey'} returnKeyType='done' onSubmitEditing={async () => {
              if (walletName && password){
                await login()
              }
              else{
                  Alert.alert('Fill in all the fields')
              }
            }}/>

          <TouchableOpacity style={[generalStyles.button, {width: '50%'}]} onPress={ async () => {
              if (walletName && password){
                await login()
              }
              else{
                  Alert.alert('Fill in all the fields')
              }
            }}  >
              <Text style={generalStyles.buttonText}>Sign in</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[generalStyles.button, {width: '50%'}]} onPress={ async () => {
              return navigation.navigate('Registration')
          }}  >
              <Text style={generalStyles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <View style={{flex: 0.4}}></View>
    </ImageBackground>
  )
}

export const Auth = props => {

    return (
        <NavigationContainer>
          <Stack.Navigator screenOptions={{headerBackTitleVisible: false, headerTitle: '', headerStyle: {backgroundColor: '#9DECF9'}}}>
            <Stack.Screen name='Authorization' component={Authorization}  />
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