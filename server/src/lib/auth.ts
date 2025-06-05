import { FastifyRequest, FastifyReply } from "fastify";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import DBProvider from "./db";
import APIProvider from "./api";

import { AuthConfig, User } from "./types";

export default class AuthProvider {
  private static instance: AuthProvider;
  private jwt_secret: string = "jwt_secret";
  private secure_cookies: boolean = true;
  public handlers: Record<string, (request: FastifyRequest, reply: FastifyReply) => Promise<void>> = {};

  public static getInstance(): AuthProvider {
    return AuthProvider.instance;
  }

  public static setup(config: AuthConfig) {
    AuthProvider.instance = new AuthProvider();
    if ("jwt_secret" in config) AuthProvider.instance.jwt_secret = config.jwt_secret as string;
    if ("secure_cookies" in config) AuthProvider.instance.secure_cookies = config.secure_cookies as boolean;

    DBProvider.getInstance().query(`CREATE TABLE IF NOT EXISTS users (
      login VARCHAR(255) PRIMARY KEY,
      password CHAR(60) NOT NULL
    )`);
  }

  private constructor () {
    this.handlers.checkAuth = this.checkAuth.bind(this);
    this.handlers.forceAuth = this.forceAuth.bind(this);
  }

  public async create (login: string, password: string) {
    const hash = await bcrypt.hash(password, 10);
    await DBProvider.getInstance().create<User>("users", {login: login, password: hash});
  }

  public async update (login: string, password: string) {
    const hash = await bcrypt.hash(password, 10);
    await DBProvider.getInstance().update<User>("users", { password: hash }, { where: { login: login }});
  }

  public async delete (login: string) {
    await DBProvider.getInstance().delete<User>("users", {where: {login}});
  }

  public async forceAuth(request: FastifyRequest, reply: FastifyReply) {
    const token = request.cookies?.token;

    if (!token) {
      reply.code(403).send({ error: 'Forbidden: no token' });
      return;
    }

    try {
      const decoded = jwt.verify(token, this.jwt_secret) as { exp: number, [key: string]: any };

      const now = Math.floor(Date.now() / 1000);
      const tenMinutes = 10 * 60;

      if (decoded.exp - now < tenMinutes) {
        const newToken = jwt.sign(
          { ...decoded, exp: undefined },
          this.jwt_secret,
          { expiresIn: '1h' }
        );

        reply.setCookie('token', newToken, {
          httpOnly: true,
          secure: AuthProvider.instance.secure_cookies,
          sameSite: 'strict',
          path: '/',
        });
      }

      request.user = {
        login: decoded.login
      };
    } catch (e) {
      reply.code(403).send({ error: 'Forbidden: invalid token' });
    }
  }

  /*
    main difference between this function and previous - this one allows unathorized users to enter.
    If user is authorized, his login will be passed in request
  */
  public async checkAuth (request: FastifyRequest, reply: FastifyReply) {
    const token = request.cookies?.token;

    if (token) {
      try {
        const decoded = jwt.verify(token, this.jwt_secret) as { exp: number, [key: string]: any };

        const now = Math.floor(Date.now() / 1000);
        const tenMinutes = 10 * 60;

        if (decoded.exp - now < tenMinutes) {
          const newToken = jwt.sign(
            { ...decoded, exp: undefined },
            this.jwt_secret,
            { expiresIn: '1h' }
          );

          reply.setCookie('token', newToken, {
            httpOnly: true,
            secure: AuthProvider.instance.secure_cookies,
            sameSite: 'strict',
            path: '/',
          });
        }

        request.user = {
          login: decoded.login
        };
      } catch (e) {
        return;
      }
    }
  }

  public async authorize (request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { login: string; password: string; };

    const rows = await DBProvider.getInstance().read<User>("users", {where: {login: body.login}});

    if (rows.length === 0) {
      reply.code(403).send({ error: 'User not found' });
      return;
    }

    const compareResult = await bcrypt.compare(body.password as string, rows[0].password as string);

    if (compareResult) {
      const newToken = jwt.sign(
        { login: body.login },
        this.jwt_secret,
        { expiresIn: '1h' }
      );

      reply.setCookie('token', newToken, {
        httpOnly: true,
        secure: AuthProvider.instance.secure_cookies,
        sameSite: 'strict',
        path: '/',
      });
    } else {
      reply.code(403).send({ error: 'Invalid login/password pair' });
    }
  }
}