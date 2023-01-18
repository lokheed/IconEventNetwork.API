module.exports = {
    routes: [
      { 
        method: 'GET',
        path: '/people/me', 
        handler: 'person.getByRequestingUser',
      }
    ]
  }