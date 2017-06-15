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
const { globalIdField } = require('graphql-relay');
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

const queryType = new GraphQLObjectType({
  name: 'queryType',
  description: 'The root query type',
  fields: {
    node: nodeField,
    videos: {
      type: new GraphQLList(videoType),
      resolve: getVideos,
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

const videoInputType = new GraphQLInputObjectType({
  name: 'VideoInput',
  fields: {
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
  }
})

const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'the root mutation type.',
  fields: {
    createVideo: {
      type: videoType,
      args: {
        video: {
          type: new GraphQLNonNull(videoInputType)
        }
      },
      resolve: (_, args) => {
        return createVideo(args.video);
      },
    }
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