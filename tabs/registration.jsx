import React, { useEffect, useState, useRef } from 'react';
import {View, Text, StyleSheet, TextInput, Button, Alert, ImageBackground, TouchableOpacity} from 'react-native'
import {API_URL} from '@env'
import { imgs } from './imgs';
import { generalStyles } from '../generalStyles';

export const Registration = ({navigation}) => {
    const[username, setUsername] = useState('')
    const[password1, setPassword1] = useState('')
    const[password2, setPassword2] = useState('')
    const[walletName, setWalletName] = useState('')
    const[warning, setWarning] = useState('')

    const walletNameTextInput = useRef()
    const password1TextInput = useRef()
    const password2TextInput = useRef()

    const registration = async () => {
        try {
         const response = await fetch(
           `${API_URL}/signUp`, 
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify ( {
                "username": username,
                "walletName": walletName,
                "password": password1
              })
            }
          );
          if (response.status == 400){
            Alert.alert('Error', await response.text())
          }
          else {
          //const json = await response.json();
          Alert.alert('You have registered')
          return navigation.navigate('Authorization')
        }
    
        } catch (error) {
    
         console.error(error);
        } finally {
         //loading
        } }


    return (
        <ImageBackground source={imgs.bgGame} style={generalStyles.container}>
            <Text style={generalStyles.bigText} >Registration</Text>
            <Text style={{color:'red'}}>{warning}</Text>
            <TextInput style={styles.textInput} placeholder={'Username'} onChangeText={setUsername} placeholderTextColor='grey' returnKeyType='next' 
              onSubmitEditing={() => {walletNameTextInput.current.focus()}}/>
            <TextInput style={styles.textInput} placeholder={'Wallet Name'} onChangeText={setWalletName} ref={walletNameTextInput}  placeholderTextColor='grey' 
              returnKeyType='next' onSubmitEditing={() => {password1TextInput.current.focus()}}/>
            <TextInput style={styles.textInput} secureTextEntry={true} placeholder='Password'  placeholderTextColor='grey' ref={password1TextInput} returnKeyType='next'
             onSubmitEditing={() => {password2TextInput.current.focus()}} onChangeText={ value => {
                setPassword1(value)
                if (value.length < 8)
                  setWarning('Password must contains more than 7 symbols')
                else
                  setWarning('')
              }
            }/>
            <TextInput returnKeyType='done' style={styles.textInput} secureTextEntry={true} placeholder='Password' placeholderTextColor='grey' ref={password2TextInput} 
            onChangeText={ value => {
                setPassword2(value)
                if (value != password1)
                  setWarning('Passwords do not match')
                else
                  setWarning('')
              }}
              onSubmitEditing={async () => {
                if (username && walletName && password1 && password1 == password2){
                  await registration()
                }
                else{
                    Alert.alert('Fill in all the fields')
                }
              }}/>

            <TouchableOpacity disabled={warning != ''} style={[generalStyles.button, {width: '50%'}]} onPress={ async () => {
                if (username && walletName && password1 && password1 == password2){
                  await registration()
                }
                else{
                    Alert.alert('Fill in all the fields')
                }
              }}  >
                <Text style={generalStyles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            <View style={{flex: 0.4}}></View>
        </ImageBackground>
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