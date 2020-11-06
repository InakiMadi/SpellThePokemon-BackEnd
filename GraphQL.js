const { buildSchema } = require('graphql');
const bcrypt = require('bcrypt');
const pool = require('./db.js');

// Settings
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

// GraphQL Schema
const schema = buildSchema(`
type UserInfo{
  id: Int!
  nick: String!
  password: String!
  totalCorrect: Int!
  totalMistakes: Int!
}

type User{
  nick: String!
  password: String!
}

type Query {
  get(nick: String!): User,
  getAllUsers: [User!]!
}

type Mutation {
  createUser(nick: String!, password: String!): String!,
  createUserInfo(nick: String!, password: String!, totalCorrect: Int!, totalMistakes: Int!): UserInfo!,
  deleteUser(id: Int!): String!
  updateUser(nick: String!, password: String!, newNick: String, newPassword: String): String!
}
`);

async function AsyncQuery(q, v = []) {
  const client = await pool.connect()
  let result;
  try {
    result = await client.query(q, v)
  } catch (err) {
    throw err
  }
  return result.rows;
}

// Root resolver
const resolvers = {
  // Query: {
  get: async ({ nick }) => {
    const query = `SELECT nick,password FROM membership.users WHERE nick = '${nick}'`;
    const result = await AsyncQuery(query)
    return result[0]
  },
  getAllUsers: async () => {
    const query = 'SELECT nick,password FROM membership.users';
    const result = await AsyncQuery(query)
    return result
  },
  // },
  // Mutation: {
  //   deletePlayer: (_, { name }) => {
  //     const newP = players.filter(player => player.name !== name)
  //     // const index = players.findIndex(element => element.name == name)
  //     // players.splice(index, 1)
  //     players = newP;
  //     console.log(players);
  //     return `${name} deleted.`
  //   },
  // }
  createUser: async ({ nick, password }) => {
    const user = {
      nick,
      password
    };
    const query = 'INSERT INTO membership.users(nick, password, total_correct, total_mistakes) VALUES($1, $2, $3, $4) RETURNING \'Query resolved.\''
    const values = [user.nick, bcrypt.hashSync(user.password, salt),
      0, 27]
    try {
      const result = await AsyncQuery(query, values)
      return "User registered."
    } catch (error) {
      console.error(error)
      return "User already in database."
    }
  },

  updateUser: async ({ nick, password, newNick = null, newPassword = null }) => {
    let query = 'SELECT id,nick,password FROM membership.users'
    try {
      const result = await AsyncQuery(query)
      const id = result.find(element => element.nick == nick).id;

      try {
        if (!newNick) {
          query = `UPDATE membership.users SET password = '${bcrypt.hashSync(newPassword, salt)}' WHERE id = ${id};`
        }
        else if (!newPassword) {
          query = `UPDATE membership.users SET nick = '${newNick}' WHERE id = ${id};`
        }
        else if (newNick && newPassword) {
          query = `UPDATE membership.users SET nick = '${newNick}', password = '${bcrypt.hashSync(newPassword, salt)}' WHERE id = ${id};`
        }

        const result = await AsyncQuery(query)
        return "User updated."
      } catch (error) {
        console.error(error)
        return "Error. User not updated."
      }
    } catch (error) {
      console.error(error)
      return "Database error. Try again."
    }
  }
};

module.exports = { schema, resolvers }

/*
mutation{
  createUser(nick: "Jaime", password: "Arsene"){
    nick,
    password
  }
}

query{
  getAllUsers{
    nick, password
  }
}
*/