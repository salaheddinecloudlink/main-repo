export const buildCompanyTC = (models) => ({
  name: 'Company',
  model: models.Company,
  description: 'A Company',
  canMutate: true
})

export const buildCompanyRelations = ({ CompanyTC, UserTC }) => {
  CompanyTC.addRelation('users', {
    resolver: () => UserTC.mongooseResolvers.findMany(),
    prepareArgs: {
      filter: (source) => ({ companyId: source._id })
    },
    projection: {
      _id: 1
    }
  })
}
