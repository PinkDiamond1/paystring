import * as express from 'express'

import sendSuccess from '../middlewares/shared'
import { getUser, postUser, putUser, deleteUser } from '../middlewares/users'

const privateAPIRouter = express.Router()

/**
 * routes for the private API so that authorized parties can
 * post payment pointer mappings to the PayID DB
 */
privateAPIRouter
  .get('/*', getUser, sendSuccess)
  .post('/', express.json(), postUser, sendSuccess)
  .put('/*', express.json(), putUser, sendSuccess)
  .delete('/*', deleteUser, sendSuccess)

export default privateAPIRouter
