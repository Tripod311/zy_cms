import { readFileSync } from "fs";
import { Socket } from 'net';
import HTTP from "http";
import HTTPS from "https";
import Fastify, {FastifyInstance} from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import multipart from '@fastify/multipart';
import { HTTPConfig } from "./types";

export default class APIProvider {
  private static instance: FastifyInstance;
  private static started: boolean;
  private static port: number;
  private static sockets: Set<Socket> = new Set();

  public static getInstance(): FastifyInstance {
    return APIProvider.instance;
  }

  public static async setup(config: HTTPConfig) {
    APIProvider.instance = Fastify({
      serverFactory: (handler) => {
        if (config.credentials !== null) {
          const options: Record<string, string> = {
            key: readFileSync(config.credentials.key, "utf-8"),
            cert: readFileSync(config.credentials.cert, "utf-8")
          };
          if (config.credentials.ca !== undefined) {
            options.ca = readFileSync(config.credentials.ca, "utf-8");
          }
          return HTTPS.createServer(options, handler);
        } else {
          return HTTP.createServer(handler);
        }
      }
    });

    await APIProvider.instance.register(cookie, {
      secret: config.cookie_secret
    });

    await APIProvider.instance.register(multipart);

    if (config.cors !== undefined) {
      await APIProvider.instance.register(cors, {
        origin: config.cors.origin,
        methods: config.cors.methods
      });
    }

    APIProvider.port = config.port;

    APIProvider.instance.setErrorHandler((error, request, reply) => {
      reply.status(500).send({
        error: error.message,
      });
    });
  }

  public static async start () {
    await APIProvider.instance.listen({
      port: APIProvider.port
    }, () => {
      console.log("Listening on " + APIProvider.port);
    });

    const server = APIProvider.instance.server;

    server.on('connection', (socket: Socket) => {
      APIProvider.sockets.add(socket);
      socket.on('close', () => APIProvider.sockets.delete(socket));
    });

    APIProvider.started = true;
  }

  public static async shutdown () {
    for (const socket of APIProvider.sockets) {
      socket.destroy();
    }
    
    await APIProvider.instance.close();

    APIProvider.started = false;
  }
}