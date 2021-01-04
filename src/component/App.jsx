import React from 'react'
import { AuthProvider } from '../context/auth'
import styled from 'styled-components'
import Router from './Router'
import Loading from './Loading'
import Todos from './Todos'
import Login from './Login'
import SignIn from './SignIn'

const Main = styled.div`
  & {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: whitesmoke;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 20px;
  }
`

export default () => (
  <AuthProvider>
    <Main>
      <Router
        renderLoading={() => <Loading />}
        renderTodos={() => <Todos />}
        renderLogin={() => <SignIn />}
      />
    </Main>
  </AuthProvider>
)