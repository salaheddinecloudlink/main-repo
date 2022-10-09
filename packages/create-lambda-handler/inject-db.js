import { getConnection } from '@neueparti/data-access/connect'

const { DB_URI } = process.env
export const injectDb = async (handlerParams) => {
  const db = await getConnection(DB_URI)
  return {
    ...handlerParams,
    db
  }
}
