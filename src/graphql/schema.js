const { buildSchema } = require('graphql');



// Maps username to content
var fakeDatabase = [];



// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  input DeviceInput {
    name: String,
    location: String,
    macAddress: String!,
    type: String,
    updateRate: Int
  }

  type Device {
    id: ID
    name: String,
    location: String,
    macAddress: String!,
    type: String,
    updateRate: Int
  }

  type Query {
    hello: String,
    device(id: ID!): Device,
    alldevices: [Device]
  }

  type Mutation {
    createDevice(input: DeviceInput): Device
  }
`);

// The root provides a resolver function for each API endpoint
var root = {
  hello: () => {
    return 'Hello world!';
  },
  device: ({id})=> {
    return fakeDatabase.filter(device => device.id === id)[0];
  },
  alldevices: () => {
    return [...fakeDatabase];
  },
  createDevice: ({input}) => {
    // Create a random id for our "database".
    var id = require('crypto').randomBytes(10).toString('hex');
    fakeDatabase.push({id, ... input});
    console.log(fakeDatabase);
    var data = fakeDatabase.filter((device, index) => device.id === id);
     return data[0];
  }
};

module.exports = {
  schema,
  root
}