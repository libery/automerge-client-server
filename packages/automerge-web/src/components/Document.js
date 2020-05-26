import React, { useState } from 'react';
import { client } from '../lib/client';

function Document({ id }) {
  const document = client.docSet.useDoc(id);
  const meta = client.docSet.useMetaInfo(id);
  const [selected, setSelected] = useState(null);

  const onChange1 = () => {
    const ret = client.change(id, "changed string", doc => {
      if ( !doc.str ) {
        doc.str = '';
      }
      doc.str += String.fromCharCode(64 + Math.random() * 23);
    })
    if (!ret) {
      console.error('Failed to change doc, id does not exist.')
    }
  }

  //
  const onChange2 = () => {
    client.change(id, "appendend to list", doc => {
      if ( !doc.list ) {
        doc.list = [];
      }
      doc.list.push( Math.round(Math.random() * 1000) );
    })
  }

  const onChange3 = () => {
    client.change(id, "incremented number", doc => {
      if (!doc.num) {
        doc.num = 0
      }
      doc.num = doc.num + 1;
    })
  }

  const onChange4 = () => {
    client.change(id, "added field", doc => {
      doc.foobar = "Hello World"
    })
  }

  const onChange5 = () => {
    client.change(id, "removed field", doc => {
      // delete doc.x, doc.z, doc.y
      delete doc.foobar
    })
  }

  const onUndo = () => client.undo(id, "undo changes");
  const onRedo = () => client.redo(id, "redo changes");

  const history = (history) => {
    // [...history].reverse()
    return history.map((item , idx) => {
      if (idx === 0) return null;
      return (<li
        onMouseEnter={() => setSelected(idx)}
        onMouseLeave={() => setSelected(null)}
        key={idx}>
          <code>
          {item.change.message || item.change.ops[0].action}
          </code>
        </li>)
    })
  }

  return (
    <div style={{ display: 'flex' }}>
      <div>
        <code>
          {/* document id: {id} */}
          {selected
            ? <pre>{JSON.stringify(meta.history[ selected ].snapshot, null, 2)}</pre>
            : <pre>{JSON.stringify(document, null, 2)}</pre> }
          {/* <pre>canUndo: {meta.canUndo ? 'Yes' : "No"} / canRedo: {meta.canRedo ? 'Yes' : "No"}</pre> */}
        </code>
        <div>
          <button onClick={onChange1}>str += "?"</button>
          <button onClick={onChange2}>list.push(...)</button>
          <button onClick={onChange3}>num += 1</button>
          <button onClick={onChange4}>add prop</button>
          <button onClick={onChange5}>rem prop</button>
          <button onClick={onUndo} disabled={!meta.canUndo}>undo</button>
          <button onClick={onRedo} disabled={!meta.canRedo}>redo</button>
        </div>
      </div>
      <div>
        <h3>History</h3>
        <ul className="history">
          {history(meta.history)}
        </ul>
      </div>
    </div>
  );
}

export default Document;
