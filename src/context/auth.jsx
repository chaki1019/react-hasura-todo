import React, { createContext, useState, useCallback, useEffect } from 'react'
import firebase from '../firebase'

const AuthContext = createContext()

const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [token, setToken] = useState(null)

  const signup = useCallback(async (email, password) => {
    try {
      setLoading(true)
      await firebase.auth().createUserWithEmailAndPassword(email, password)
    } catch (e) {
      console.error(e.code, e.message)
    }
  }, [])

  const signin = useCallback(async (email, password) => {
    try {
      setLoading(true)
      await firebase.auth().signInWithEmailAndPassword(email, password)
    } catch (e) {
      console.error(e.code, e.message)
    }
  }, [])

  const signout = useCallback(async () => {
    try {
      setLoading(true)
      await firebase.auth().signOut()
      setLoading(false)
      setCurrentUser(null)
      setToken(null)
    } catch (e) {
      console.error(e.code, e.message)
    }
  }, [])

  useEffect(() => {
    firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        const token = await user.getIdToken(true);
        const idTokenResult = await user.getIdTokenResult();
        const hasuraClaims = idTokenResult.claims['https://hasura.io/jwt/claims'];
        
        if (hasuraClaims) {
          user.__userId = hasuraClaims["x-hasura-user-id"];
          setLoading(false)
          setCurrentUser(user)
          setToken(token)
        } else {
          // Tokenのリフレッシュを検知するためにコールバックを設定する
          const userRef = firebase.firestore().collection("user_meta").doc(user.uid);
          userRef.onSnapshot(async () => {
            console.log('snapshot!!!')
            const token = await user.getIdToken(true);
            const idTokenResult = await user.getIdTokenResult();
            const hasuraClaims = idTokenResult.claims['https://hasura.io/jwt/claims'];
            console.log('*** hasuraClaims',hasuraClaims)
            if (hasuraClaims) {
              user.__userId = hasuraClaims["x-hasura-user-id"];
              setLoading(false)
              setCurrentUser(user)
              setToken(token)
            }
          });
        }
      } else {
        setLoading(false)
      }
    })
  }, [])

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        signup,
        signin,
        signout,
        loading,
        token,
        setToken
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext, AuthProvider }