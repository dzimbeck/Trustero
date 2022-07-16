Trustero P2P a serverless peer to peer decentralized encrypted chat program

This program is unique in that it's completely front end so users can validate that it is completely safe
encrypted with no back doors and completely encrypted chat program. This is possible thanks to the project
"Trystero" which is a WebRTC matchmaking library that uses IPFS, Firebase and BitTorrent for connecting.
Users can run it on their local machine by opening multiple tabs and running "local.bat" to serve the page.
Then they type http://localhost:9000/index.htm

The project currently shows the login procedure, room generation, message signing and encryption process.
The current project status is shown as a demo. It has not been made into a fully fledged chat program.
So there is various things that are not supported. Currently, only two party chat and encryption is supported.
However, the strategy for scaling the project is listed below.

How it works:
1) Users generate a public key with a username and password. This is not saved anywhere, it's only used to save
   their private key in temporary memory for decrypting and signing messages.
2) Next a user will add friends to chat with(group chat is possible but not fully implemented). To add a friend
   they only need to know their public key. Optionally they can add a password for their chat to make it harder
   for the chat room to be entered by other peers. Even so, everything would be encrypted.
3) To enter a room with a friend they use the hash of their public keys for the room name and password if used.
4) To send a message they send a timestamp, the message type, and the message encrypted with their friends public
   key and they sign it with their public key to verify it's actually them. For sending images or audio, just send
   them as base64 for example and proceed as normal.
5) Since there is no servers the strategy for making sure messages arrive take several steps. First they send
   the message only when the other peer is in the room. Then they wait some minutes for a confirmation. If they
   don't get it, they resend the message. The other party will assume if the duplicate message is not sent then
   the confirmation must have also been received.
6) For chat rooms with multiple parties, you may want to limit the size due to browsers not being able to handle
   too many WebRTC peers multicasting at the same time. However I think groups can be quite large.
7) Since it's probably best to not be in too many rooms at once, for people with large friends lists who they are
   not actively chatting with, they can cycle through their rooms in batches of 50-100 at a time. Then every few
   minutes they leave and join another batch. They can prioritize the users they more commonly chat with.

RSA public key cryptography is used for signing and verifying messages. This is extremely useful in serverless
architecture. This is done thanks to the Criptico library which is being used purely on the front end. The
users private keys are basically going to be as strong as whatever username and password they decide to use.