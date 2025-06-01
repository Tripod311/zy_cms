class LocalizationProvider {
    constructor() {
        this.locales = [];
        this.fallbackLocale = "en";
    }
    static setup(config) {
        LocalizationProvider.instance = new LocalizationProvider();
        LocalizationProvider.instance.locales = config.locales;
        LocalizationProvider.instance.fallbackLocale = config.fallbackLocale;
    }
    static getInstance() {
        if (LocalizationProvider.instance === null)
            throw new Error("Localization provider not instantiated");
        return LocalizationProvider.instance;
    }
}
;
export default LocalizationProvider;
