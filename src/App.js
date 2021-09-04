import './App.css';
import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'
import 'firebase/compat/auth'

import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { useRef, useState } from 'react';


firebase.initializeApp({
  apiKey: "AIzaSyBjOvWIZExOPj_TEIlYtbLPctsA_tW0eNo",
  authDomain: "superchat-c4303.firebaseapp.com",
  projectId: "superchat-c4303",
  storageBucket: "superchat-c4303.appspot.com",
  messagingSenderId: "847577548382",
  appId: "1:847577548382:web:158a11c8de1e4e662856cf"
})

const auth = firebase.auth()
const firestore = firebase.firestore()

function App() {

  const [user] = useAuthState(auth)

  return (
    <div className="App">
      <header>
        <SignOut/>
      </header>
      <section>
          {user ? <ChatRoom /> : <SignIn />}
        </section>
    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider()
    auth.signInWithPopup(provider)
  }

  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {
  const messagesRef = firestore.collection('messages')
  const query = messagesRef.orderBy('createdAt').limit(25)
  const [messages] = useCollectionData(query, { idField: 'id' })
  const [formValue, setFormValue] = useState('')
  const dummy = useRef()
  console.log(auth.currentUser)
  const sendMessage = async (e) => {
    e.preventDefault()
    let { uid, photoURL } = auth.currentUser
    console.log(uid, photoURL)
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })
    setFormValue('')
    dummy.current.scrollIntoView({behavior: 'smooth'})
  }
  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy}></div>
      </main>
      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={e => setFormValue(e.target.value)} />
        <button type="submit">SEND</button>
      </form>
    </>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'
  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
    </div>
  )
}

export default App;
