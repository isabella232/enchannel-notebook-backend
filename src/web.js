console.log('loaded!');

// Prompt the user for the baseUrl and wsUrl
const baseUrl = prompt('baseUrl', 'http://localhost:8888');
const domain = baseUrl.split('://').slice(1).join('://');
const wsUrl = prompt('wsUrl', `ws://${domain}`);

// Create a connection options object
const connectionOptions = {
  baseUrl,
  wsUrl,
};

// Run spawn, connect, disconnect, shutdown sequentially
const enchannelBackend = require('./index');
enchannelBackend.spawn(connectionOptions, prompt('kernelName', 'python3')).then(id => {
  console.info('spawned', id);
  return id;
}).catch(err => {
  console.error('could not spawn', err);
  throw err;
}).then(id => {
  return Promise.all([id, enchannelBackend.connect(connectionOptions, id)]);
}).catch(err => {
  console.error('could not connect', err);
  throw err;
}).then(args => {
  const id = args[0];
  const channels = args[1];
  console.info('connected', id, channels);
  return enchannelBackend.disconnect(channels).then(() => id);
}).catch(err => {
  console.error('could not disconnect', err);
  throw err;
}).then(id => {
  return enchannelBackend.shutdown(connectionOptions, id);
}).catch(err => {
  console.error('could not shutdown', err);
  throw err;
});
