# Puller-js

Ajax long-polling library for JavaScript and Laravel Echo


## Installation

```bash
npm install puller-js
```

## Usage

### Laravel Echo

```js
import Puller from 'puller-js';
import Echo from 'laravel-echo';
window.Echo = new Echo({
    broadcaster: Puller.echoConnect,
});
```

### Standalone

```js
import Puller from 'puller-js';
window.Puller=new Puller({
    error_delay: 10000,
    url:'/puller/messages',
    auth: {
        endpoint: '/broadcasting/auth',
        headers: {},
        data:{},
    },
});

// Listen for events
window.Puller.channel('channel-name').listen('event', (data) => {
    console.log(data);
});

// Listen for all events
window.Puller.channel('channel-name').listen('*', (data,event) => {
    console.log(event,data);
});

```