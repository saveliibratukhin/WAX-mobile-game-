import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState, useContext } from 'react';
import {View, Text, StyleSheet, Button, Alert} from 'react-native'
import { GameContext } from './gameContext';
import {API_URL, NFT_RECEPIENT, MEMO} from'@env'
import AsyncStorage from '@react-native-async-storage/async-storage';
import CountDown from 'react-native-countdown-component';

const Stack = createNativeStackNavigator();


export const Main = ({navigation}) => {

    const [isInGame, setIsInGame] = useContext(GameContext)
    const [isConfirmed, setIsConfirmed] = useState(false)
    const [blockTime, setBlockTime] = useState(0)
    const [playButtonDisable, setPlayButtonDisable] = useState(true)

    const getBlockTime = async () => {
        const response = await fetch(`${API_URL}/getBlockTime`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: await AsyncStorage.getItem('@token')
            })
        })
        const json = await response.json()
        console.log(json)
        if (json.isConfirmed == 0){
            return setIsConfirmed(false)
        }
        else {
            console.log(json.diff)
            const time = json.diff.split(':')
            console.log(time)
            if (time[0][0] === '-') {
                setPlayButtonDisable(false)
                setBlockTime(0);
            }
            else
                setBlockTime(parseInt(time[0])*3600+parseInt(time[1])*60+parseInt(time[2]))

            //почему-то таймер берет предыдущее значение (с этим работает)
            setBlockTime(20)
            return setIsConfirmed(true)
        }
    }

    useEffect(() => {
        const refresh = navigation.addListener('tabPress', async () => {
        getBlockTime()
        })
          return refresh
      }, [navigation])

    useEffect(() => {
        getBlockTime()
    }, [])


    return (
        <View style={styles.container}>
            { isConfirmed? <View></View> : <Text> Confirm your wallet (Send pass to {NFT_RECEPIENT} with memo '{MEMO}' and press Confirm button in Profile tab)</Text> }
            <Text>Block time:</Text>
            <CountDown
                until={blockTime}  
                timeToShow={['H', 'M', 'S']}   
                onFinish={() => { if(isConfirmed) 
                    setPlayButtonDisable(false)}}
            />

            <Button disabled={playButtonDisable} title='PLAY!' onPress={() => {
                setIsInGame(true)
            }}/>
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
    timer: {
        flexDirection: 'row',
        //alignContent: 'center',
       // height: '10%',
        justifyContent: 'center',
        //justifyContent: 'space-around', //space-between
        padding: 5,
    }
});