import React, { useState } from 'react';
import { client } from '../lib/client';
import Document from "./Document"

const id = 'a3';

function Exp1() {
  const [ready, setReady] = useState(false);

  const onClickSubscribe = () => {
    const plist = client.subscribe([ id ]);
    Promise.all(plist).then((res) => {
      setReady(true)
    })
  }

  const onClickUnsubscribe = () => {
    if ( ready ) {
      client.unsubscribe([ id ]);
      setTimeout(() => {
        setReady(false)
      }, 500)
    }
  }

  return (
    <>
      <div>
        <button onClick={onClickSubscribe} disabled={ready}>
          Subscribe
        </button>
        <button onClick={onClickUnsubscribe} disabled={!ready}>
          Unsubscribe
        </button>
      </div>
      {ready ? <Document id={id} /> : null}
      <code>
        {/* <pre>{JSON.stringify(client.docSet.getDoc(id), null, 2)}</pre> */}
        {/* <pre>{JSON.stringify(client, null, 2)}</pre> */}
      </code>
    </>
  );
}

export default Exp1;
