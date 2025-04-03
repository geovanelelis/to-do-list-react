import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyDNuESwcRkf9wAkggN0CuIcKaIZCwp23uQ',
  authDomain: 'tarefinhas-3521e.firebaseapp.com',
  projectId: 'tarefinhas-3521e',
  storageBucket: 'tarefinhas-3521e.firebasestorage.app',
  messagingSenderId: '951125732810',
  appId: '1:951125732810:web:77493821dbeb009ba93333',
}

const firebaseApp = initializeApp(firebaseConfig)

const db = getFirestore(firebaseApp)
const auth = getAuth(firebaseApp)

export { db, auth }
