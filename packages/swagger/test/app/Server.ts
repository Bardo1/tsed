import {Configuration, Inject, PlatformApplication} from "@tsed/common";
import "@tsed/platform-express";
import "@tsed/swagger";
import * as Path from "path";

const cookieParser = require("cookie-parser"),
  bodyParser = require("body-parser"),
  compress = require("compression"),
  methodOverride = require("method-override");

const rootDir = Path.resolve(__dirname);

@Configuration({
  rootDir,
  port: 8001,
  swagger: [
    {
      path: "/api-doc",
      showExplorer: true
    }
  ]
})
export class Server {
  @Inject()
  app: PlatformApplication;

  public $beforeRoutesInit(): void {
    this.app
      .use(bodyParser.json())
      .use(
        bodyParser.urlencoded({
          extended: true
        })
      )
      .use(cookieParser())
      .use(compress({}))
      .use(methodOverride());
  }
}