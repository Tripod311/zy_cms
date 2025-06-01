import {LocalizationConfig} from "./types";

class LocalizationProvider {
	private static instance: LocalizationProvider | null;
	public locales: string[] = [];
	public fallbackLocale: string = "en";

	public static setup (config: LocalizationConfig) {
		LocalizationProvider.instance = new LocalizationProvider();
		LocalizationProvider.instance.locales = config.locales;
		LocalizationProvider.instance.fallbackLocale = config.fallbackLocale;
	}

	public static getInstance (): LocalizationProvider {
		if (LocalizationProvider.instance === null) throw new Error("Localization provider not instantiated");

		return LocalizationProvider.instance;
	}
};

export default LocalizationProvider;