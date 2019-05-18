let veevaCLMChildProxy = null;
class CallbacksRegister {
  constructor() {
    this.collection = {};
    this.pointer = this.getPointerInit();
  }

  getPointerInit() {
    return 1;
  }

  incrementPointer() {
    this.pointer+=1;
  }

  register(callback) {
    const pointer = this.pointer;
    this.collection[pointer] = callback;
    this.incrementPointer();
    return pointer;
  }

  get(id) {
    const callback = this.collection[id];
    this.collection[id] = undefined;
    return callback;
  }
}
const callbacksRegister = new CallbacksRegister();

const checkIsVeevaCLMEvent = (event) => {
  if (event.data) {
    try {
      const p = JSON.parse(event.data);
      return p.isVeevaCLM === true && p.result;
    } catch(e) {
      return false;
    }
  }

  return false;
};

const handleParentEvent = (event) => {
  if (checkIsVeevaCLMEvent(event)) {
    const obj = JSON.parse(event.data);
    handleVeevaCLMEventResult(obj.result, obj.callbackId, obj);
  }
};

const handleVeevaCLMEventResult = (result, callbackId) => {
  if(!result.success) {
    return false;
  }

  callbacksRegister.get(callbackId)(result);
};

const initvVevaCLMChildProxy = () => {
  if(veevaCLMChildProxy === null) {
    if(!window.addEventListener) {
      window.attachEvent("onmessage", handleParentEvent);
    } else {
      window.addEventListener("message", handleParentEvent, false);
    }

    veevaCLMChildProxy = new Proxy({}, {
      get(obj, method) {
        return (...args) => {
          const event = {
            isVeevaCLM: true,
            method,
            arguments: args.slice(0, args.length-1),
            callbackId: callbacksRegister.register(args[args.length-1]),
          };
          window.parent.postMessage(JSON.stringify(event), '*');
        };
      }
    });
  }

  return veevaCLMChildProxy;
};

if (typeof module !== 'undefined') {
  module.exports = {
    initvVevaCLMChildProxy,
    handleVeevaCLMEventResult,
    handleParentEvent,
    checkIsVeevaCLMEvent,
    CallbacksRegister,
    veevaCLMChildProxy,
  };
}

if(window) {
  window.initvVevaCLMChildProxy = initvVevaCLMChildProxy;
  window.handleVeevaCLMEventResult = handleVeevaCLMEventResult;
  window.handleParentEvent = handleParentEvent;
  window.checkIsVeevaCLMEvent = checkIsVeevaCLMEvent;
  window.CallbacksRegister = CallbacksRegister;
  window.veevaCLMChildProxy = veevaCLMChildProxy;
}