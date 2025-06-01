class LocalizationProvider {
    static setup(config) {
        LocalizationProvider.instance = new LocalizationProvider();
        LocalizationProvider.instance.locales = config.locales;
        LocalizationProvider.instance.fallbackLocale = config.fallbackLocale;
    }
    static getInstance() {
        return LocalizationProvider.instance;
    }
}
;
export default LocalizationProvider;
