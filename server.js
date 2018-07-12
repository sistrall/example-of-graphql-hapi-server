const Hapi = require('hapi');
const { graphqlHapi, graphiqlHapi } = require('apollo-server-hapi');
const { makeExecutableSchema } = require('graphql-tools');
const { find } = require('lodash');

const HOST = 'localhost';
const PORT = 3000;

// Some fake data
const books = [
  {
    title: "Harry Potter and the Sorcerer's stone",
    author: 'J.K. Rowling',
  },
  {
    title: 'Jurassic Park',
    author: 'Michael Crichton',
  },
];

const covers = [
  {
    title: "Harry Potter and the Sorcerer's stone",
    image: "http://www.cover.com/harry.jpg"
  },
  {
    title: 'Jurassic Park',
    image: "http://www.cover.com/jurassic.jpg"
  },
];

// The GraphQL schema in string form
const typeDefs = `
  type Query { books: [Book] }
  type Cover { image: String }
  type Book { title: String, author: String, cover: Cover }
`;

// The resolvers
const resolvers = {
  Query: { 
    books() {
      return books 
    }
  },
  Book: {
    cover({ title }) {
      return find(covers, { title })
    }
  },
};

// Put together a schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

async function StartServer() {
  const server = new Hapi.server({
    host: HOST,
    port: PORT
  });

  await server.register({
    plugin: graphqlHapi,
    options: {
      path: '/graphql',
      graphqlOptions: {
        schema
      },
      route: {
        cors: true
      }
    }
  });

  await server.register({
    plugin: graphiqlHapi,
    options: {
      path: '/graphiql',
      graphiqlOptions: {
        endpointURL: '/graphql',
      },
    },
  });

  try {
    await server.start();
  } catch (err) {
    console.log(`Error while starting server: ${err.message}`);
  }

  console.log(`Server running at: ${server.info.uri}`);
}

StartServer();
