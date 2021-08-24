import React from "react";
import { Box, Typography, Badge } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "space-between",
    marginLeft: 20,
    flexGrow: 1,
  },
  username: {
    fontWeight: "bold",
    letterSpacing: -0.2,
  },
  previewText: {
    fontSize: 12,
    color: "#9CADC8",
    letterSpacing: -0.17,
  },
  previewTextUnseen: {
    fontSize: 12,
    fontWeight: "bolder",
    color: "#000000",
    letterSpacing: -0.17,
  },
  unseenCount:{
    height: 25,
    width: 25,
    marginRight: 30,
    marginTop: 18
  }
}));

const ChatContent = (props) => {
  const classes = useStyles();

  const { conversation } = props;
  const { latestMessageText, otherUser } = conversation;
  return (
    <Box className={classes.root}>
      <Box>
        <Typography className={classes.username}>
          {otherUser.username}
        </Typography>
        <Typography className={conversation.notSeenCount<=0?classes.previewText:classes.previewTextUnseen}>
          {latestMessageText}
        </Typography>
      </Box>
      {(conversation.notSeenCount>0) && <Badge className={classes.unseenCount} badgeContent={conversation.notSeenCount} color="primary"></Badge>}
    </Box>
  );
};

export default ChatContent;
