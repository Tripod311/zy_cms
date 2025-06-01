import { readFileSync } from "fs";
import HTTP from "http";
import HTTPS from "https";
import Fastify, {FastifyInstance} from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import { HTTPConfig } from "./types";

export default class APIProvider {
	private static instance: FastifyInstance;
	private static started: boolean;
	private static port: number;

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

		if (config.cors !== undefined) {
			APIProvider.instance.register(cors, {
				origin: config.cors.origin,
				methods: config.cors.methods
			});
		}

		APIProvider.port = config.port;
	}

	public static start () {
		APIProvider.instance.listen({
			port: APIProvider.port
		});

		APIProvider.started = true;
	}

	public static shutdown () {
		APIProvider.instance.close();

		APIProvider.started = false;
	}
}