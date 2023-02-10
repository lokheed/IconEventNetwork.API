module.exports = {
    routes: [
      { 
        method: 'GET',
        path: '/companies/security/:id', 
        handler: 'company.canManageCompany',
      }
    ]
  }