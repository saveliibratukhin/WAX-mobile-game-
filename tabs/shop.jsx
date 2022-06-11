import React, { useEffect, useState, useContext } from 'react';
import {View, Text, StyleSheet, FlatList, ActivityIndicator, Image, Button, Alert, TouchableOpacity, ImageBackground} from 'react-native'
import {API_URL} from '@env'
import { imgs } from './imgs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generalStyles } from '../generalStyles';
import { Header } from './header';


export const Shop = ({navigation}) => {
    const [items, setItems] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    const getItems = async () => {
        const responce = await fetch(`${API_URL}/shop`)
        const json = await responce.json()
        setItems(json)
        console.log(items)
        return setIsLoading(false)
    }

    const buyItem = async (template, cost, schema) => {
        console.log('buy')
        const response = await fetch (`${API_URL}/buyItem`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: await AsyncStorage.getItem('@token'),
                template,
                cost,
                schema,
            })
        })
        const result = await response.text()
        if (response.status == 400){
            Alert.alert('Error', result)
        }
        else {
            
            Alert.alert(result)
        }


        navigation.setOptions()
    }

    useEffect(() => {
        getItems()
    }, [])




    return (
        <ImageBackground source={imgs.bgGame} style= {generalStyles.container}>
            <Text style={generalStyles.bigText} >SHOP</Text>
            {isLoading? <ActivityIndicator /> :            
                <FlatList
                    style={styles.flatList}
                    data={items}
                    numColumns={2}
                    renderItem={({item}) => (
                        <View style={styles.item}>
                            <Text style={generalStyles.smallText} >{item.data.data.name}</Text>
                            <Image style={styles.itemImage} source={imgs[item.data.data.name]} />
                            <Text>{item.data.data.decription}</Text>
                            <TouchableOpacity style={generalStyles.button} onPress={() => {
                                    buyItem(item.template, item.cost, item.data.schema)
                                }}>
                                    <View style={{justifyContent: 'center'}}>
                                        <Text style={generalStyles.buttonText} >{item.cost}</Text>
                                    </View>
                                    <Image style={styles.coinLogo} source={imgs["coin"]} />
                            </TouchableOpacity>

                        </View>
                    )}
                />}
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    container: {
      backgroundColor: '#aaa',
      alignItems: 'center',
      justifyContent: 'center',
      //margin: 20,
    },
    buttonToBuy: {
        padding: 4,
        height: 30,
        width: '80%',
        flexDirection: 'row',
        //alignItems: 'center',
        //alignContent: 'center',
        backgroundColor: 'blue',
        justifyContent: 'space-around',
        borderRadius: 5,
        alignItems: 'center'
    },
    coinLogo: {
        width: 15,
        height: 15,
        resizeMode: 'contain',
        //flex: 0.5,
        //width: '15%',
        //height: '100%',
    },
    flatList: {
        
    },
    itemImage: {
        flex: 1,
        width: 50,
        height: 50,
        resizeMode: 'contain'
    },
    item: {
        padding: 10,
        alignItems: 'center',
        height: 200,
        width: 150,
        backgroundColor: '#00AAFF',
        //padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 5,
      },
  });
  