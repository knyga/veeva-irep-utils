const proxyAllIframes = () => {
  const iframes = document.getElementsByTagName('iframe');
  for (let i=0; i<iframes.length; i+=1) {
    proxyIframe(iframes[i]);
  }
};

const checkIsVeevaCLMEvent = (event) => {
  if (event.data) {
    try {
      const p = JSON.parse(event.data);
      return p.isVeevaCLM === true;
    } catch(e) {
      return false;
    }
  }

  return false;
};

const proxyIframe = (iframe) => {
  const handleEvent = (event) => {
    if(checkIsVeevaCLMEvent(event)) {
      const {method, callbackId, arguments} = JSON.parse(event.data);
      com.veeva.clm[method].apply(com.veeva.clm, arguments.concat([(result) => {
          const data = {
            isVeevaCLM: true,
            callbackId: callbackId,
            result,
          };
      iframe.contentWindow.postMessage(JSON.stringify(data), '*');
    }]));
    }
  };

  if(!window.addEventListener) {
    window.attachEvent("onmessage", handleEvent);
  } else {
    window.addEventListener("message", handleEvent, false);
  }
};

const proxyAllIframesOnLoad = () => {
  if (!window || !window.document || !com || !com.veeva || !com.veeva.clm) {
    return;
  }

  if(window.addEventListener) {
    window.addEventListener('load', proxyAllIframes, false);
  } else {
    window.onload = proxyAllIframes;
  }
};

if (typeof module !== 'undefined') {
  module.exports = {
    proxyAllIframesOnLoad,
    proxyAllIframes,
    proxyIframe,
    checkIsVeevaCLMEvent,
  };
}

if(window) {
  window.proxyAllIframesOnLoad = proxyAllIframesOnLoad;
  window.proxyAllIframes = proxyAllIframes;
  window.proxyIframe = proxyIframe;
  window.checkIsVeevaCLMEvent = checkIsVeevaCLMEvent;
}