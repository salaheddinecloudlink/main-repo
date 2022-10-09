export const buildUserTC = (models) => ({
  name: 'User',
  model: models.User,
  description: 'A User',
  canMutate: true
})

export const buildUserRelations = ({ UserTC, CompanyTC }) => {
  UserTC.addRelation('company', {
    resolver: () => CompanyTC.mongooseResolvers.findOne(),
    prepareArgs: {
      filter: (source) => ({ _id: source.companyId })
    },
    projection: {
      companyId: 1
    }
  })
}
