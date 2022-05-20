import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState, useContext } from 'react';
import {View, Text, StyleSheet, Button, SafeAreaView, Modal, Alert, FlatList, Image, ActivityIndicator, TouchableOpacity} from 'react-native'
import {GameContext} from './gameContext'
import ProgressBar from 'react-native-progress/Bar'
import {API_URL} from '@env'
import { LoadingView } from './loadingView';
import { imgs } from './imgs';

export const Game = () => {
    const [oppDamage, setOppDamage] = useState(-1)
    const [playerDamage, setPlayerDamage] = useState(-1)
    const [isGame, setIsGame] = useContext(GameContext)
    const [modalConcedeVisible, setModalConcedeVisible] = useState(false)
    const [modalManaVisible, setModalManaVisible] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [data, setData] = useState([])
    const [playerCurrentHP, setPlayerCurrentHP] = useState(100)
    const [playerCurrentMana, setPlayerCurrentMana] = useState(10)
    const [oppCurrentHP, setOppCurrentHP] = useState(10)
    const [playerMaxHP, setPlayerMaxHP] = useState(100)
    const [playerMaxMana, setPlayerMaxMana] = useState(100)
    const [oppMaxHP, setOppMaxHP] = useState(10)
    const [rewards, setRewards] = useState([])
    const [blockTime, setBlockTime] = useState(0)
    const [gameResult, setGameResult] = useState('')
    const [modalResultVisible, setModalResultVisible] = useState(false)
    const [gameEnded, setGameEnded] = useState(false)


    const sendResult = async(result ) => {
        const response = await fetch(`${API_URL}/gameResult`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: await AsyncStorage.getItem('@token'),
                result: result,
                oppLvl: data.oppLvl,
            })
        })
        setGameResult(result)
        const json = await response.json()

        //проблемы с минтом (зачастую из-за стейка кпу на аккаунте для минта)
        if (response.status == 400){
            Alert.alert('NFT error: ', json.err.details[0].message)
        }
        console.log(json)
        return result == 'win'? setRewards(json) : setBlockTime(json.blockFor) 
    }

    const getData = async() => {

        const response = await fetch (`${API_URL}/startGame`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify ({
                'token': await AsyncStorage.getItem('@token')
            })
            })
        if (response.status == 400){
            Alert.alert(await response.text())
            setIsGame(false)
        }
        else {
            const json = await response.json()
            // console.log(json.strength)
            // console.log(data)
            setPlayerMaxHP(json.vitality*10)
            setPlayerCurrentHP(json.vitality*10)
            setOppMaxHP(json.oppLvl * 10)
            setOppCurrentHP(json.oppLvl * 10)
            setPlayerMaxMana(json.intelligence * 10)
            setPlayerCurrentMana(json.intelligence * 10)
            setData(json)
            return setIsLoading(false)
        }
    }

    const oppAttack = () => {
        if (Math.random() > data.agility / 200) {
            const dmg = Math.floor( (Math.random() + 0.5) * data.oppLvl )
            setPlayerDamage(dmg)
            setPlayerCurrentHP(playerCurrentHP - dmg)
        }
        else setPlayerDamage(0)
    }

    const ResultModal = props => {
        return (
            <Modal
            animationType="slide"
            transparent={true}
            visible={modalResultVisible}
            >
                <View style={styles.container}>
                    <View style={styles.modalView}>
                        <Text>{gameResult.toUpperCase()}!</Text>
                                {gameResult == 'win'? 
                                    <View>
                                        <Text>Your rewards:</Text>

                                        <Text>Exp: {rewards.exp}</Text>
                                        <Text>Gold: {rewards.gold}</Text>
                                        {rewards.nft?
                                        <View>
                                        <Text>NFT: </Text>
                                        <Image style={{width: 50, height: 50}} source={require('./imgs/514470.webp')}/>
                                        </View>
                                        : <Text></Text>}
                                        {rewards.newLevel?
                                            <Text>NEW LEVEL!</Text> : <Text></Text>
                                        }
                                    </View>
                                : <Text> You are blocked for {blockTime} mins </Text>
                                }
                        <Button title='OK' onPress={() => {
                            setIsGame(false)
                        }}/>
                    </View>
                </View>
            </Modal>
        )
    }

    useEffect(() => {
        getData()
    }, [])

    useEffect(async () => {
        if(oppCurrentHP <= 0 && !gameEnded){

            //setIsLoading(true)
            //setOppCurrentHP(oppMaxHP)
            setGameResult('win')
            setGameEnded(true)
            console.log('win')
            await sendResult('win')
            setModalResultVisible(true)
            
        }
    })

    useEffect(async () => {
        if(playerCurrentHP <= 0 && !gameEnded){
            //setPlayerCurrentHP(playerMaxHP)
            setGameEnded(true)
            await sendResult('lose')
            setModalResultVisible(true)
        }
    })


    return (
        isLoading? 
            <LoadingView /> :
        <View style={styles.container}>
            <ResultModal />

            <Modal
            animationType="slide"
            transparent={true}
            visible={modalConcedeVisible}
            >
                <View style={styles.container}>
                    <View style={styles.modalView}>
                        <Text>Do you want to concede?</Text>
                        <Button title='Yes' onPress={async () => {
                            await sendResult('conceded')
                            setModalConcedeVisible(false)
                            setModalResultVisible(true)
                        }}/>
                        <Button title='No' onPress={() => {
                            setModalConcedeVisible(false)
                        }} />
                    </View>
                </View>
            </Modal>

            <Modal
            animationType="slide"
            //transparent={true}
            visible={modalManaVisible}
            >
                <View style={styles.container}>
                    <View style={styles.modalView}>
                        <Text>Not enough mana</Text>
                        <Button title='Ok' onPress={() => {
                            setModalManaVisible(false)
                        }}/>
                    </View>
                </View>
            </Modal>
            
            <View style={{alignItems: 'center'}}>
                <Text>Opp HP</Text>
                <ProgressBar progress={oppCurrentHP /oppMaxHP} animationType='spring' color='pink' width={250} />
                <Text>{oppCurrentHP}</Text>
                
            </View>

            <Image style={styles.oppImg} source={imgs["opp"]} />

            <View style={styles.bottomView}>
                <Text> {oppDamage === -1? '' : oppDamage > 0? `Your opp takes ${oppDamage} damage` : `Your opp dodged the attack`} </Text>
                <Text> {playerDamage === -1? '' : playerDamage > 0? `You take ${playerDamage} damage` : `You dodged the attack`} </Text>

                <Text>Your HP: {playerCurrentHP}</Text>
                <ProgressBar style={{margin: 5}} progress={playerCurrentHP / playerMaxHP } animationType='spring' color='red' width={250} />
                {/* <Text>{playerCurrentHP}</Text> */}
                <Text> Your Mana: {playerCurrentMana} </Text>
                <ProgressBar style={{margin: 5}} progress={playerCurrentMana / playerMaxMana} animationType='spring' color='blue' width={250} />
                {/* <Text>{playerCurrentMana}</Text> */}

                <View style={styles.rowView}>
                    <TouchableOpacity disabled={gameEnded} style={styles.attack} onPress={() => {
                                if (Math.random() > data.oppLvl / 200) {
                                    const dmg = Math.floor( (Math.random() + 0.5) * data.strength )
                                    if (playerCurrentMana < data.intelligence*10 - 9)
                                        setPlayerCurrentMana(playerCurrentMana + 10)
                                    setOppDamage(dmg)
                                    setOppCurrentHP(oppCurrentHP - dmg)
                                }
                                else setOppDamage(0)
                                oppAttack()
                            }}>
                        <View style={styles.typeAttackView}>
                            <Image style={styles.typeAttackImage} source={imgs["attack"]} />
                            <Text>Attack</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity disabled={data.skill1? false : true} style={styles.skill} onPress={() => {
                            if (playerCurrentMana >= data.skill1.damage){
                                setPlayerCurrentMana(playerCurrentMana - data.skill1.cost)
                                setOppDamage(data.skill1.damage)
                                setOppCurrentHP(oppCurrentHP - data.skill1.damage)
                                oppAttack()
                            }
                            else setModalManaVisible(true)
                        }}>
                        <View style={styles.typeAttackView}>
                            <Image style={styles.typeAttackImage} source={imgs["skill"]} />
                            <Text>{data.skill1? `${data.skill1.name}(${data.skill1.cost})`: 'Skill 1'}</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity disabled={data.skill2? false : true} style={styles.skill} onPress={() => {
                            if (playerCurrentMana >= data.skill2.cost){
                                setPlayerCurrentMana(playerCurrentMana - data.skill2.cost)
                                setOppDamage(data.skill2.damage)
                                setOppCurrentHP(oppCurrentHP - data.skill2.damage)
                                oppAttack()
                            }
                            else setModalManaVisible(true)
                        }} >
                    <View style={styles.typeAttackView}>
                            <Image style={styles.typeAttackImage} source={imgs["skill"]} />
                            <Text>{data.skill2? `${data.skill2.name}(${data.skill2.cost})`: 'Skill 1'}</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.concedeButton} onPress={() => setModalConcedeVisible(true)}>
                    <Text>Concede</Text>
                </TouchableOpacity>  
            </View>
        </View>
        
    )
}

const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'space-around',
      margin: 20,
      flex: 1,
    },
    bottomView:{
        alignItems: 'center'
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
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    },
    oppImg: {
        width: '80%',
        height: '50%',
        resizeMode: 'contain'
    },
    progressBar: {
        //width: 200
    },
    rowView: {
        width: '100%',
        flexDirection: 'row',
        //justifyContent: 'center',
        justifyContent: 'space-between',
    },
    typeAttackView: {
        borderRadius: 5,
        paddingVertical: 3,
        flexDirection: 'row',
        width: 100,
        justifyContent: 'space-evenly',
        backgroundColor: 'green'
    },
    attack: {

    },
    skill: {

    },
    typeAttackImage: {
        width: 20,
        height: 20,
    },
    concedeButton: {
        backgroundColor: 'red',
        width: 150,
        height: 25,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        margin: 5
    },
});