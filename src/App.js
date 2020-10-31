import './App.css';
import React, { useRef, useState } from 'react';
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { firebaseConfig } from './environment';
import { Navbar, Button, Card, Form } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';


firebase.initializeApp(firebaseConfig)


const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <Navbar fixed="top" variant="dark" bg="dark">
        <Navbar.Brand href="#home">⚛️🔥 Realtime Chat App</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <SignOut />
        </Navbar.Collapse>
      </Navbar>

      <div className="d-flex justify-content-center">
        <Card style={{ width: '50rem', marginTop: '5rem', marginBottom: '5rem', paddingTop: '2rem' }}>
          <Card.Body><section>
            {user ? <ChatRoom /> : <SignIn />}
          </section></Card.Body>
        </Card>
      </div>


    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
    <h3>Sign-in With Your Google Account</h3>
    <Button style={{marginTop: '2rem'}}  variant="primary" onClick={signInWithGoogle}>Sign in with Google</Button>
    <div style={{marginTop: '2rem'}}>
    <small>Do not violate the community guidelines or you will be banned for life!</small>
    </div>
    </>
  )

}

function SignOut() {
  return auth.currentUser && (
    <Button variant="danger" onClick={() => auth.signOut()}>Sign Out</Button>
  )
}


function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <Form style={{ marginTop: '2rem' }} onSubmit={sendMessage}>
      <Form.Group controlId="formBasicEmail">
        <Form.Control value={formValue} onChange={(e) => setFormValue(e.target.value)} type="text" placeholder="Enter your message" />
      </Form.Group>
      <Button style={{ minWidth: '10rem' }} type="submit" disabled={!formValue} variant="primary" type="submit">
        🕊️
      </Button>
    </Form>

    {/* <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />
      <button type="submit" disabled={!formValue}>🕊️</button>

    </form> */}
  </>)
}


function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
    </div>
  </>)
}

export default App;
