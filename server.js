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

const movies = [
  {
    title: "Harry Potter and the Sorcerer's stone",
    author: 'J.K. Rowling',
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
  type Query { 
    books: [Book]
    movies: [Movie]
  }

  type Mutation {
    addBook(title: String!, author: String!): Book
  }

  type Book { 
    title: String
    author: String
    cover: Cover
  }

  type Movie {
    title: String
    cover: Cover
  }
  
  type Cover { 
    image: String 
  }

  schema {
    query: Query
    mutation: Mutation
  }
`;

// The resolvers
const resolvers = {
  Query: { 
    books() {
      return books 
    },
    movies() {
      return movies
    },
  },
  Mutation: {
    addBook(_, { title }) {
      const book = { title };
      
      books.push(book);

      return book;
    }
  },
  Book: {
    cover({ title }) {
      return find(covers, { title })
    }
  },
  Movie: {
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
