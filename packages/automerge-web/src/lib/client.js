
// const Automerge = require('automerge')
const AutomergeClient = require('automerge-client').default
const socket = new WebSocket("ws://localhost:8001/automerge")

export const client = new AutomergeClient({
  socket,
  savedData: (() => {
    return localStorage.getItem('automerge') || null;
  })(),
  save: data => {
    localStorage.setItem('automerge', data)
  },
})
