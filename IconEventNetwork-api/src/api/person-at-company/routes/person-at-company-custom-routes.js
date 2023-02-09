module.exports = {
    routes: [
      { 
        method: 'GET',
        path: '/people-at-companies/security/:id', 
        handler: 'person-at-company.canManagePersonAtCompany',
      }
    ]
  }