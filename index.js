require('dotenv').config();
const cors = require('cors');
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { schema, resolvers } = require('./GraphQL.js');
const userRoutes = require('./routes/userRoutes.js');

// Middlewares
var corsOptions = {
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Create an express server and a GraphQL endpoint
const app = express();
app.set('appName', 'Spell the Pokémon!');
app.set('port', 4000);

app.use('/', userRoutes);

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: resolvers,
  graphiql: true
}));
app.use(cors());
app.use(express.static('views'));

app.listen(app.get('port'), () => {
  console.log('Express GraphQL Server running on localhost:4000/graphql');
})