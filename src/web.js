// Prompt the user for the baseUrl and wsUrl
const baseUrl = prompt('baseUrl', 'http://localhost:8888');
const domain = baseUrl.split('://').slice(1).join('://');
const wsUrl = prompt('wsUrl', `ws://${domain}`);
const uuid = require('uuid');
const enchannel = require('enchannel');

// Create a connection options object
const connectionOptions = {
  baseUrl,
  wsUrl,
};

function appendColoredText(text, color='black') {
  const pre = document.createElement('pre');
  pre.innerText = String(text);
  pre.style.color = color;
  document.body.appendChild(pre);
}
function info(x) {
  appendColoredText(x, '#777');
  console.info.apply(console, arguments);
}
function error(x) {
  appendColoredText(x, 'red');
  console.error.apply(console, arguments);
}

// Run spawn, connect, disconnect, shutdown sequentially
const enchannelBackend = require('./index');
enchannelBackend.spawn(connectionOptions, prompt('kernelName', 'python3')).then(id => {
  info('spawned', id);
  return id;
}).catch(err => {
  error('could not spawn', err);
  throw err;
}).then(id => {
  return Promise.all([id, enchannelBackend.connect(connectionOptions, id)]);
}).catch(err => {
  error('could not connect', err);
  throw err;
}).then(args => {
  info('connected', args);
  const channels = args[1];
  const msg_id = `execute_${uuid.v4()}`;
  const message = {
    header: {
      msg_id,
      username: '',
      session: '00000000-0000-0000-0000-000000000000',
      msg_type: 'execute_request',
      version: '5.0',
    },
    content: {
      code: 'print("woo")',
      silent: false,
      store_history: true,
      user_expressions: {},
      allow_stdin: false,
    },
  };

  const response = channels.shell
    .filter(enchannel.isChildMessage.bind(null, message))
    .filter(msg => msg.header.msg_type === 'execute_reply')
    .map(msg => msg.content.status)
    .first()
    .toPromise();
  channels.shell.next(message); // send the message
  info('execute message sent');

  return response.then(status => args.concat([status]));
}).catch(err => {
  error('could not send msg', err);
  throw err;
}).then(args => {
  const id = args[0];
  const channels = args[1];
  const status = args[2];
  info(`execute status: ${status}`);
  return enchannelBackend.disconnect(channels).then(() => id);
}).catch(err => {
  error('could not disconnect', err);
  throw err;
}).then(id => {
  return enchannelBackend.shutdown(connectionOptions, id);
}).catch(err => {
  error('could not shutdown', err);
  throw err;
}).then(() => {
  info('shutdown');
});
