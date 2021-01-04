import React, {
    createContext,
    useContext,
    useState,
    useMemo,
    useEffect,
    useCallback,
} from 'react'
import { AuthContext } from './auth'
import ApolloClient from "apollo-boost";
import fetch from "node-fetch";
import gql from "graphql-tag";

const TodosContext = createContext()

const TodosProvider = ({ children }) => {
  const [todos, setTodos] = useState([])
  const { currentUser, token, setToken } = useContext(AuthContext)

  const client = useMemo(() => {
    if (!token) {
      setTodos([])
      return null
    }

    return new ApolloClient({
      uri: 'https://fit-lamb-26.hasura.app/v1/graphql',
      fetch: fetch,
      request: (operation) => {
        operation.setContext({
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      },
      // Apollo Boost allows you to specify a custom error link for your client
      onError: async ({ graphQLErrors, networkError, operation, forward }) => {
        if (graphQLErrors) {
          for (let err of graphQLErrors) {
            // handle errors differently based on its error code
            console.log('graphql error!:', err)
            switch (err.extensions.code) {
              case 'invalid-jwt':
                if (err.message.includes('Expired')) {
                  const token = await currentUser.getIdToken(true);
                  console.log('get new token!', token)
                  const headers = operation.getContext().headers
                  operation.setContext({
                    headers: {
                      ...headers,
                      Authorization: `Bearer ${token}`,
                    },
                  });
                  setToken(token)
                  return forward(operation);
                }

                break;
              default:
                console.error(err)
                return forward(operation);
              }
          }
        }
      },
    });
  
  }, [token])

  useEffect(() => {
    if (!client) {
      return
    }

    (async () => {
      const res = await client.query({
        query: gql`
          query MyQuery {
            todos(order_by: {created_at: asc}) {
              id
              title
              is_complete
              created_at
            }
          }
        `
      });
    
      setTodos(res.data.todos);
    })()
  }, [client])

  const add = useCallback(async title => {
    try {
      alert(currentUser.__userId)
      const res = await client.mutate({
        variables: { title: title, uid: currentUser.__userId },
        mutation: gql`
          mutation MyMutation($title: String, $uid: uuid ) {
            insert_todos(objects: {title: $title, user_id: $uid, is_complete: false}) {
              returning {
                id
                title
                is_complete
                created_at
              }
            }
          }
        `
      });

      setTodos([...todos, ...res.data.insert_todos.returning])
    } catch (e) {
      console.error(e)
    }
  }, [todos, client, currentUser])

  const update = useCallback(async ({ id, title, is_complete }) => {
    try {
      const res = await client.mutate({
        variables: { id: id, title: title, is_complete: is_complete },
        mutation: gql`
          mutation MyMutation($title: String, $id: uuid, $is_complete: Boolean) {
            update_todos(where: {id: {_eq: $id}}, _set: {is_complete: $is_complete}) {
              returning {
                id
                title
                is_complete
                created_at
              }
            }
          }
        `
      });

      const newTodos = todos.map(todo => {
        const found = res.data.update_todos.returning.find(updTodo => todo.id === updTodo.id)
        if (found) {
          return found
        }
        return todo
      })

      setTodos(newTodos)
    } catch (e) {
      console.error(e)
    }
  }, [todos, client])

  const remove = useCallback(async ({ id }) => {
    try {
      const res = await client.mutate({
        variables: { id: id },
        mutation: gql`
          mutation MyMutation($id: uuid) {
            delete_todos(where: {id: {_eq: $id}}) {
              returning {
                id
              }
            }
          }
        `
      });

      const newTodos = todos.filter(todo => {
        return !res.data.delete_todos.returning.find(removeTodo => removeTodo.id === todo.id)
      })

      setTodos(newTodos);
    } catch (e) {
      console.error(e)
    }
  }, [todos, client])

  return (
    <TodosContext.Provider value={{ todos, add, update, remove }}>
      {children}
    </TodosContext.Provider>
  )
}

export { TodosContext, TodosProvider }