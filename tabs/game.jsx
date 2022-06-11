import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState, useContext } from 'react';
import {View, Text, StyleSheet, Button, SafeAreaView, Modal, Alert, FlatList, Image, ActivityIndicator, TouchableOpacity, ImageBackground} from 'react-native'
import {GameContext} from './gameContext'
import ProgressBar from 'react-native-progress/Bar'
import {API_URL} from '@env'
import { LoadingView } from './loadingView';
import { imgs } from './imgs';
import { generalStyles } from '../generalStyles';

//тут выдаёт ошибку при запуске компонента, всё дело в хэдере

export const Game = () => {
    const [oppDamage, setOppDamage] = useState(-1)
    const [playerDamage, setPlayerDamage] = useState(-1)
    const [isGame, setIsGame] = useContext(GameContext)
    const [modalConcedeVisible, setModalConcedeVisible] = useState(false)
    const [modalManaVisible, setModalManaVisible] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [data, setData] = useState([])
    const [playerCurrentHP, setPlayerCurrentHP] = useState(-1)
    const [playerCurrentMana, setPlayerCurrentMana] = useState(-1)
    const [oppCurrentHP, setOppCurrentHP] = useState(-1)
    const [playerMaxHP, setPlayerMaxHP] = useState(100)
    const [playerMaxMana, setPlayerMaxMana] = useState(100)
    const [oppMaxHP, setOppMaxHP] = useState(10)
    const [rewards, setRewards] = useState([])
    const [blockTime, setBlockTime] = useState(0)
    const [gameResult, setGameResult] = useState('')
    const [modalResultVisible, setModalResultVisible] = useState(false)
    const [gameEnded, setGameEnded] = useState(false)


    const sendResult = async(result ) => {
        console.log('send result')
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
        console.log(response.status)
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
            
            setData(json.stats)

            console.log( json)
            setPlayerMaxHP(json.stats.vitality*10)
            setOppMaxHP(json.stats.oppLvl * 10)
            setPlayerMaxMana(json.stats.intelligence * 10)

            if (json.isAlreadyInGame){
                setPlayerCurrentHP(json.stats.playerCurrentHP == -1? json.stats.vitality * 10 : json.stats.playerCurrentHP)
                setOppCurrentHP(json.stats.oppCurrentHP == -1? json.stats.oppLvl * 10 : json.stats.oppCurrentHP)
                setPlayerCurrentMana(json.stats.playerCurrentMana == -1? json.stats.intelligence * 10 : json.stats.playerCurrentMana)
            } 
            else {
                setPlayerCurrentHP(json.stats.vitality*10)
                setOppCurrentHP(json.stats.oppLvl * 10)
                setPlayerCurrentMana(json.stats.intelligence * 10)
            }

            return setIsLoading(false)
        }
    }

    const setGameData = async() => {
        console.log('set game data')
        const response = await fetch(`${API_URL}/setGameData`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: await AsyncStorage.getItem('@token'),
                playerCurrentHP,
                playerCurrentMana,
                oppCurrentHP
            })
        })
        if (response.status == 400){
            Alert.alert(await response.text())
        }
        return
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
                                        <Image style={{width: 50, height: 50}} source={imgs['Mystery Chest']}/>
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

    // useEffect(() => {
    //     setGameData()
    // }, [playerCurrentHP, playerCurrentMana, oppCurrentHP])

    useEffect(async () => {
        console.log('effect')
        if (playerCurrentHP > 0 && playerCurrentMana > 0 && oppCurrentHP > 0)
            setGameData()

        else if(oppCurrentHP <= 0 && !gameEnded && !isLoading){

            //setIsLoading(true)
            //setOppCurrentHP(oppMaxHP)
            setGameResult('win')
            setGameEnded(true)
            console.log('win')
            await sendResult('win')
            setModalResultVisible(true)
            
        }

        else if(playerCurrentHP <= 0 && !gameEnded && !isLoading){
            //setPlayerCurrentHP(playerMaxHP)
            setGameEnded(true)
            await sendResult('lose')
            setModalResultVisible(true)
        }
    }, [playerCurrentHP, playerCurrentMana , oppCurrentHP] )

    // useEffect(async() => {
    //     if(oppCurrentHP <= 0 && !gameEnded && !isLoading){
    //         setGameResult('win')
    //         setGameEnded(true)
    //         console.log('win')
    //         await sendResult('win')
    //         setModalResultVisible(true)
            
    //     }
    // })

    // useEffect(async () => {
    //     if(playerCurrentHP <= 0 && !gameEnded && !isLoading){
    //         //setPlayerCurrentHP(playerMaxHP)
    //         setGameEnded(true)
    //         await sendResult('lose')
    //         setModalResultVisible(true)
    //     }
    // })


    return (
        isLoading? 
            <LoadingView /> :
        <ImageBackground source={imgs.bgGame} style={generalStyles.container}>
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
                    <Text style={generalStyles.smallText} > Goblin {data.oppLvl} level </Text>
                    <Text style={generalStyles.smallText} >Opp HP</Text>
                    <ProgressBar progress={oppCurrentHP /oppMaxHP} animationType='spring' color='pink' width={250} />
                    <Text style={generalStyles.smallText} >{oppCurrentHP}</Text>
                    
                </View>
                
                <View style={styles.oppImgContainer}>
                    <Image style={styles.oppImg} source={imgs["opp"]}  resizeMode='contain' />
                </View>

                <View style={styles.bottomView}>
                    <Text style={generalStyles.smallText} > {oppDamage === -1? '' : oppDamage > 0? `Your opp takes ${oppDamage} damage` : `Your opp dodged the attack`} </Text>
                    <Text style={generalStyles.smallText} > {playerDamage === -1? '' : playerDamage > 0? `You take ${playerDamage} damage` : `You dodged the attack`} </Text>

                    <Text style={generalStyles.smallText} >Your HP: {playerCurrentHP}</Text>
                    <ProgressBar style={{margin: 5}} progress={playerCurrentHP / playerMaxHP } animationType='spring' color='red' width={250} />
                    {/* <Text>{playerCurrentHP}</Text> */}
                    <Text style={generalStyles.smallText} > Your Mana: {playerCurrentMana} </Text>
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
                                <Text style={generalStyles.smallText} >Attack</Text>
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
                                <Text style={[generalStyles.smallText, {fontSize: 15}]} >{data.skill1? `${data.skill1.name}(${data.skill1.cost})`: 'Skill 1'}</Text>
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
                                <Text style={[generalStyles.smallText, {fontSize: 15}]} >{data.skill2? `${data.skill2.name}(${data.skill2.cost})`: 'Skill 2'}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.concedeButton} onPress={() => setModalConcedeVisible(true)}>
                        <Text style={generalStyles.smallText} >Concede</Text>
                    </TouchableOpacity>  
                </View>
            </View>
        </ImageBackground>
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
    oppImgContainer: {
        //flex: 1,
        //width: '60%',
        height: '60%',
        //backgroundColor: 'grey',
        //position: 'absolute',
        justifyContent: 'center',
        top: 0, left: 0, right: 0, bottom: 0,
        //resizeMode: 'contain',
        //position: 'absolute',
        
    },
    oppImg: {
        position: 'absolute',
        alignSelf: 'center',
        //width: '80%',
        height: '100%',
        
        //top: 0, left: 0, right: 0, bottom: 0,

        //flex: 1,
        //width: '100%',
        //height: '100%',
        //resizeMode: 'center',
        // position: 'absolute',
        // top: '50%',
        // left: '50%',
        // transform: [{scale: 3}]
        
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
        backgroundColor: 'green',
        height: 30,
        alignItems: 'center'
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
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        margin: 5
    },
});