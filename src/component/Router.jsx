import React, { Fragment, useContext } from 'react'
import { AuthContext } from '../context/auth'

export default ({ renderLoading, renderLogin, renderTodos }) => {
  const { currentUser, loading } = useContext(AuthContext)

  return (
    <Fragment>
      {loading ? renderLoading() : currentUser ? renderTodos() : renderLogin()}
    </Fragment>
  )
}