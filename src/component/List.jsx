import React, { useContext, Fragment } from 'react'
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Checkbox,
  Divider,
} from '@material-ui/core'
import styled from 'styled-components'
import { TodosContext } from '../context/todos'

const Contents = styled.div`
  & {
    flex: 1;
    border-top: 1px solid #ddd;
    margin-top: 10px;
    padding: 10px;
  }
`

const EmptyMessage = styled.div`
  & {
    font-size: 18px;
    color: #aaa;
    padding: 10px;
  }
`

const Text = styled(ListItemText)`
  && {
    opacity: ${({ completed }) => (completed ? '0.9' : '1.0')};
    text-decoration: ${({ completed }) =>
      completed ? 'line-through' : 'none'};
  }
`

export default () => {
  const { todos, update, remove } = useContext(TodosContext)
  return (
    <Contents>
      {todos.length === 0 ? (
        <EmptyMessage>No todos...</EmptyMessage>
      ) : (
        <List>
          {todos.map(todo => (
            <Fragment key={`${todo.id}--fragment`}>
              <ListItem key={`${todo.id}--list`}>
                <Checkbox
                  checked={todo.is_complete}
                  onClick={() => {
                    update({
                      id: todo.id,
                      title: todo.title,
                      is_complete: !todo.is_complete,
                    })
                  }}
                />
                <Text primary={todo.title} completed={todo.is_complete} />
                <ListItemSecondaryAction>
                  <Button
                    color="default"
                    onClick={() => {
                      remove({ id: todo.id })
                    }}
                  >
                    Delete
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider key={`${todo.id}--divider`} />
            </Fragment>
          ))}
        </List>
      )}
    </Contents>
  )
}