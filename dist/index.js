"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const middleware_1 = require("./middleware");
const db_1 = require("./db");
const port = 3000;
const config_1 = require("./config");
const utils_1 = require("./utils");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.post('/api/v1/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.body.email;
        const password = req.body.password;
        yield db_1.UserModel.create({
            email: email,
            password: password
        });
        res.json({
            message: "user created"
        });
    }
    catch (error) {
        res.status(411).json({
            message: "sommething went wrong "
        });
    }
    app.post('/api/v1/signIn', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const email = req.body.email;
        const password = req.body.password;
        const existUser = yield db_1.UserModel.findOne({
            email, password
        });
        if (existUser) {
            const token = jsonwebtoken_1.default.sign({
                id: existUser._id
            }, config_1.JWT_PASSWORD);
            res.json({
                token
            });
        }
        else {
            res.status(403).json("invalid credentials");
        }
    }));
}));
app.post('/api/v1/content/', middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const link = req.body.link;
    const type = req.body.type;
    yield db_1.ContentModel.create({
        link,
        type,
        title: req.body.title,
        tags: [],
        //@ts-ignore
        userId: req.userId,
    });
    res.json({
        message: "content added "
    });
}));
app.get('/api/v1/content', middleware_1.userMiddleware, (req, res) => {
    //@ts-ignore
    const userId = req.userId;
    const content = db_1.ContentModel.find({
        userId: userId,
    }).populate("userId", "email");
    res.json({
        content
    });
});
app.delete('api/v1/content', middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contentId = req.body.contentId;
    yield db_1.ContentModel.deleteMany({
        contentId,
        //@ts-ignore
        userId: req.userId
    });
    res.json({
        message: "content deleted"
    });
}));
app.post('api/v1/brain/share', middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const share = req.body.share;
    if (share) {
        const existingLink = yield db_1.LinkModel.findOne({
            //@ts-ignore
            userId: req.userId
        });
        if (existingLink) {
            return;
        }
        const hash = (0, utils_1.random)(10);
        yield db_1.LinkModel.create({
            //@ts-ignore
            userId: req.userId,
            //@ts-ignore
            hash: hash
        });
        res.json({
            //@ts-ignore
            hash: existingLink.hash
        });
    }
    else {
        yield db_1.LinkModel.deleteOne({
            //@ts-ignore
            userId: req.userId
        });
        res.json({
            message: "Removed link "
        });
    }
}));
//26.41
app.post('api/v1/brain:shareLink', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hash = req.params.shareLink;
    const links = yield db_1.LinkModel.findOne({
        hash
    });
    if (!links) {
        res.status(411).json({
            message: "sorry incorrect input"
        });
        return;
    }
    const content = yield db_1.ContentModel.find({
        userId: links === null || links === void 0 ? void 0 : links.userId
    });
    const user = yield db_1.UserModel.find({
        userId: links.userId
    });
    if (!user) {
        message: "user is not present or null";
    }
    res.json({
        //@ts-ignore
        email: user.email,
        content: content
    });
}));
app.listen(port);
