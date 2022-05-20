import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, TextInput, Button, Alert} from 'react-native'
import {API_URL} from '@env'

export const Registration = ({navigation}) => {
    const[username, setUsername] = useState('')
    const[password1, setPassword1] = useState('')
    const[password2, setPassword2] = useState('')
    const[walletName, setWalletName] = useState('')
    const[warning, setWarning] = useState('')

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
        <View style={styles.container}>
            <Text style={{color:'red'}}>{warning}</Text>
            <TextInput style={styles.textInput} placeholder={'username'} onChangeText={setUsername}/>
            <TextInput style={styles.textInput} placeholder={'walletName'} onChangeText={setWalletName} />
            <TextInput style={styles.textInput} secureTextEntry={true} placeholder='Password' onChangeText={ value => {
                setPassword1(value)
                if (value.length < 8)
                  setWarning('Password must contains more than 7 symbols')
                else
                  setWarning('')
              }
            }/>
            <TextInput style={styles.textInput} secureTextEntry={true} placeholder='Password' onChangeText={ value => {
                setPassword2(value)
                if (value != password1)
                  setWarning('Passwords do not match')
                else
                  setWarning('')
              }
            }/>
            <Button disabled={warning != ''} title='Registration' onPress={async () => {
                if (username && walletName && password1 && password1 == password2){
                  await registration()
                }
                else{
                    Alert.alert('Fill in all the fields')
                }
            }}></Button>
        </View>
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