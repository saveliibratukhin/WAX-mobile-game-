import React, { useEffect, useState, useContext } from 'react';
import {View, Text, StyleSheet, FlatList, ActivityIndicator, Image, Button, Alert, TouchableOpacity} from 'react-native'
import {API_URL} from '@env'
import { imgs } from './imgs';
import AsyncStorage from '@react-native-async-storage/async-storage';


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
        <View style= {styles.container}>
            <Text>SHOP</Text>
            {isLoading? <ActivityIndicator /> :            
                <FlatList
                    style={styles.flatList}
                    data={items}
                    numColumns={2}
                    renderItem={({item}) => (
                        <View style={styles.item}>
                            <Text>{item.data.data.name}</Text>
                            <Image style={styles.itemImage} source={imgs[item.template]} />
                            <Text>{item.data.data.decription}</Text>
                            <TouchableOpacity style={styles.buttonToBuy} onPress={() => {
                                    buyItem(item.template, item.cost, item.data.schema)
                                }}>
                                    <View style={{justifyContent: 'center'}}>
                                        <Text>{item.cost}</Text>
                                    </View>
                                    <Image style={styles.coinLogo} source={imgs["coin"]} />
                            </TouchableOpacity>

                        </View>
                    )}
                />}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      backgroundColor: '#aaa',
      alignItems: 'center',
      justifyContent: 'center',
      //margin: 20,
    },
    item: {
        alignItems: 'center',
        height: 80,
        width: 60,
        backgroundColor: '#f9c2ff',
        //padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
      },
    buttonToBuy: {
        padding: 4,
        height: 30,
        width: '80%',
        flexDirection: 'row',
        //alignItems: 'center',
        //alignContent: 'center',
        backgroundColor: 'red',
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
        backgroundColor: '#f9c2ff',
        //padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 5,
      },
  });
  