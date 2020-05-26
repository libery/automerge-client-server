import Automerge from 'automerge'
import DocSet from './docSetRecoil'

const DEBUG = false;

function unique(el, i, list) {
  return list.indexOf(el) === i
}

function defer() {
  let deferred = {}
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve
    deferred.reject = reject
  })
  return deferred
}

function doSave(docSet) {
  const ret = {}
  for (const docId of docSet.docIds) {
    let doc = docSet.getDoc(docId)
    ret[docId] = Automerge.save(doc)
  }
  return JSON.stringify(ret)
}

function doLoad(string) {
  if (!string) return {}
  const docs = JSON.parse(string)
  const ret = {}
  const docSet = new DocSet();
  for (const [docId, doc] of Object.entries(docs)) {
    ret[docId] = Automerge.load(doc)
    // docSet.setDoc(docId, doc)
  }
  // Object.keys(docs).forEach(docId => {
  //   this.docSet.setDoc(docId, docs[ docId ])
  // })
  return ret
}

function appendData(text) {
  return text + ' ' + (new Date()).toLocaleString();
}

export default class AutomergeClient {
  constructor({ socket, save, savedData, onChange } = {}) {
    if (!socket) {
      throw new Error('You have to specify websocket as socket param')
    }

    this.socket = socket
    this.save = save

    this.deferred = [];
    this.onChange = onChange
    // this.subscribeList = []
    this.connection = null
    this.simulateOffline = false

    // this.docSet = doLoad(savedData)

    this.docSet = new DocSet();
    this.docSet.registerHandler(this._onDocChange.bind(this))

    socket.addEventListener('message', this._onMessage.bind(this))
    socket.addEventListener('open', this._onOpen.bind(this))
    socket.addEventListener('close', this._onClose.bind(this))
    socket.addEventListener('error', evt => console.log('error', evt))
    socket.addEventListener('connecting', evt => console.log('connecting', evt))
  }

  _sendMessage(data) {
    if ( this.simulateOffline ) {
      return
    }
    this.socket.send(JSON.stringify(data))
  }

  _onMessage(msg) {
    if ( this.simulateOffline ) {
      return
    }

    const frame = JSON.parse(msg.data)
    //DEBUG &&
    console.log('message', frame.action)

    switch(frame.action) {
      case 'automerge': {
        this.connection.receiveMsg(frame.data)
      } break;
      case 'error': {
        console.error('Recieved server-side error ' + frame.message)
      } break;
      case 'subscribed': {
        console.log('Subscribed to ' + JSON.stringify(frame.id))
      } break;
      // TODO: userlist
      default: {
        console.warn('Unknown action "' + frame.action + '"')
      }
    }
  }

  _onOpen() {
    // DEBUG &&
    console.log('open')
    this.connection = new Automerge.Connection(
      this.docSet,
      (data) => {
        this._sendMessage({ action: 'automerge', data })
      }
    );
    this.connection.open()
    this.subscribe([
      ...this.docSet.docIds,
      // ...this.subscribeList
    ]);
  }

  _onDocChange(docId, doc) {
    // DEBUG &&
    console.log('_onDocChange', docId);
    if ( docId in this.deferred ) {
      this.deferred[ docId ].resolve(doc);
    }

    const info = {
      canUndo: this.canUndo(docId),
      canRedo: this.canRedo(docId),
      history: this.getHistory(docId),
    }
    this.docSet.updateInfo(docId, info)

    if (this.save) {
      this.save(doSave(this.docSet))
    }

    if (this.onChange) {
      this.onChange(docId, this.docSet.getDoc(docId))
    }
  }

  _onClose() {
    // DEBUG &&
    console.log('close')
    if (this.connection) {
      this.connection.close()
    }
    // this.docSet = null
    this.connection = null
  }

  change(id, text, changer) {
    let doc = this.docSet.getDoc(id);
    doc = Automerge.change(doc, appendData(text), changer)
    this.docSet.setDoc(id, doc)
    return true
  }

  undo(id, text) {
    let doc = this.docSet.getDoc(id);
    doc = Automerge.undo(doc, appendData(text))
    this.docSet.setDoc(id, doc)
    return true
  }

  redo(id, text) {
    let doc = this.docSet.getDoc(id);
    doc = Automerge.redo(doc, appendData(text))
    this.docSet.setDoc(id, doc)
    return true
  }

  canUndo(id) {
    let doc = this.docSet.getDoc(id);
    return Automerge.canUndo(doc)
  }

  canRedo(id) {
    let doc = this.docSet.getDoc(id);
    return Automerge.canRedo(doc)
  }

  getHistory(id) {
    return Automerge.getHistory(this.docSet.getDoc(id))
  }

  subscribe(ids) {
    if (ids.length <= 0) return
    console.log('Trying to subscribe to ' + JSON.stringify(ids))
    if (this.socket.readyState === 1) {
      // OPEN
      ids = ids.filter(unique)
      this._sendMessage({ action: 'subscribe', ids })
      return ids.map(docId => {
        return ( this.deferred[docId] = defer() ).promise
      })
    } else {
      // TODO: Keep track of subscriptions before channel is open
      // this.subscribeList = this.subscribeList.concat(ids).filter(unique)
      return [];
    }
    // return this.subscribeList;
  }

  unsubscribe(ids) {
    if (ids.length <= 0) return

    if (this.socket.readyState === 1) {
      // OPEN
      ids = ids.filter(unique)
      this._sendMessage({ action: 'unsubscribe', ids })
      // this.subscribeList = this.subscribeList.filter((value) => {
      //   return !ids.includes(value)
      // })
      ids.forEach(docId => {
        this.docSet.removeDoc(docId)
        if ( docId in this.deferred ) {
          this.deferred[ docId ].reject()
          delete this.deferred[ docId ]
        }
      })
    }
  }

  get subscribeList() {
    return this.docSet.docIds;
  }

  setOfflineStatus(offline) {
    this.simulateOffline = offline;
  }
}
