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
    var msg = document.getElementById("mymessage").value
    var timestamp = Math.floor(Date.now() / 1000)
    var themessage = msg + "#!#!#!#" + timestamp
    var encrypted = cryptico.encrypt(themessage, theirpublickey, RSAKeys)
    sendMessage([encrypted.cipher])
    //NOTE: This method doesn't guarantee they decrypted the message. The best method is to let them send you signed confirmation
    document.getElementById("messages").innerHTML += "<br><br>You: " + msg + "<br>(seen by " + peerInfo + " peers) <br>" + "Time: " + timestamp
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
    document.getElementById("messages").innerHTML += "<br><br>" + mystring
}

function showMessage(message) {
    console.log(message)
    if(Crypto.SHA256(message[0]) in hashes) {
        return
    }
    hashes[Crypto.SHA256(message[0])] = 1;
    var newmessage = cryptico.decrypt(message[0], RSAKeys)
    //This both decrypts and verifies they signed the message
    if(newmessage.signature == "verified" && newmessage.publicKeyString == theirpublickey) {
        var msg = newmessage.plaintext.split("#!#!#!#")[0]
        var timestamp = newmessage.plaintext.split("#!#!#!#")[1]
        document.getElementById("messages").innerHTML += "<br><br>Them: " + msg + "<br>Time: " + timestamp
    }
}

function updatePeerInfo() {
    const count = room.getPeers().length
    peerInfo = count
}

async function chatmain() {
    console.log("Welcome to P2P chat")
    theirpublickey = document.getElementById("theirpub").value
    var keys = [publickey, theirpublickey].sort()
    var sharedKeys = Crypto.SHA256(keys)
    joinThis({appId: 'Trustero', password: 'optional'}, sharedKeys)
    notify("Joined Room - " + sharedKeys)
}