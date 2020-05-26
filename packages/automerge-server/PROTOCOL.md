
# Protocol

## Same in both directions

Object with key action. Other keys depend on action

### automerge

frame.data is forwarded to automerge

### error

prints the error

## Client to server

### subscribe

subscribes to documents identified by frame.ids

### unsubscribe

unsubscribes from documents identified by frame.ids

## Server to client

### subscribed

Sent after successful subscription. Contains id field as doc identifier.
