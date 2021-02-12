__fuse.bundle({

// node_modules/fuse-box/modules/fuse-box-websocket/index.js @3
3: function(__fusereq, exports, module){
const events = __fusereq(4);
function log(text) {
  console.info(`%c${text}`, 'color: #237abe');
}
class SocketClient {
  constructor(opts) {
    opts = opts || ({});
    const port = opts.port || window.location.port;
    const protocol = location.protocol === 'https:' ? 'wss://' : 'ws://';
    const domain = location.hostname || 'localhost';
    if (opts.connectionURL) {
      this.url = opts.connectionURL;
    } else {
      if (opts.useCurrentURL) {
        this.url = protocol + location.hostname + (location.port ? ':' + location.port : '');
      }
      if (opts.port) {
        this.url = `${protocol}${domain}:${opts.port}`;
      }
    }
    this.authSent = false;
    this.emitter = new events.EventEmitter();
  }
  reconnect(fn) {
    setTimeout(() => {
      this.emitter.emit('reconnect', {
        message: 'Trying to reconnect'
      });
      this.connect(fn);
    }, 5000);
  }
  on(event, fn) {
    this.emitter.on(event, fn);
  }
  connect(fn) {
    setTimeout(() => {
      log(`Connecting to FuseBox HMR at ${this.url}`);
      this.client = new WebSocket(this.url);
      this.bindEvents(fn);
    }, 0);
  }
  close() {
    this.client.close();
  }
  send(eventName, data) {
    if (this.client.readyState === 1) {
      this.client.send(JSON.stringify({
        name: eventName,
        payload: data || ({})
      }));
    }
  }
  error(data) {
    this.emitter.emit('error', data);
  }
  bindEvents(fn) {
    this.client.onopen = event => {
      log('Connection successful');
      if (fn) {
        fn(this);
      }
    };
    this.client.onerror = event => {
      this.error({
        reason: event.reason,
        message: 'Socket error'
      });
    };
    this.client.onclose = event => {
      this.emitter.emit('close', {
        message: 'Socket closed'
      });
      if (event.code !== 1011) {
        this.reconnect(fn);
      }
    };
    this.client.onmessage = event => {
      let data = event.data;
      if (data) {
        let item = JSON.parse(data);
        this.emitter.emit(item.name, item.payload);
      }
    };
  }
}
exports.SocketClient = SocketClient;

},

// node_modules/fuse-box/modules/events/index.js @4
4: function(__fusereq, exports, module){
function EventEmitter() {
  this._events = this._events || ({});
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;
EventEmitter.EventEmitter = EventEmitter;
EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;
EventEmitter.defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function (n) {
  if (!isNumber(n) || n < 0 || isNaN(n)) throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};
EventEmitter.prototype.emit = function (type) {
  var er, handler, len, args, i, listeners;
  if (!this._events) this._events = {};
  if (type === 'error') {
    if (!this._events.error || isObject(this._events.error) && !this._events.error.length) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er;
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }
  handler = this._events[type];
  if (isUndefined(handler)) return false;
  if (isFunction(handler)) {
    switch (arguments.length) {
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++) listeners[i].apply(this, args);
  }
  return true;
};
EventEmitter.prototype.addListener = function (type, listener) {
  var m;
  if (!isFunction(listener)) throw TypeError('listener must be a function');
  if (!this._events) this._events = {};
  if (this._events.newListener) this.emit('newListener', type, isFunction(listener.listener) ? listener.listener : listener);
  if (!this._events[type]) this._events[type] = listener; else if (isObject(this._events[type])) this._events[type].push(listener); else this._events[type] = [this._events[type], listener];
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }
    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' + 'leak detected. %d listeners added. ' + 'Use emitter.setMaxListeners() to increase limit.', this._events[type].length);
      if (typeof console.trace === 'function') {
        console.trace();
      }
    }
  }
  return this;
};
EventEmitter.prototype.on = EventEmitter.prototype.addListener;
EventEmitter.prototype.once = function (type, listener) {
  if (!isFunction(listener)) throw TypeError('listener must be a function');
  var fired = false;
  function g() {
    this.removeListener(type, g);
    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }
  g.listener = listener;
  this.on(type, g);
  return this;
};
EventEmitter.prototype.removeListener = function (type, listener) {
  var list, position, length, i;
  if (!isFunction(listener)) throw TypeError('listener must be a function');
  if (!this._events || !this._events[type]) return this;
  list = this._events[type];
  length = list.length;
  position = -1;
  if (list === listener || isFunction(list.listener) && list.listener === listener) {
    delete this._events[type];
    if (this._events.removeListener) this.emit('removeListener', type, listener);
  } else if (isObject(list)) {
    for (i = length; i-- > 0; ) {
      if (list[i] === listener || list[i].listener && list[i].listener === listener) {
        position = i;
        break;
      }
    }
    if (position < 0) return this;
    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }
    if (this._events.removeListener) this.emit('removeListener', type, listener);
  }
  return this;
};
EventEmitter.prototype.removeAllListeners = function (type) {
  var key, listeners;
  if (!this._events) return this;
  if (!this._events.removeListener) {
    if (arguments.length === 0) this._events = {}; else if (this._events[type]) delete this._events[type];
    return this;
  }
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }
  listeners = this._events[type];
  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    while (listeners.length) this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];
  return this;
};
EventEmitter.prototype.listeners = function (type) {
  var ret;
  if (!this._events || !this._events[type]) ret = []; else if (isFunction(this._events[type])) ret = [this._events[type]]; else ret = this._events[type].slice();
  return ret;
};
EventEmitter.prototype.listenerCount = function (type) {
  if (this._events) {
    var evlistener = this._events[type];
    if (isFunction(evlistener)) return 1; else if (evlistener) return evlistener.length;
  }
  return 0;
};
EventEmitter.listenerCount = function (emitter, type) {
  return emitter.listenerCount(type);
};
function isFunction(arg) {
  return typeof arg === 'function';
}
function isNumber(arg) {
  return typeof arg === 'number';
}
function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
function isUndefined(arg) {
  return arg === void 0;
}

},

