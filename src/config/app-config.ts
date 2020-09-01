import {ConfigManager} from "merlins-config-manager";
import {DefaultWebserverConfig} from "./templates/webserver.config";
import {DefaultShortsConfig} from "./templates/shorts.config";
import {DefaultDatabaseConfig} from "./templates/database.config";

export const AppConfig = new ConfigManager();

export const WebserverConfig = AppConfig.configSection('WEBSERVER', DefaultWebserverConfig);
export const ShortsConfig = AppConfig.configSection('SHORTS', DefaultShortsConfig);
export const DatabaseConfig = AppConfig.configSection('DATABASE', DefaultDatabaseConfig);
