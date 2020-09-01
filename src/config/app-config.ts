import {ConfigManager} from "merlins-config-manager";
import {DefaultWebserverConfig} from "./templates/webserver.config";
import {DefaultShortsConfig} from "./templates/shorts.config";
import {DefaultDatabaseConfig} from "./templates/database.config";
import {DefaultTagsConfig} from "./templates/tags.config";
import {DefaultRedirectUrlsConfig} from "./templates/redirect-urls.config";
import {DefaultRestrictionsConfig} from "./templates/restrictions.config";

export const AppConfig = new ConfigManager();

export const WebserverConfig = AppConfig.configSection('WEBSERVER', DefaultWebserverConfig);
export const DatabaseConfig = AppConfig.configSection('DATABASE', DefaultDatabaseConfig);
export const RestrictionsConfig = AppConfig.configSection('RESTRICTIONS', DefaultRestrictionsConfig);
export const ShortsConfig = AppConfig.configSection('URLS.SHORTS', DefaultShortsConfig);
export const TagsConfig = AppConfig.configSection('URLS.TAGS', DefaultTagsConfig);
export const RedirectsConfig = AppConfig.configSection('URLS.REDIRECT-URLS', DefaultRedirectUrlsConfig);
