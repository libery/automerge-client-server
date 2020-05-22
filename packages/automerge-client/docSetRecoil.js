import { DocSet } from 'automerge'
import { atom, useRecoilState } from 'recoil';

const DEBUG = false;

export default class DocSetRecoil extends DocSet {
  constructor () {
    super();
    // this.docs = null;
    this.handlers = new Set()
    this.recoils = {};
    this.recoilsMeta = {};
    this.setters = {};
    this.settersMeta = {};
  }

  get docIds () {
    return this.docs.keys()
  }

  getDoc (docId) {
    DEBUG && console.log('[DocSetRecoil] getDoc', docId);
    return this.docs.get(docId)
  }

  useDoc(docId) {
    DEBUG && console.log('[DocSetRecoil] useDoc', docId);
    const [ state, setState ] = useRecoilState(this.recoils[ docId ]);
    this.setters[ docId ] = setState;
    return state;
  }

  removeDoc (docId) {
    DEBUG && console.log('[DocSetRecoil] removeDoc', docId);
    this.docs = this.docs.delete(docId)
    delete this.recoils[docId]
    delete this.setters[docId]
    delete this.recoilsMeta[docId]
    delete this.settersMeta[docId]
    // Set state to {}?
  }

  setDoc (docId, doc) {
    // TODO: Not getting called after resubscribe
    console.log('[DocSetRecoil] setDoc', docId, doc);
    if ( docId in this.recoils ) {
      const set = this.setters[docId]
      set && set(doc)
    } else {
      this.recoils[docId] = atom({
        key: 'doc/' + docId,
        default: doc,
      });
    }
    this.docs = this.docs.set(docId, doc)
    this.handlers.forEach(handler => handler(docId, doc))
  }

  useMetaInfo(docId) {
    const [ state, setState ] = useRecoilState(this.recoilsMeta[ docId ]);
    this.settersMeta[ docId ] = setState;
    return state;
  }

  updateInfo(docId, info) {
    if ( docId in this.recoilsMeta ) {
      const set = this.settersMeta[docId]
      set && set(info)
    } else {
      this.recoilsMeta[docId] = atom({
        key: 'meta/' + docId,
        default: info,
      });
    }
  }

  registerHandler (handler) {
    this.handlers = this.handlers.add(handler)
  }

  unregisterHandler (handler) {
    this.handlers = this.handlers.delete(handler)
  }
}