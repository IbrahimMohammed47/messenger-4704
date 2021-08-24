import io from "socket.io-client";
import store from "./store";
import {
  removeOfflineUser,
  addOnlineUser,
  ackConv,
} from "./store/conversations";
import {receiveNewMsg} from "./store/utils/thunkCreators"
const socket = io(window.location.origin);

socket.on("connect", () => {
  console.log("connected to server");

  socket.on("add-online-user", (id) => {
    store.dispatch(addOnlineUser(id));
  }); 

  socket.on("remove-offline-user", (id) => {
    store.dispatch(removeOfflineUser(id));
  });
  socket.on("new-message", (data) => {
    store.dispatch(receiveNewMsg(data.message, data.senderName, data.receiverId));
  });
  socket.on("ack-conv", (data) => {
    store.dispatch(ackConv(data.conversationId));
  });
});

export default socket;
