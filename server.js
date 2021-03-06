import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import colors from 'colors';
import morgan from 'morgan';

//GRAPHQL
import { ApolloServer, gql } from 'apollo-server-express';
import fs from 'fs';
import { resolvers } from './graphql/resolvers.js';

//ROUTES + CUSTOM MIDDLEWARE
import { router } from './routes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

//DATABASE
import { connectDB } from './config/database.js';

//NEW APP INSTANCE AND .ENV VARIABLES
const app = express();
dotenv.config();
const PORT = process.env.PORT || 5000 ;
const MODE = process.env.NODE_ENV || 'env not found';

//CORS
const corsOptions = {
  origin: ['https://techlogbeta.netlify.app', 'http://localhost:3000'],
  methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD', 'DELETE'],
  credentials: true
};
app.use(cors(corsOptions),);

//ADJUST BODY PARSER TO ACCEPT BASE64 ENCODED IMAGES
app.use(express.json({ limit: '100mb', extended: true }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

//MORGAN LOGGING
app.use(morgan('METHOD :method URL :url STATUS :status RESPONSE LENGTH :res[content-length] RESPONSE TIME :response-time ms'));

//APOLLO SERVER CONFIG
const typeDefs = gql(fs.readFileSync('./graphql/schema.graphql', {encoding: 'utf8'}));
const context = ({ req }) => ({
  user: req.user //For securing endpoint later...
});

const apolloServer = new ApolloServer({typeDefs, resolvers, context});
apolloServer.applyMiddleware({app, path:'/graphql'});

//LOAD ROUTES
app.use(router);

//CUSTOM MIDDLEWARE - make sure error catching is last
app.use(notFound);
app.use(errorHandler);

//AWAIT DB CONNECTION BEFORE STARTING SERVER
(async function () {
  try {
    await connectDB();
    app.listen(PORT, ()=> {
      console.log(`Server listening in ${MODE} mode on ${PORT}`.yellow.bold);
    });
  } catch (err) {
    console.log(`Failure to start server: ${err}`.red.bold);
  }
})();