// node_modules/fuse-box/modules/fuse-box-hot-reload/clientHotReload.ts @2
2: function(__fusereq, exports, module){
exports.__esModule = true;
const {SocketClient} = __fusereq(3);
function log(text) {
  console.info(`%c${text}`, 'color: #237abe');
}
const STYLESHEET_EXTENSIONS = ['.css', '.scss', '.sass', '.less', '.styl'];
function gatherSummary() {
  const modules = [];
  for (const id in __fuse.modules) {
    modules.push(parseInt(id));
  }
  return {
    modules
  };
}
function createHMRHelper(payload) {
  const {updates} = payload;
  let isStylesheeetUpdate = true;
  for (const item of updates) {
    const file = item.path;
    const s = file.match(/(\.\w+)$/i);
    const extension = s[1];
    if (!STYLESHEET_EXTENSIONS.includes(extension)) {
      isStylesheeetUpdate = false;
    }
  }
  return {
    isStylesheeetUpdate,
    callEntries: () => {
      const appEntries = [1];
      for (const entryId of appEntries) {
        __fuse.r(entryId);
      }
    },
    callModules: modules => {
      for (const item of modules) __fuse.r(item.id);
    },
    flushAll: () => {
      __fuse.c = {};
    },
    flushModules: modules => {
      for (const item of modules) {
        __fuse.c[item.id] = undefined;
      }
    },
    updateModules: () => {
      for (const update of updates) {
        new Function(update.content)();
      }
    }
  };
}
exports.connect = opts => {
  let client = new SocketClient(opts);
  client.connect();
  client.on('get-summary', data => {
    const {id} = data;
    const summary = gatherSummary();
    client.send('summary', {
      id,
      summary
    });
  });
  client.on('reload', () => {
    window.location.reload();
  });
  client.on('hmr', payload => {
    const {updates} = payload;
    const hmr = createHMRHelper(payload);
    const hmrModuleId = undefined;
    if (hmrModuleId) {
      const hmrModule = __fuse.r(hmrModuleId);
      if (!hmrModule.default) throw new Error('An HMR plugin must export a default function');
      hmrModule.default(payload, hmr);
      return;
    }
    hmr.updateModules();
    if (hmr.isStylesheeetUpdate) {
      log(`Flushing ${updates.map(item => item.path)}`);
      hmr.flushModules(updates);
      log(`Calling modules ${updates.map(item => item.path)}`);
      hmr.callModules(updates);
    } else {
      log(`Flushing all`);
      hmr.flushAll();
      log(`Calling entries all`);
      hmr.callEntries();
    }
  });
};

}
}, function(){
__fuse.r(1)
const hmr = __fuse.r(2);
hmr.connect({"useCurrentURL":true})
})