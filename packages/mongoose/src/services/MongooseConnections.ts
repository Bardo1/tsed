import {Configuration, registerProvider} from "@tsed/common";
import {isArray} from "@tsed/core";
import {IMDBOptions, MDBConnection} from "../interfaces";
import {MongooseService} from "../services/MongooseService";

// tslint:disable-next-line:variable-name
export const MONGOOSE_CONNECTIONS = Symbol.for("MONGOOSE_CONNECTIONS");
export type MONGOOSE_CONNECTIONS = MongooseService;

function mapOptions(options: IMDBOptions | MDBConnection[]): MDBConnection[] {
  if (!options) {
    return [];
  }

  if (!isArray(options)) {
    const {url, connectionOptions, urls} = options || {};

    if (url) {
      return [
        {
          id: "default",
          url,
          connectionOptions
        }
      ];
    }

    if (urls) {
      return Object.entries(urls).map(([id, options]) => {
        options.id = options.id || id;

        return {
          ...options,
          connectionOptions: options.connectionOptions
        };
      });
    }
  }

  return (options as MDBConnection[]).map((settings) => {
    return {
      ...settings,
      connectionOptions: settings.connectionOptions
    };
  });
}

registerProvider({
  provide: MONGOOSE_CONNECTIONS,
  injectable: false,
  deps: [Configuration, MongooseService],
  async useAsyncFactory(configuration: Configuration, mongooseService: MongooseService) {
    const settings = mapOptions(configuration.get<IMDBOptions | MDBConnection[]>("mongoose"));
    let isDefault = true;

    for (const current of settings) {
      await mongooseService.connect(
        current.id,
        current.url,
        current.connectionOptions || {
          useNewUrlParser: true,
          useUnifiedTopology: true
        },
        isDefault
      );

      isDefault = false;
    }

    return mongooseService;
  }
});
