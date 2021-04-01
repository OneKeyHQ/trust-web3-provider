var config = {
  address: "%1$s",
  rpcUrl: "%2$s"
  chainId: "%3$s",
};

const provider = new window.Trust(config);
provider.isDebug = true;
window.web3 = new window.Web3(provider);
window.web3.eth.defaultAccount = config.address
window.ethereum = provider
window.chrome = {webstore: {}};

window.webkit = {
  messageHandlers: {
    signMessage: {
      postMessage: (message) => {
        provider.sendResponse(message.id, signed);
      }
    }
  }
};
window.webkit.messageHandlers = {
  signMessage: {
    postMessage: (message) => {
      console.log("signMessage"+JSON.stringify(message))
      Trust.postMessage(message)
    }
  }
  requestAccounts:{
    postMessage: (message) => {
      console.log("requestAccounts"+JSON.stringify(message))
      Trust.postMessage(message)
    }
  }
};

window.web3.setProvider = function () {
  console.debug('OneKey Wallet - overrode web3.setProvider')
}

function executeCallback (id, error, value) {
  if(error == null){
    provider.sendError(id,error);
  }else{
    provider.sendResponse(id,value);
  }
}
