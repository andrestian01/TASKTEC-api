// index.msj
import { makeExecutableSchema } from '@graphql-tools/schema';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import { readFileSync } from 'fs';
import { execute, subscribe } from 'graphql';
import { PubSub } from 'graphql-subscriptions';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import './database/db.mjs';
import { resolvers } from './resolvers.mjs';

const typeDefs = readFileSync('./schema.graphql', 'utf8');

const pubsub = new PubSub();

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const app = express();
const apolloServer = new ApolloServer({
  schema,
  context: { pubsub },
});

async function startApolloServer() {
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: '/graphql' });

  app.get('/', (req, res) => {
    res.send('Welcome to my GraphQL server. Access GraphQL Playground at /graphql');
  });

  const httpServer = createServer(app);
  const PORT_APOLLO = process.env.PORT_APOLLO || 4000;
  httpServer.listen(PORT_APOLLO, () => {
    console.log(`Apollo Server ready at http://localhost:${PORT_APOLLO}/graphql`);
  });

  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
    },
    {
      server: httpServer,
      path: '/graphql',
    }
  );

  console.log(`Subscription server ready at ws://localhost:${PORT_APOLLO}/graphql`);
}

startApolloServer();
