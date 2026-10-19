/**
 * Simple multi-tab and room synchronizer using BroadcastChannel and local state.
 * Allows instant live syncing between multiple browser tabs/windows without external server,
 * and sets up foundation for P2P network.
 */

export class PeerNetwork {
  constructor(roomId, onPeerJoin, onPeerLeave, onPeerUpdate, onMessage) {
    this.roomId = roomId;
    this.channelName = `ekalaya_office_${roomId}`;
    this.onPeerJoin = onPeerJoin;
    this.onPeerLeave = onPeerLeave;
    this.onPeerUpdate = onPeerUpdate;
    this.onMessage = onMessage;
    this.channel = null;
    this.myId = null;
    this.heartbeatTimer = null;
  }

  init(myId, myData) {
    this.myId = myId;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      this.channel = new BroadcastChannel(this.channelName);
      this.channel.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      // Announce arrival to existing peers
      this.send({
        type: "PEER_JOIN",
        senderId: this.myId,
        data: myData,
      });

      // Keep alive heartbeat every 2.5s
      this.heartbeatTimer = setInterval(() => {
        this.send({
          type: "HEARTBEAT",
          senderId: this.myId,
        });
      }, 2500);
    }
  }

  handleMessage(msg) {
    if (!msg || msg.senderId === this.myId) return;

    switch (msg.type) {
      case "PEER_JOIN":
        if (this.onPeerJoin) this.onPeerJoin(msg.senderId, msg.data);
        // Reply with own state so new peer sees us
        this.send({
          type: "PEER_REPLY",
          senderId: this.myId,
          targetId: msg.senderId,
          data: this.currentData,
        });
        break;

      case "PEER_REPLY":
        if (msg.targetId === this.myId && this.onPeerJoin) {
          this.onPeerJoin(msg.senderId, msg.data);
        }
        break;

      case "PEER_UPDATE":
        if (this.onPeerUpdate) this.onPeerUpdate(msg.senderId, msg.data);
        break;

      case "CHAT_MESSAGE":
        if (this.onMessage) this.onMessage(msg.data);
        break;

      case "PEER_LEAVE":
        if (this.onPeerLeave) this.onPeerLeave(msg.senderId);
        break;

      default:
        break;
    }
  }

  updateMyState(data) {
    this.currentData = data;
    this.send({
      type: "PEER_UPDATE",
      senderId: this.myId,
      data,
    });
  }

  sendChat(chatObj) {
    this.send({
      type: "CHAT_MESSAGE",
      senderId: this.myId,
      data: chatObj,
    });
  }

  send(payload) {
    if (this.channel) {
      try {
        this.channel.postMessage(payload);
      } catch (err) {
        console.error("Failed to post message", err);
      }
    }
  }

  destroy() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.channel) {
      this.send({
        type: "PEER_LEAVE",
        senderId: this.myId,
      });
      this.channel.close();
      this.channel = null;
    }
  }
}
