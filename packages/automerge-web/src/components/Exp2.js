import React, { useState } from 'react';
import { useRecoilState } from 'recoil';
import { textState } from '../lib/atoms'

function Exp2() {
  const [text, setText] = useRecoilState(textState);
  const [eventlist, setEventList] = useState([]);

  return (
    <code>
      <pre>text: {text}</pre>
      <ul>
      {eventlist.map(item => (
        <li key={item.rev}>{item.title} ({item.rev})</li>
      ))}
      </ul>
    </code>
  );
}

export default Exp2;
