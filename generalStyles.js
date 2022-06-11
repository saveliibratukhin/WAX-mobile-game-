import {View, Text, StyleSheet, Button, Alert} from 'react-native'

export const generalStyles = StyleSheet.create({
    smallText: {
        fontFamily: 'Wander Over Yonder Regular',
        //textShadowColor: 'blue',
        //textShadowRadius: 1,
        fontSize: 19,
        
    },
    bigText: {
        fontFamily: 'Wander Over Yonder Regular',
        textShadowColor: 'black',
        textShadowRadius: 2,
        fontSize: 50,
        color: 'blue'
    },
    // bigText: {
    //     fontFamily: 'Wander Over Yonder Regular',
    //     //textShadowColor: 'blue',
    //     //textShadowRadius: 1,
    //     fontSize: 70,
    //     color: 'blue'
    // },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        //position: 'relative'
    },
    scrollView: {
        width: '100%'
    },
    button: {
        margin: 5,
        padding: 4,
        height: 30,
        width: '80%',
        flexDirection: 'row',
        //alignItems: 'center',
        //alignContent: 'center',
        backgroundColor: '#3333FF',
        justifyContent: 'space-around',
        borderRadius: 5,
        alignItems: 'center'
    },
    buttonText: {
        fontFamily: 'Wander Over Yonder Regular',
        color: '#E0E0E0',
        fontSize: 19,
        textShadowColor: 'black',
        textShadowRadius: 3,
    }
})