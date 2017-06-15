'use strict';

const express = require('express');
const graphqlHTTP = require('express-graphql');
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt,
  GraphQLString,
  GraphQLBoolean,
} = require('graphql');
const { getVideoById, getVideos, createVideo } = require('./src/data.js');
const {
  globalIdField,
  connectionDefinitions,
  connectionFromPromisedArray,
  connectionArgs,
  mutationWithClientMutationId,
} = require('graphql-relay');
const { nodeInterface, nodeField } = require('./src/node');

const PORT = process.env.PORT || 3000;

const server = express();

const videoType = new GraphQLObjectType({
  name: 'Video',
  description: 'videoType',
  fields: {
    id: globalIdField(),
    title: {
      type: GraphQLString,
      description: 'title of the video'
    },
    duration: {
      type: GraphQLInt,
      description: 'duration of the video in seconds'
    },
    watched: {
      type: GraphQLBoolean,
      description: 'wether the video was watched or not'
    }
  },
  interfaces: [nodeInterface],
})
exports.videoType = videoType;

const { connectionType: VideoConnection } = connectionDefinitions({
  nodeType: videoType,
  connectionFields: () => ({
    totalCount: {
      type: GraphQLInt,
      description: 'a count of the total number of objects',
      resolve: conn => conn.edges.length,
    }
  })
})
const queryType = new GraphQLObjectType({
  name: 'queryType',
  description: 'The root query type',
  fields: {
    node: nodeField,
    videos: {
      type: VideoConnection,
      args: connectionArgs,
      resolve: (_, args) => connectionFromPromisedArray(
        getVideos(),
        args
      ),
    },
    video: {
      type: videoType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'the id of the video.'
        }
      },
      resolve: (_, args) => getVideoById(args.id)
    }
  }
})

const videoMutation = mutationWithClientMutationId({
  name: 'AddVideo',
  inputFields: {
    title: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Title of the video',
    },
    duration: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Duration of the video in seconds',
    },
    released: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'Whether it has been released to the public or not',
    },
  },
  outputFields: {
    video: {
      type: videoType,
    }
  },
  mutateAndGetPayload: args => new Promise((resolve, reject) => {
    Promise.resolve(createVideo(args))
      .then(video => resolve({video}))
      .catch(reject);
  })
})

const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'the root mutation type.',
  fields: {
    createVideo: videoMutation
  }
});

const schema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType,
})

server.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true,
}));

server.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`))
