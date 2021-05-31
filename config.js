import firebase from 'firebase'

require('@firebase/firestore')

var firebaseConfig = {
    apiKey: "AIzaSyB5QGYy-SyTeycIyQHJLi145pGDhg0HWmg",
    authDomain: "wireless-library-e65dc.firebaseapp.com",
    databaseURL: "https://wireless-library-e65dc.firebaseio.com",
    projectId: "wireless-library-e65dc",
    storageBucket: "wireless-library-e65dc.appspot.com",
    messagingSenderId: "363500401601",
    appId: "1:363500401601:web:9fea461a3f28e38f70f540"
  };
  // Initialize Firebase
  if(!firebase.apps.length){
    firebase.initializeApp(firebaseConfig);
  }

export default firebase.firestore()