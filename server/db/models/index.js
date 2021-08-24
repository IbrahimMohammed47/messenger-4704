const Conversation = require("./conversation");
const User = require("./user");
const Message = require("./message");
const Group = require("./group");
// associations

User.hasMany(Conversation);
Conversation.belongsTo(User, { as: "user1" });
Conversation.belongsTo(User, { as: "user2" });

// 1 conversation : M msgs relation
Message.belongsTo(Conversation);
Conversation.hasMany(Message);

// 1 admin : M groups relation
Group.belongsTo(User, { foreignKey: 'admin'});
User.hasMany(Group, { foreignKey: 'admin'});

// 1 group : M msgs relation
Message.belongsTo(Group, { foreignKey: 'groupId'});
Group.hasMany(Message, { foreignKey: 'groupId'});

// M participants : N groups relation (junction table)
User.belongsToMany(Group, { through: 'groups_participants' });
Group.belongsToMany(User, { through: 'groups_participants' });

module.exports = {
  User,
  Conversation,
  Message
};
