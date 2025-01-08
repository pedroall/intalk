"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIRouter = void 0;
const router_1 = __importDefault(require("@koa/router"));
const user_1 = require("./routes/user");
class APIRouter extends router_1.default {
    db;
    constructor(db, options) {
        super(options);
        this.db = db;
        const userRouter = new user_1.UserRouter(db);
        this.use(userRouter.routes());
    }
}
exports.APIRouter = APIRouter;
