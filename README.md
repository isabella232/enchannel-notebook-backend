# [WIP] enchannel-notebook-backend
![enchannel version](https://img.shields.io/badge/enchannel-1.1-ff69b4.svg)

:notebook: An enchannel backend that lets you connect to a [Jupyter notebook server](https://github.com/jupyter/notebook).

## Installation

```bash
npm install enchannel-notebook-backend
```

## Usage

Enchannel-notebook-backend provides an API for spawning, disconnecting, and
shutting down remote kernels in addition to implementing the enchannel spec.  A
typical use would be to spawn a kernel, connect to the kernel and communicate
using enchannel and Jupyter message specs, disconnect from the kernel, and
optionally shut it down.

The act of connecting and disconnecting is deliberately separate to the act of
spawning and shutting down a kernel.  This allows one to spawn a kernel, start
some compute on it, disconnect and reconnect at a later time, and shutdown the
kernel when appropriate.

To use the enchannel-notebook-backend, you must have access to a running [Jupyter notebook server](https://github.com/jupyter/notebook).  This library requires the Jupyter notebook server to be launched with an explicit origin.  If you want to listen to all connections, launch the notebook server like so:

```bash
python -m notebook --NotebookApp.allow_origin="*"
```

#### connectionOptions

The connectionOptions object is used in almost every method described below.
It's analogous to the `endpoint` used in
[enchannel-socketio-backend](https://github.com/nteract/enchannel-socketio-backend).
A connectionOptions object looks like the following:

```js
const connectionOptions = {
  baseUrl: 'http://localhost:8888',
  wsUrl: 'ws://localhost:8888',
};
```

Where `baseUrl` is the base URL of the notebook server  
and `wsUrl` is the websocket URL of the notebook server.

#### spawn
Spawns a remote kernel by name.  Takes two arguments:

 - connectionOptions, object - connections object, see above  
 - kernelName, string - name of the kernel to spawn  

Returns a promise with the kernel id, string.

```
spawn(connectionOptions, kernelName)
```

Usage example

```js
const enchannelBackend = require('enchannel-notebook-backend');
enchannelBackend.spawn(connectionOptions, 'python3').then(id => {
  console.log('spawned', id);
}).catch(err => {
  console.error('Could not spawn the kernel', err);
});
```

#### connect
Connects to a remote kernel by id.  Accepts two arguments:

 - connectionOptions, object - connections object, see above  
 - kernelId, string - id of the kernel to connect to  

Returns a promise for an [enchannel spec channels
object](https://github.com/nteract/enchannel)

```
connect(connectionOptions, kernelId)
```

Usage example

```js
enchannelBackend.connect(connectionOptions, id).then(channels => {
  console.log('connected', channels);
}).catch(err => {
  console.error('Could not connect to the kernel', err);
});
```

For API usage of the enchannel `channels` object, refer to the [enchannel spec README](https://github.com/nteract/enchannel).

#### shutdown
Shuts down a remote kernel by id.  Accepts two arguments:

 - connectionOptions, object - connections object, see above  
 - kernelId, string - id of the kernel to shutdown  

Returns a promise which resolves when the shutdown is complete.

```
shutdown(connectionOptions, kernelId)
```

Usage example

```js
enchannelBackend.shutdown(connectionOptions, id).then(() => {
  console.log('shutdown');
}).catch(err => {
  console.error('Could not shutdown the kernel', err);
});
```

#### disconnect

Disconnects from a kernel by closing the channels.  Accepts one argument, the enchannel channels object.

Returns promise which resolves on success.

```
disconnect(channels)
```

Usage example

```js
enchannelBackend.disconnect(channels).then(() => {
  console.log('disconnected');
}).catch(err => {
  console.error('Could not close the channels', err);
});
```

## Development
To develop against enchannel-notebook-backend, first clone the repo then from within the
cloned folder run:

```bash
npm install
npm link
```

Before opening a pull request, please run the unit tests locally:

```bash
npm test
```

You can also verify that the code works by hand by opening the `test.html` file
in your web browser and following the promps.
