import * as WebSocket from "ws";

import { createDecorator } from "@/base/injection/injection";
import { IPaperService, PaperService } from "@/renderer/services/paper-service";
import {
  IScrapeService,
  ScrapeService,
} from "@/renderer/services/scrape-service";
import { CategorizerService, ICategorizerService } from "@/renderer/services/categorizer-service";
import { CategorizerType } from "@/models/categorizer";
import { ICategorizerCollection } from "@/repositories/db-repository/categorizer-repository";

export const IBrowserExtensionService = createDecorator(
  "browserExtensionService"
);

export class BrowserExtensionService {
  private _socketServer: WebSocket.WebSocketServer;
  private _ws?: WebSocket.WebSocket;

  constructor(
    @IScrapeService private readonly _scrapeService: ScrapeService,
    @IPaperService private readonly _paperService: PaperService,
    @ICategorizerService private readonly _categorizerService: CategorizerService
  ) {
    this._socketServer = new WebSocket.WebSocketServer({ port: 21992 });
    this._socketServer.on("connection", (ws) => {
      this._ws = ws;
      ws.on("message", this._messageHandler.bind(this));
    });
  }

  private async _messageHandler(message: string) {
    const parsedMessage = JSON.parse(message);

    if (parsedMessage.hasOwnProperty("type")) {
      if (parsedMessage.type === "import") {
        this._create(parsedMessage.id, parsedMessage.value);
      } else if (parsedMessage.type === "getCategorizers") {
        this._getCategorizers(parsedMessage.id, parsedMessage.value);
      }
    } else {
      // For backward compatibility
      this._create(undefined, parsedMessage);
    }
  }

  private async _create(
    msgId: number | undefined,
    browserExtMsg: {
      url: string;
      document: string;
      cookies: string;
      options: {
        downloadPDF: boolean;
        tags: any[]
      }
    }) {
    const payload = {
      type: "webcontent",
      value: browserExtMsg,
    };

    const scrapedPaperEntities = await this._scrapeService.scrape(
      [payload],
      []
    );
    if (scrapedPaperEntities.length === 0) {
      if (msgId) {
        this._ws?.send(JSON.stringify({ id: msgId, value: "no-avaliable-importer" }));
      } else {
        this._ws?.send(JSON.stringify({ response: "no-avaliable-importer" }));
      }
    } else {
      if (browserExtMsg.options && browserExtMsg.options.tags && browserExtMsg.options.tags.length > 0) {
        scrapedPaperEntities.forEach((paper) => {
          paper.tags.push(...browserExtMsg.options.tags)
        });
      }
      await this._paperService.update(scrapedPaperEntities, true, false);
      if (msgId) {
        this._ws?.send(JSON.stringify({ id: msgId, value: "successful" }));
      } else {
        this._ws?.send(JSON.stringify({ response: "successful" }));
      }
    }
  }

  private async _getCategorizers(msgId: number | undefined, type: string) {
    let results: ICategorizerCollection;
    if (type === 'tags') {
      results = await this._categorizerService.load(CategorizerType.PaperTag, "count", "desc")
    } else {
      results = await this._categorizerService.load(CategorizerType.PaperFolder, "count", "desc")
    }

    if (msgId) {
      this._ws?.send(JSON.stringify({ id: msgId, value: results }));
    } else {
      this._ws?.send(JSON.stringify({
        response: results,
      }));
    }
  }
}
