import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, TextInput, Image, Alert, KeyboardAvoidingView } from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as firebase from 'firebase'
import db from '../config.js'

export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedData: '',
        buttonState: 'normal',
        scanBookID: '',
        scanUserID: ''
      }
    }

    getCameraPermissions = async (id) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false
      });
    }

    handleBarCodeScanned = async({type, data})=>{
      const {buttonState}=this.state
      if(buttonState==='bookID'){
        this.setState({
          scanned: true,
          scanBookID: data,
          buttonState: 'normal',       
        });
      }
      else if(buttonState==='userID')
        this.setState({
        scanned: true,
        scanUserID: data,
        buttonState: 'normal',       
      });
    }

    handleTransaction=async()=>{
      var transactionMessage
      db.collection('Books').doc(this.state.scanBookID).get()
        .then((doc)=>{
          var book = doc.data();
          if(book.bookAvailability){
            this.initiateBookIssue();
            transactionMessage="Book Issued"
          } else {
            this.initiateBookReturn();
            transactionMessage="Book Returned"
          }
        })
        this.setState({
          transactionMessage : transactionMessage
        })
    }

    initiateBookIssue= async()=>{
      db.collection('Transaction').add({
        'userID': this.state.scanUserID,
        'bookID': this.state.scanBookID,
        'date': firebase.firestore.Timestamp.now().toDate(),
        'transactionType' : 'issue'
      })
      db.collection('Books').doc(this.state.scanBookID).update({'bookAvailability' : false})
      db.collection('Students').doc(this.state.scanUserID).update({'numberOfBooksIssued': firebase.firestore.FieldValue.increment(1)})
      Alert.alert('Book Issued')
      this.setState({scanBookID: '', scanUserID: ''})
    }

    initiateBookReturn= async()=>{
      db.collection('Transaction').add({
        'userID': this.state.scanUserID,
        'bookID': this.state.scanBookID,
        'date': firebase.firestore.Timestamp.now().toDate(),
        'transactionType' : 'return'
      })
      db.collection('Books').doc(this.state.scanBookID).update({'bookAvailability' : true})
      db.collection('Students').doc(this.state.scanUserID).update({'numberOfBooksIssued': firebase.firestore.FieldValue.increment(-1)})
      Alert.alert('Book Returned')
      this.setState({scanBookID: '', scanUserID: ''})
    }

    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <KeyboardAvoidingView behavior='padding' style={styles.container} enabled>
          <View style={styles.container}>
          <View>
            <Image source={require('../assets/booklogo.jpg')} style={{width: 200, height: 200}}/>
            <Text style={{textAlign: 'center', fontSize: 40, fontWeight: 'bold'}}>WILY</Text>
          </View>

          <View style={styles.inputView}>
            <TextInput onChange={text=>{this.setState({scanBookID: text})}} placeholder='Enter the Book ID' value={this.state.scanBookID} style={styles.inputBox}/>
            <TouchableOpacity style={styles.scanButton} onPress={()=>{this.getCameraPermissions('bookID')}}><Text style={styles.ButtonText}>Scan</Text></TouchableOpacity>
          </View>

          <View style={styles.inputView}>
            <TextInput onChange={text=>{this.setState({scanUserID: text})}} placeholder='Enter the User ID' value={this.state.scanUserID} style={styles.inputBox}/>
            <TouchableOpacity style={styles.scanButton} onPress={()=>{this.getCameraPermissions('userID')}}><Text style={styles.ButtonText}>Scan</Text></TouchableOpacity>
          </View>

          <Text style={styles.displayText}>{
            hasCameraPermissions===true ? this.state.scannedData: "Request Camera Permission"
          }</Text>     

          <TouchableOpacity
            onPress={this.getCameraPermissions}
            style={styles.scanButton}>
            <Text style={styles.buttonText}>Scan QR Code</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={this.handleTransaction()}
            style={styles.submitButton}>
            <Text style={styles.SubmitButtonText}>Submit</Text>
          </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
        );
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    },
    submitButton:{
      backgroundColor: '#66BB6A',
      width: 100,
      height: 50,
      borderWidth: 1.5,
    },
    submitButton:{
      padding: 10,
      textAlign: 'center',
      fontSize: 20,
      color: 'white'
    }
  });