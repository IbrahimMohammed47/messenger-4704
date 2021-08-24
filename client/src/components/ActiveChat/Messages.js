import React from "react";
import { Box } from "@material-ui/core";
import { SenderBubble, OtherUserBubble } from "../ActiveChat";
import moment from "moment";

const getLastMsgIdx = (messages, userId) => {
  for (let i = messages.length-1; i >= 0; i--) {
    if (messages[i].seen && messages[i].senderId === userId){
      return i
    } 
  }
  return -1;
}

const Messages = (props) => {
  const { messages, otherUser, userId } = props;

  const lastSeenMsgIdx = getLastMsgIdx(messages,userId)
  
  return (
    <Box>
      {messages.map((message,idx) => {
        const time = moment(message.createdAt).format("h:mm");
        return message.senderId === userId ? (
          <SenderBubble key={message.id} text={message.text} time={time} lastSeenMsg={lastSeenMsgIdx===idx} otherUser={otherUser}/>
        ) : (
          <OtherUserBubble key={message.id} text={message.text} time={time} otherUser={otherUser} />
        );
      })}
    </Box>
  );
};

export default Messages;
