import {joinRoom, selfId} from './torrent.js'

const byId = document.getElementById.bind(document)
const letschat = document.getElementById("enterchat")
const button = document.getElementById("sendbutton")
var room = ''
var getMessage
var sendMessage
var peerInfo
var hashes = {} //So that other nodes don't try to spam a message by replaying it.

button.addEventListener('click', function(){
  if (room) {
    updatePeerInfo()
    var msg = DOMPurify.sanitize(document.getElementById("mymessage").value)
    var timestamp = Math.floor(Date.now() / 1000)
    var themessage = msg + "#!#!#!#" + timestamp
    var encrypted = cryptico.encrypt(themessage, theirpublickey, RSAKeys)
    if(AESkey == 'optional') {
        sendMessage([encrypted.cipher])
    } else {
        sendMessage([CryptoJS.AES.encrypt(encrypted.cipher, AESkey).toString()])
    }
    //NOTE: This method doesn't guarantee they decrypted the message. The best method is to let them send you signed confirmation
    document.getElementById("messages").innerHTML = "You: " + msg + "<br>(seen by " + peerInfo + " peers) <br>" + "Time: " + timestamp + "<br><br>" + document.getElementById("messages").innerHTML
    document.getElementById("mymessage").value = ""
  }
})

letschat.addEventListener('click', function(){
    chatmain()
})

function joinThis(config, rm) {
    room = joinRoom(config, rm)
    room.onPeerJoin(peerId => notify(`${peerId} joined`))
    room.onPeerLeave(peerId => notify(`${peerId} left`))
    ;[sendMessage, getMessage] = room.makeAction('message')
    getMessage(showMessage)
}

function notify(mystring) {
    document.getElementById("messages").innerHTML = DOMPurify.sanitize(mystring) + "<br><br>" + document.getElementById("messages").innerHTML
}

function showMessage(message) {
    if(Crypto.SHA256(message[0]) in hashes) {
        return
    }
    hashes[Crypto.SHA256(message[0])] = 1;
    if(AESkey != "optional") {
        var decrypted = CryptoJS.AES.decrypt(message[0], AESkey).toString(CryptoJS.enc.Utf8);
        var newmessage = cryptico.decrypt(decrypted, RSAKeys)
    }
    else {
        var newmessage = cryptico.decrypt(message[0], RSAKeys)
    }
    
    //This both decrypts and verifies they signed the message
    if(newmessage.signature == "verified" && newmessage.publicKeyString == theirpublickey) {
        var msg = newmessage.plaintext.split("#!#!#!#")[0]
        var timestamp = newmessage.plaintext.split("#!#!#!#")[1]
        document.getElementById("messages").innerHTML = "Them: " + DOMPurify.sanitize(msg) + "<br>Time: " + DOMPurify.sanitize(timestamp) + "<br><br>" + document.getElementById("messages").innerHTML
    }
}

function updatePeerInfo() {
    const count = room.getPeers().length
    peerInfo = count
}

async function chatmain() {
    theirpublickey = document.getElementById("theirpub").value    
    if(publickey == '' || theirpublickey == '') {
        console.log("Please log in and supply the counter-party public key before entering a chat.")
        return
    }
    AESkey = document.getElementById("AESPW").value
    if(AESkey != '') {
        AESkey = Crypto.SHA256(AESkey)
    } else {
        AESkey = 'optional'
    }
    console.log("Welcome to P2P chat")
    var mykeys = []
    mykeys.push(publickey)
    mykeys.push(theirpublickey)
    mykeys.sort()
    var sharedKeys = Crypto.SHA256(mykeys[0]+mykeys[1])
    joinThis({appId: 'Trustero', password: AESkey}, sharedKeys)
    notify("Joined Room - " + sharedKeys)
}