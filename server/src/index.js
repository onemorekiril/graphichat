import express from 'express';
import http from 'http';
import { ApolloServer } from 'apollo-server-express';
import { formatError } from 'apollo-errors';
import cors from 'cors';

import './dotenv';
import paths from '../../paths';

import db from './db';
import modules from './modules';
import middlewares from './middlewares';
import routers from './routers';

const { tokenVerification } = middlewares;
const { verification } = routers;

const port = process.env.PORT;
const apolloPath = process.env.APOLLO_PATH;
const apolloUrl = process.env.APOLLO_URL;
const wsUrl = process.env.WS_URL;

const startServer = async ({ schema, subscriptions }) => {
  const app = express();
  const apolloServer = new ApolloServer({
    schema,
    subscriptions,
    formatError,
    context: ({ req, connection }) => {
      if (connection) {
        console.log(connection);
      }
      const { user } = req;

      return { db, user };
    },
  });
  const corsOptions = {};

  app.use(express.static(paths.public));
  app.use(cors(corsOptions));
  app.use(tokenVerification);
  app.use(verification);

  apolloServer.applyMiddleware({ app, path: apolloPath });

  app.get('*', (req, res) => {
    res.sendFile(paths.html);
  });

  const httpServer = http.createServer(app);
  apolloServer.installSubscriptionHandlers(httpServer);

  httpServer.listen(port, () => {
    console.log(`Server ready at ${apolloUrl}`);
    console.log(`Subscriptions ready at ${wsUrl}`);
  });
};

startServer(modules);
