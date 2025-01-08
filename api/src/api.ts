import Router, {RouterOptions} from '@koa/router'
import { DatabaseManager } from '@intalk/models'

import { UserRouter } from './routes/user'

export class APIRouter extends Router {
    constructor(public db: DatabaseManager, options: RouterOptions) {
        super(options)

        const userRouter = new UserRouter(db)

        this.use(userRouter.routes())
    }
}
