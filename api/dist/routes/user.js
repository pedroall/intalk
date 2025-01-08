"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRouter = void 0;
const router_1 = __importDefault(require("@koa/router"));
const models_1 = require("@intalk/models");
const helpers_1 = require("@intalk/helpers");
class UserRouter extends router_1.default {
    db;
    constructor(db) {
        super();
        this.db = db;
        this.getUser();
        this.postUser();
        this.deleteUser();
    }
    getUser() {
        const User = this.db.User;
        this.get('/users/:id', async (ctx) => {
            const id = ctx.params['id'];
            try {
                (0, helpers_1.parseId)(id);
            }
            catch (error) {
                ctx.status = 406;
                return;
            }
            const user = new User({
                id,
            });
            try {
                const fetched = await user.fetch();
                if (fetched.deleted) {
                    ctx.status = 410;
                    return;
                }
                ctx.body = {
                    id: fetched.id,
                };
            }
            catch (error) {
                if (error instanceof models_1.DatabaseError) {
                    if (error.code == models_1.UserErrorCodes.InvalidId) {
                        ctx.status = 412;
                        return;
                    }
                    return console.error(error);
                }
                return console.error(error);
            }
            ctx.status = 500;
            return;
        });
    }
    postUser() {
        const User = this.db.User;
        this.post('/users', async (ctx) => {
            const secretHeader = ctx.headers.authorization;
            if (!secretHeader) {
                ctx.status = 406;
                return;
            }
            const secretHeaderSplit = secretHeader.split(' ');
            if (secretHeaderSplit.length < 2) {
                ctx.status = 412;
                return;
            }
            const authType = secretHeaderSplit.shift();
            const secret = secretHeaderSplit.shift();
            if (authType != 'Basic') {
                ctx.status = 412;
                return;
            }
            try {
                (0, helpers_1.parseSecret)(secret);
            }
            catch (_) {
                ctx.status = 415;
                return;
            }
            const user = new User({
                secret,
            });
            try {
                const newUser = await user.create();
                ctx.status = 201;
                ctx.body = {
                    id: newUser.id,
                };
            }
            catch (error) {
                console.error(error);
                ctx.status = 500;
                return;
            }
        });
    }
    deleteUser() {
        const User = this.db.User;
        this.delete('/users/:id', async (ctx) => {
            const id = ctx.params['id'];
            try {
                (0, helpers_1.parseId)(id);
            }
            catch (_) {
                ctx.status = 406;
                return;
            }
            const secretHeader = ctx.headers.authorization;
            if (!secretHeader) {
                ctx.status = 412;
                return;
            }
            const secretHeaderSplit = secretHeader.split(' ');
            if (secretHeaderSplit.length < 2) {
                ctx.status = 412;
                return;
            }
            const authType = secretHeaderSplit.shift();
            const secret = secretHeaderSplit.shift();
            if (authType != 'Basic') {
                ctx.status = 412;
                return;
            }
            const user = new User({
                id,
                secret,
            });
            try {
                const deletedUser = await user.delete();
                ctx.status = 204;
                ctx.body = {
                    deleted: deletedUser.deleted,
                };
            }
            catch (error) {
                console.error(error);
                ctx.status = 500;
                return;
            }
        });
    }
}
exports.UserRouter = UserRouter;
