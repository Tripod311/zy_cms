import {LocalizationConfig} from "./types";

class LocalizationProvider {
	private static instance: LocalizationProvider | null;
	public locales: string[] | undefined;
	public fallbackLocale: string | undefined;

	public static setup (config: LocalizationConfig) {
		LocalizationProvider.instance = new LocalizationProvider();
		LocalizationProvider.instance.locales = config.locales;
		LocalizationProvider.instance.fallbackLocale = config.fallbackLocale;
	}

	public static getInstance (): LocalizationProvider | null {
		return LocalizationProvider.instance;
	}
};

export default LocalizationProvider;