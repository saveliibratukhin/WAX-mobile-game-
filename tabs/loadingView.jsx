import React, { useEffect, useState, useContext } from 'react';
import {View, Text, StyleSheet, Button, Alert, ImageBackground} from 'react-native'
import { imgs } from './imgs';
import { generalStyles } from '../generalStyles';

export const LoadingView = props => {
    return  (<ImageBackground source={imgs.bgLoading} style={[generalStyles.container, {justifyContent: 'flex-end', paddingBottom: 20}]}>
        <Text style={generalStyles.bigText}>Loading...</Text>
    </ImageBackground>)
}
