import React, { useEffect, useState, useContext } from 'react';
import {View, Text, StyleSheet, Button, Alert} from 'react-native'

export const LoadingView = props => {
    return  (<View style={styles.container}>
        <Text>Loading...</Text>
    </View>)
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      margin: 20,
    },
})