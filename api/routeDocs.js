// Add this near the top of your server.js file
const apiDocs = {
    '/api/signup': {
      method: 'POST',
      description: 'Create a new user account',
      authentication: 'None',
      parameters: {
        username: 'string (required)',
        password: 'string (required)'
      },
      response: {
        token: 'string (JWT token)'
      }
    },
    '/api/login': {
      method: 'POST',
      description: 'Authenticate a user and receive a token',
      authentication: 'None',
      parameters: {
        username: 'string (required)',
        password: 'string (required)'
      },
      response: {
        token: 'string (JWT token)'
      }
    },
    '/api/cars': {
      method: 'GET',
      description: 'Retrieve a list of cars',
      authentication: 'Bearer Token',
      parameters: {
        limit: 'number (optional, default: 10)'
      },
      response: 'Array of car objects'
    },
    '/api/cars': {
      method: 'POST',
      description: 'Create a new car',
      authentication: 'Bearer Token',
      parameters: {
        title: 'string (required)',
        description: 'string (required)',
        tags: 'array of strings',
        images: 'array of base64 encoded strings'
      },
      response: 'Created car object'
    },
    '/api/cars/:id': {
      method: 'GET',
      description: 'Retrieve a specific car by ID',
      authentication: 'Bearer Token',
      parameters: {
        id: 'string (required, in URL)'
      },
      response: 'Car object'
    },
    '/api/cars/:id': {
      method: 'PUT',
      description: 'Update a specific car by ID',
      authentication: 'Bearer Token',
      parameters: {
        id: 'string (required, in URL)',
        title: 'string (optional)',
        description: 'string (optional)',
        tags: 'array of strings (optional)',
        images: 'array of base64 encoded strings (optional)',
        newImages: 'array of base64 encoded strings (optional)'
      },
      response: 'Updated car object'
    },
    '/api/cars/:id': {
      method: 'DELETE',
      description: 'Delete a specific car by ID',
      authentication: 'Bearer Token',
      parameters: {
        id: 'string (required, in URL)'
      },
      response: 'Success message'
    },
    '/api/search': {
      method: 'GET',
      description: 'Search for cars based on a keyword',
      authentication: 'Bearer Token',
      parameters: {
        keyword: 'string (required)'
      },
      response: 'Array of car objects matching the search criteria'
    }
  };
  
  module.exports = {
    apiDocs,
  };