import { Scraper } from "./scraper";
import fs from "fs";

export class TEScraper extends Scraper {
    constructor(enable) {
        super();
        this.enable = enable;
    }

    preProcess(entityDraft) {
        let enable = entityDraft.title === "" && entityDraft.arxiv === "" && entityDraft.doi === "" && fs.existsSync(entityDraft.mainURL) && this.enable
        let scrapeURL = "https://paperlib.app/api/files/upload/"
        let headers = {};

        return { scrapeURL, headers, enable };
    }

    parsingProcess(rawResponse, entityDraft) {
        let response = JSON.parse(rawResponse.body);
        let title = response.title;
        entity.setValue("title", title, false);
        return entityDraft
    }

    async scrapeImpl(entityDraft) {
        let { scrapeURL, headers, enable } = this.preProcess(entityDraft)
        if (enable) {
            const form = new FormData();
            form.append("file", fs.createReadStream(entityDraft.mainURL));

            let response = await got
            .post("https://paperlib.geoch.top/api/files/upload/", {
                body: form,
            })

            return this.parsingProcess(response, entityDraft);
        } else {
            return entityDraft
        }
    }
}