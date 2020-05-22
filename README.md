# Run

```
lerna boostrap

# start server
node packages/automerge-server-test

# start client
cd packages/automerge-web
yarn
yarn start

# start cli client
node packages/automerge-client-test
> s a5      # subscribe to 'a5'
> c a5 x 6  # change property 'x' to 6 in document 'a5'
> p a6      # print document 'a5
```

# TODO

- User IDs / user colors
- Presence
- Focus tracking
- "push --force" on click
- UI fields
- Simualte offline by blocking socket
- Client side persistance
- doc list as atom
- offline support

# Questions

- How big can documents get until we run into problems?
- Why is the history not computed on demand
- Why does undo not work after reload? (actorId?)
- How to incrementally persist data on sever?
