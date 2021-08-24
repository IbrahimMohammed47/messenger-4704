import axios from "axios";
import socket from "../../socket";
import store from "../index";
import {
  gotConversations,
  addConversation,
  setNewMessage,
  setSearchedUsers,
  ackConv as ackConvAction
} from "../conversations";
import {setActiveChat} from "../activeConversation"
import { gotUser, setFetchingStatus } from "../user";

axios.interceptors.request.use(async function (config) {
  const token = await localStorage.getItem("messenger-token");
  config.headers["x-access-token"] = token;

  return config;
});

// USER THUNK CREATORS

export const fetchUser = () => async (dispatch) => {
  dispatch(setFetchingStatus(true));
  try {
    const { data } = await axios.get("/auth/user");
    dispatch(gotUser(data));
    if (data.id) {
      socket.emit("go-online", data.id);
    }
  } catch (error) {
    console.error(error);
  } finally {
    dispatch(setFetchingStatus(false));
  }
};

export const register = (credentials) => async (dispatch) => {
  try {
    const { data } = await axios.post("/auth/register", credentials);
    await localStorage.setItem("messenger-token", data.token);
    dispatch(gotUser(data));
    socket.emit("go-online", data.id);
  } catch (error) {
    console.error(error);
    dispatch(gotUser({ error: error.response.data.error || "Server Error" }));
  }
};

export const login = (credentials) => async (dispatch) => {
  try {
    const { data } = await axios.post("/auth/login", credentials);
    await localStorage.setItem("messenger-token", data.token);
    dispatch(gotUser(data));
    socket.emit("go-online", data.id);
  } catch (error) {
    console.error(error);
    dispatch(gotUser({ error: error.response.data.error || "Server Error" }));
  }
};

export const logout = (id) => async (dispatch) => {
  try {
    await axios.delete("/auth/logout");
    await localStorage.removeItem("messenger-token");
    dispatch(gotUser({}));
    socket.emit("logout", id);
  } catch (error) {
    console.error(error);
  }
};

// CONVERSATIONS THUNK CREATORS

export const fetchConversations = () => async (dispatch) => {
  try {
    const { data } = await axios.get("/api/conversations");
    dispatch(gotConversations(data));
  } catch (error) {
    console.error(error);
  }
};


const saveMessage = async (body) => {
  const { data } = await axios.post("/api/messages", body);
  return data;
};

const sendMessage = (data, senderName, receiverId) => {
  socket.emit("new-message", {
    message: data.message,
    senderName,
    receiverId
  });
};

const readAllMsgs = async (conversation) => {  
  const { otherUser, id} = conversation;
  const recipientId = otherUser.id
  const reqBody = {conversationId: id};
  let someMsgsNotSeen = conversation.messages.some(m=>m.senderId===recipientId && !m.seen);
  if (someMsgsNotSeen){
    await postSeenConv(reqBody)
  }      
  return someMsgsNotSeen          
}

const postSeenConv = async(reqBody) =>{
  await axios.put(`/api/conversations/seen`, reqBody);
}

const ackConv = (conversationId) => {
  if(conversationId){
    socket.emit("ack-conv", {conversationId});  
  }
}
// message format to send: {recipientId, text, conversationId}
// conversationId will be set to null if its a brand new conversation
export const postMessage = (body) => async (dispatch) => {  
  try {
    const data = await saveMessage(body); 
    if (!body.conversationId) {
      dispatch(addConversation(body.recipientId, data.message));
    } else {
      dispatch(setNewMessage(data.message));
    }

    sendMessage(data, store.getState().user.username, body.recipientId);
  } catch (error) {
    console.error(error);
  }
};

export const receiveNewMsg = (msg,senderName,receiverId) => async (dispatch)=>{
  const {activeConversation, user} = store.getState();
  const isActiveMeantConv = activeConversation === senderName && user.id === receiverId
  dispatch(setNewMessage({...msg, seen:isActiveMeantConv}));  
  if(isActiveMeantConv){
    ackConv(msg.conversationId);
    await postSeenConv({conversationId: msg.conversationId});
  }
}

export const setActiveConv = (conversation) => async (dispatch) => {
  try {
    dispatch(setActiveChat(conversation.otherUser.username));
    // msgs that curr user haven't seen
    dispatch(ackConvAction(conversation.id))
    const someMsgsNotSeen = await readAllMsgs(conversation);
    if(someMsgsNotSeen){
      ackConv(conversation.id);
    }
  } catch (error) {
    console.error(error);
  }
};


export const searchUsers = (searchTerm) => async (dispatch) => {
  try {
    const { data } = await axios.get(`/api/users/${searchTerm}`);
    dispatch(setSearchedUsers(data));
  } catch (error) {
    console.error(error);
  }
};
