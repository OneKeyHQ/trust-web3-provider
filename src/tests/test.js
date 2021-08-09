// Copyright © 2017-2020 Trust Wallet.
//
// This file is part of Trust. The full Trust copyright notice, including
// terms governing use, modification, and redistribution, is contained in the
// file LICENSE at the root of the source code distribution tree.

"use strict";

var ethUtil = require("ethereumjs-util");
var signUtil = require("eth-sig-util");
require("../index");
const trustwallet = window.trustwallet;
const Web3 = require("web3");

const address = "0xcaaf133b00d04b964798f6aa040b445263b458b0";
const privateKey = "0x5e5c0a55709bfb193b97de696114ad97e9578126e47823e0edf3d5abecd74f71";

const mainnet = {
  address: address,
  chainId: 1,
  rpcUrl: "https://mainnet.infura.io/v3/<key>",
};

const ropsten = {
  address: address,
  chainId: 3,
  rpcUrl: "https://ropsten.infura.io/apikey",
};

const bsc = {
  address: address,
  chainId: 56,
  rpcUrl: "https://bsc-dataseed1.binance.orge",
};

describe("TrustWeb3Provider constructor tests", () => {
  test("test constructor.name", () => {
    const provider = new trustwallet.Provider({});
    const web3 = new trustwallet.Web3(provider);
    expect(web3.currentProvider.constructor.name).toBe("TrustWeb3Provider");
  });

  test("test setAddress", () => {
    const provider = new trustwallet.Provider({
      chainId: 1,
      rpcUrl: "",
    });
    const currentAddress = mainnet.address;
    expect(provider.address).toBe("");

    provider.setAddress(currentAddress);
    expect(provider.address).toBe(address.toLowerCase());
    expect(provider.ready).toBeTruthy();
  });

  test("test change setAddress", (done) => {
    const provider = new trustwallet.Provider({
      chainId: 1,
      rpcUrl: "",
    });
    const currentAddress = mainnet.address;
    expect(provider.address).toBe("");

    provider.on('accountsChanged', (accounts) => {
      expect(accounts[0]).toBe(address.toLowerCase());
      expect(provider.ready).toBeTruthy();
      done();
    });

    provider.onekeyChangeAddress(currentAddress);

  });

  test("test setConfig", (done) => {
    const provider = new trustwallet.Provider(ropsten);
    const web3 = new Web3(provider);

    expect(web3.currentProvider.chainId).toEqual("0x3");

    web3.currentProvider.setConfig(mainnet);
    expect(web3.currentProvider.chainId).toEqual("0x1");
    expect(web3.currentProvider.rpc.rpcUrl).toBe(mainnet.rpcUrl);

    expect(provider.request).not.toBeUndefined;
    expect(provider.on).not.toBeUndefined;

    web3.version.getNetwork((error, id) => {
      expect(id).toBe("0x1");
      done();
    });
  });

  test("test change RpcUrl", () => {
    const provider = new trustwallet.Provider(ropsten);
    const web3 = new Web3(provider);

    expect(web3.currentProvider.chainId).toEqual("0x3");

    web3.currentProvider.setConfig(mainnet);

    var changeRpcUrl = "https://www.baidu.com"

    provider.onekeyChangeRpcUrl(changeRpcUrl)
    expect(provider.rpc.rpcUrl).toBe(changeRpcUrl);
  });

  test("test change chainId", (done) => {
    const provider = new trustwallet.Provider(ropsten);
    const web3 = new Web3(provider);

    expect(web3.currentProvider.chainId).toEqual("0x3");

    web3.currentProvider.setConfig(mainnet);

    var changeChainId = 5

    provider.on('chainChanged', (chainId) => {
      expect(chainId).toBe("0x5");
      done();
    });

    provider.onekeyChangeChainId(changeChainId)
  });

  test("test change chainId And RpcUrl", (done) => {
    const provider = new trustwallet.Provider(ropsten);
    const web3 = new Web3(provider);

    expect(web3.currentProvider.chainId).toEqual("0x3");

    web3.currentProvider.setConfig(mainnet);

    var changeChainId = 5
    var changeRpcUrl = "https://www.baidu.com"

    provider.on('chainChanged', (chainId) => {
      expect(chainId).toBe("0x5");
      expect(provider.rpc.rpcUrl).toBe(changeRpcUrl);
      done();
    });

    provider.onekeyChangeChainId(changeChainId, changeRpcUrl)
  });

  test("test send method", (done) => {
    const provider = new trustwallet.Provider(bsc);
    const web3 = new Web3(provider);

    let request = { jsonrpc: "2.0", method: "eth_chainId", id: 123 };

    provider.request(request).then((chainId) => {
      expect(chainId).toEqual("0x38");
    });

    web3.currentProvider.send("eth_chainId").then((result) => {
      expect(result.result).toEqual("0x38");
    }).catch((error) => {
      console.error(error)
      done(error);
    });

    web3.currentProvider.send(request, (error, result) => {
      expect(result).toEqual("0x38");
    });

    let response = web3.currentProvider.send(request);
    expect(response.result).toEqual("0x38");

    web3.currentProvider.sendAsync(request, (error, result) => {
      expect(result.result).toEqual("0x38");
      done();
    });
  });

  test("test eth_chainId", (done) => {
    const provider = new trustwallet.Provider(bsc);
    const web3 = new Web3(provider);

    let request = { jsonrpc: "2.0", method: "eth_chainId", id: 123 };

    provider.request(request).then((chainId) => {
      expect(chainId).toEqual("0x38");
      done();
    });

    const response = web3.currentProvider.send(request);
    expect(response.result).toBe("0x38");

    web3.currentProvider.sendAsync(request, (error, result) => {
      expect(result.result).toEqual("0x38");
      done();
    });
  });

  test("test eth_accounts", (done) => {
    const provider = new trustwallet.Provider(mainnet);
    const web3 = new Web3(provider);
    const addresses = [address];

    web3.eth.getAccounts((error, accounts) => {
      expect(accounts).toEqual(addresses);
      done();
    });

    provider.request({ method: "eth_accounts" }).then((accounts) => {
      expect(accounts).toEqual(addresses);
      done();
    });

    web3.currentProvider.sendAsync(
      { method: "eth_accounts" },
      (error, data) => {
        expect(data.result).toEqual(addresses);
        done();
      }
    );
  });

  test("test eth_sign", (done) => {
    const provider = new trustwallet.Provider(mainnet);
    const web3 = new Web3(provider);
    const addresses = [address];

    var hash = ethUtil.keccak256(
      Buffer.from("An amazing message, for use with MetaMask!", "utf8")
    );
    var hex = "0x" + hash.toString("hex");

    var sign = ethUtil.ecsign(hash, ethUtil.toBuffer(privateKey))
    const signed = ethUtil.bufferToHex(ethUtil.toRpcSig(sign.v, sign.r, sign.s))

    trustwallet.postMessage = (message) => {
      provider.sendResponse(message.id, signed);
    };

    web3.eth.sign(addresses[0], hex, (err, result) => {
      expect(result).toEqual(signed);
      done();
    });
  });

  test("test personal_sign", (done) => {
    const provider = new trustwallet.Provider(bsc);

    const signed = signUtil.personalSign(ethUtil.toBuffer(privateKey), { "version": "0.1.2", "timestamp": "1602823075", "token": "0x4b0f1812e5df2a09796481ff14017e6005508003", "type": "vote", "payload": { "proposal": "QmSV53XuYi28XfdNHDhBVp2ZQwzeewQNBcaDedRi9PC6eY", "choice": 1, "metadata": {} } })

    trustwallet.postMessage = (message) => {
      const buffer = Buffer.from(message.object.data);
      if (buffer.length === 0) {
        throw new Error("message is not hex!");
      }
      provider.sendResponse(message.id, signed);
    };

    const request = {
      method: "personal_sign",
      params: [
        "{\"version\":\"0.1.2\",\"timestamp\":\"1602823075\",\"token\":\"0x4b0f1812e5df2a09796481ff14017e6005508003\",\"type\":\"vote\",\"payload\":{\"proposal\":\"QmSV53XuYi28XfdNHDhBVp2ZQwzeewQNBcaDedRi9PC6eY\",\"choice\":1,\"metadata\":{}}}",
        "0x9d8A62f656a8d1615C1294fd71e9CFb3E4855A4F",
      ],
      id: 1602823075454,
    };

    expect(Buffer.from(request.params[0], "hex").length).toEqual(0);

    provider.request(request).then((result) => {
      expect(result).toEqual(signed);
      done();
    });
  });

  test("test eth_signTypedData_v4", (done) => {
    const provider = new trustwallet.Provider(mainnet);
    const signed =
      "0x7aff0e37900fc2eb5e78c56b07246a0904b3ba642cab17917d7524110b83fe04296790ff076a7dd31b2a11ded9fcbe3959fe872b7c18fa79f5146807855fcce41b";

    trustwallet.postMessage = (message) => {
      provider.sendResponse(message.id, signed);
    };

    const request = require("./eth_signTypedData_v4.json");

    provider.request(request).then((result) => {
      expect(result).toEqual(signed);
      done();
    });
  });
  
  test("test personal_sign custom customMethodMessage signMessageHash", (done) => {
    trustwallet.customMethodMessage = {
      signMessageHash: {
        postMessage: (message) => {
          var hashMessage = ethUtil.keccak256(ethUtil.toBuffer(message.object.data))
          var sign = ethUtil.ecsign(hashMessage, ethUtil.toBuffer(privateKey))
          var signMessage = ethUtil.bufferToHex(signUtil.concatSig(sign.v, sign.r, sign.s))

          provider.sendResponse(message.id, signMessage);
        }
      }
    }

    const provider = new trustwallet.Provider(bsc);
    provider.isDebug = true;

    var messageHex = '{"version":"0.1.2","timestamp":"1602823075","token":"0x4b0f1812e5df2a09796481ff14017e6005508003","type":"vote","payload":{"proposal":"QmSV53XuYi28XfdNHDhBVp2ZQwzeewQNBcaDedRi9PC6eY","choice":1,"metadata":{}}}'

    const signed = signUtil.personalSign(ethUtil.toBuffer(privateKey), { data: messageHex });
    const request = {
      method: "personal_sign",
      params: [
        messageHex,
        address,
      ],
      id: 1602823075,
    };

    expect(Buffer.from(request.params[0], "hex").length).toEqual(0);

    provider.request(request).then((result) => {
      expect(result).toEqual(signed);
      done();
    });
  });

  test("test eth_sign custom customMethodMessage signMessageHash", (done) => {
    trustwallet.customMethodMessage = {
      signMessageHash: {
        postMessage: (message) => {
          var hashMessage = ethUtil.keccak256(ethUtil.toBuffer(message.object.data))
          var signMessage = ethUtil.ecsign(hashMessage, ethUtil.toBuffer(privateKey))
          var signMessageHex = ethUtil.bufferToHex(signUtil.concatSig(signMessage.v, signMessage.r, signMessage.s))
          provider.sendResponse(message.id, signMessageHex);
        }
      }
    }

    const provider = new trustwallet.Provider(mainnet);

    var messageHex = ethUtil.bufferToHex(
      ethUtil.keccak256(
        ethUtil.toBuffer("An amazing message, for use with MetaMask!", 'utf8')
      )
    );

    const messageBuffer = ethUtil.toBuffer(messageHex)
    var hash = ethUtil.keccak256(messageBuffer);
    var sign = ethUtil.ecsign(hash, ethUtil.toBuffer(privateKey))
    const signed = ethUtil.bufferToHex(signUtil.concatSig(sign.v, sign.r, sign.s))

    const request = {
      method: "eth_sign",
      params: [
        address,
        messageHex,
      ],
      id: 160282307545,
    };

    expect(Buffer.from(request.params[0], "hex").length).toEqual(0);

    provider.request(request).then((result) => {
      expect(result).toEqual(signed);
      done();
    });
  });

  test("test eth_sign utf8 String custom customMethodMessage signMessageHash", (done) => {
    trustwallet.customMethodMessage = {
      signMessageHash: {
        postMessage: (message) => {
          var hashMessage = ethUtil.keccak256(ethUtil.toBuffer(message.object.data))
          var signMessage = ethUtil.ecsign(hashMessage, ethUtil.toBuffer(privateKey))
          var signMessageHex = ethUtil.bufferToHex(signUtil.concatSig(signMessage.v, signMessage.r, signMessage.s))
          provider.sendResponse(message.id, signMessageHex);
        }
      }
    }

    const provider = new trustwallet.Provider(mainnet);

    var messageHex = "An amazing message, for use with MetaMask!"
    const signed = signUtil.personalSign(ethUtil.toBuffer(privateKey), { data: messageHex });

    const request = {
      method: "eth_sign",
      params: [
        address,
        messageHex,
      ],
      id: 160282307545,
    };

    expect(Buffer.from(request.params[0], "hex").length).toEqual(0);

    provider.request(request).then((result) => {
      expect(result).toEqual(signed);
      done();
    });
  });

  test("test eth_signTypedData V1 custom customMethodMessage signTypedData", (done) => {
    trustwallet.customMethodMessage = {
      signMessageHash: {
        postMessage: (message) => {
          var hashMessage = ethUtil.keccak256(ethUtil.toBuffer(message.object.data))
          var signMessage = ethUtil.ecsign(hashMessage, ethUtil.toBuffer(privateKey))
          var signMessageHex = ethUtil.bufferToHex(signUtil.concatSig(signMessage.v, signMessage.r, signMessage.s))
          provider.sendResponse(message.id, signMessageHex);
        }
      }
    }

    const provider = new trustwallet.Provider(mainnet);

    const typedData = [
      {
        type: 'string',
        name: 'Message',
        value: 'Hi, Alice!'
      },
      {
        type: 'uint32',
        name: 'A number',
        value: '1337'
      }
    ]

    const msgParams = { data: typedData }

    const signed = signUtil.signTypedMessage(ethUtil.toBuffer(privateKey), msgParams, 'V1')

    const request = {
      method: "eth_signTypedData",
      params: [typedData, address],
      id: 16028230754,
    };

    provider.request(request).then((result) => {
      expect(result).toEqual(signed);
      done();
    });
  });

  test("test eth_signTypedData V3 custom customMethodMessage signTypedData", (done) => {
    trustwallet.customMethodMessage = {
      signMessageHash: {
        postMessage: (message) => {
          var hashMessage = ethUtil.keccak256(ethUtil.toBuffer(message.object.data))
          var signMessage = ethUtil.ecsign(hashMessage, ethUtil.toBuffer(privateKey))
          var signMessageHex = ethUtil.bufferToHex(signUtil.concatSig(signMessage.v, signMessage.r, signMessage.s))
          provider.sendResponse(message.id, signMessageHex);
        }
      }
    }

    const provider = new trustwallet.Provider(mainnet);

    const typedData = JSON.stringify({
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallet', type: 'address' },
        ],
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person' },
          { name: 'contents', type: 'string' },
        ],
      },
      primaryType: 'Mail',
      domain: {
        name: 'Ether Mail',
        version: '1',
        chainId: 1,
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      },
      message: {
        from: {
          name: 'Cow',
          wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
        },
        to: {
          name: 'Bob',
          wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
        },
        contents: 'Hello, Bob!',
      },
    })

    const msgParams = { data: JSON.parse(typedData) }

    const signed = signUtil.signTypedMessage(ethUtil.toBuffer(privateKey), msgParams, 'V3')

    const request = {
      method: "eth_signTypedData_v3",
      params: [typedData, address],
      id: 16028130754,
    };

    provider.request(request).then((result) => {
      expect(result).toEqual(signed);
      done();
    });
  });

  test("test eth_signTypedData V4 string custom customMethodMessage signTypedData", (done) => {
    trustwallet.customMethodMessage = {
      signMessageHash: {
        postMessage: (message) => {
          var hashMessage = ethUtil.keccak256(ethUtil.toBuffer(message.object.data))
          var signMessage = ethUtil.ecsign(hashMessage, ethUtil.toBuffer(privateKey))
          var signMessageHex = ethUtil.bufferToHex(signUtil.concatSig(signMessage.v, signMessage.r, signMessage.s))
          provider.sendResponse(message.id, signMessageHex);
        }
      }
    }

    const provider = new trustwallet.Provider(mainnet);

    const typedData = JSON.stringify({
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallets', type: 'address[]' },
        ],
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person[]' },
          { name: 'contents', type: 'string' },
        ],
        Group: [
          { name: 'name', type: 'string' },
          { name: 'members', type: 'Person[]' },
        ],
      },
      domain: {
        name: 'Ether Mail',
        version: '1',
        chainId: 1,
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      },
      primaryType: 'Mail',
      message: {
        from: {
          name: 'Cow',
          wallets: [
            '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
            '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
          ],
        },
        to: [{
          name: 'Bob',
          wallets: [
            '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
            '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
            '0xB0B0b0b0b0b0B000000000000000000000000000',
          ],
        }],
        contents: 'Hello, Bob!',
      },
    })

    const msgParams = { data: JSON.parse(typedData) }

    const signed = signUtil.signTypedMessage(ethUtil.toBuffer(privateKey), msgParams, 'V4')

    const request = {
      method: "eth_signTypedData_v4",
      params: [typedData, address],
      id: 16028130754,
    };

    provider.request(request).then((result) => {
      expect(result).toEqual(signed);
      done();
    });
  });

  test("test eth_signTypedData V4 object custom customMethodMessage signTypedData", (done) => {
    trustwallet.customMethodMessage = {
      signMessageHash: {
        postMessage: (message) => {
          var hashMessage = ethUtil.keccak256(ethUtil.toBuffer(message.object.data))
          var signMessage = ethUtil.ecsign(hashMessage, ethUtil.toBuffer(privateKey))
          var signMessageHex = ethUtil.bufferToHex(signUtil.concatSig(signMessage.v, signMessage.r, signMessage.s))
          provider.sendResponse(message.id, signMessageHex);
        }
      }
    }

    const provider = new trustwallet.Provider(mainnet);

    const typedData = {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallets', type: 'address[]' },
        ],
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person[]' },
          { name: 'contents', type: 'string' },
        ],
        Group: [
          { name: 'name', type: 'string' },
          { name: 'members', type: 'Person[]' },
        ],
      },
      domain: {
        name: 'Ether Mail',
        version: '1',
        chainId: 1,
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      },
      primaryType: 'Mail',
      message: {
        from: {
          name: 'Cow',
          wallets: [
            '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
            '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
          ],
        },
        to: [{
          name: 'Bob',
          wallets: [
            '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
            '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
            '0xB0B0b0b0b0b0B000000000000000000000000000',
          ],
        }],
        contents: 'Hello, Bob!',
      },
    }

    const msgParams = { data: typedData }

    const signed = signUtil.signTypedMessage(ethUtil.toBuffer(privateKey), msgParams, 'V4')

    const request = {
      method: "eth_signTypedData_v4",
      params: [typedData, address],
      id: 16028130754,
    };

    provider.request(request).then((result) => {
      expect(result).toEqual(signed);
      done();
    });
  });


  test("test personal_ecRecover custom customMethodMessage personalEcRecover", (done) => {
    trustwallet.customMethodMessage = {
      signMessageHash: {
        postMessage: (message) => {
          var hashMessage = ethUtil.keccak256(ethUtil.toBuffer(message.object.data))
          var signMessage = ethUtil.ecsign(hashMessage, ethUtil.toBuffer(privateKey))
          var signMessageHex = ethUtil.bufferToHex(signUtil.concatSig(signMessage.v, signMessage.r, signMessage.s))
          provider.sendResponse(message.id, signMessageHex);
        }
      },
      personalEcRecover: {
        postMessage: (message) => {
          provider.sendResponse(message.id, message.object.data);
        }
      }
    }

    const provider = new trustwallet.Provider(mainnet);

    var messageHex = ethUtil.bufferToHex(Buffer.from("hello", 'utf8'))

    const request = {
      method: "personal_sign",
      params: [messageHex, address],
      id: 16028230754,
    };


    provider.request(request).then((result) => {

      var recoverRequest = {
        method: "personal_ecRecover",
        params: [messageHex, result],
        id: 16026230754,
      };

      provider.request(recoverRequest).then((recoverResult) => {
        expect(recoverResult).toEqual(address);
        done();
      });
    });
  });
}); // end of top describe()
