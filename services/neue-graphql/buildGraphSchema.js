import {
  buildCompanyRelations,
  buildCompanyTC
} from '@neueparti/data-access/schemas/company/CompanyGraph'
import {
  buildUserRelations,
  buildUserTC
} from '@neueparti/data-access/schemas/user/UserGraph'
import { schemaComposer } from 'graphql-compose'

import { buildComposer } from './buildComposer'
import { buildUnionTypes } from './buildUnionTypes'

export const buildGraphSchema = ({ models }) => {
  const typeComposers = {
    UserTC: buildComposer(buildUserTC(models)),
    CompanyTC: buildComposer(buildCompanyTC(models))
  }

  buildUserRelations(typeComposers)
  buildCompanyRelations(typeComposers)

  try {
    buildUnionTypes(typeComposers)
    return schemaComposer.buildSchema()
  } catch (e) {
    console.log(e)
    return schemaComposer
  }
}
