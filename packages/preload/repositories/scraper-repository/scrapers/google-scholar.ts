import got, { HTTPError } from "got";

import { parse } from "node-html-parser";
import { BibtexParser } from "bibtex-js-parser";

import { Scraper, ScraperRequestType, ScraperType } from "./scraper";
import { formatString } from "../../../utils/string";
import { Preference } from "../../../utils/preference";
import { SharedState } from "../../../utils/appstate";
import { PaperEntityDraft } from "../../../models/PaperEntityDraft";
import { ipcRenderer } from "electron";

async function safeGot(url: string, headers: Record<string, string>) {
  const options = {
    headers: headers,
    retry: 0,
    timeout: {
      request: 5000,
    },
  };

  let response;
  try {
    response = await got(url, options);
  } catch (error) {
    if (error instanceof HTTPError) {
      if (
        error.response.statusCode === 429 ||
        error.response.statusCode === 403
      ) {
        const robot_checked_body = await ipcRenderer.invoke("robot-check", url);
        response = {
          body: robot_checked_body,
        };
      }
    }
  }
  if (
    response?.body.includes("Please show you're not a robot") ||
    response?.body.includes("Please show you&#39;re not a robot")
  ) {
    const robot_checked_body = await ipcRenderer.invoke("robot-check", url);
    response = {
      body: robot_checked_body,
    };
  }
  return response;
}

async function scrapeImpl(
  this: ScraperType,
  entityDraft: PaperEntityDraft
): Promise<PaperEntityDraft> {
  const { scrapeURL, headers, enable } = this.preProcess(
    entityDraft
  ) as ScraperRequestType;

  if (enable) {
    const response = await safeGot(scrapeURL, headers);

    const root = parse(response?.body);
    const results = root.querySelector("#gs_res_ccl_mid");

    let bibtex = "";
    if (results) {
      for (let node of results.childNodes) {
        if (node.nodeType === 1) {
          const paper = node.childNodes[1];
          if (paper) {
            let title = paper.childNodes[0];
            if (title) {
              let titleStr = title.childNodes.pop()?.rawText;
              if (titleStr) {
                const plainHitTitle = formatString({
                  str: titleStr,
                  removeStr: "&amp",
                  removeSymbol: true,
                  lowercased: true,
                });

                const existTitle = formatString({
                  str: entityDraft.title,
                  removeStr: "&amp",
                  removeSymbol: true,
                  lowercased: true,
                });

                if (plainHitTitle === existTitle) {
                  const dataid =
                    title.parentNode.parentNode.attributes["data-aid"];

                  if (dataid) {
                    const citeUrl = `https://scholar.google.com/scholar?q=info:${dataid}:scholar.google.com/&output=cite&scirp=1&hl=en`;
                    const citeResponse = await safeGot(citeUrl, headers);
                    const citeRoot = parse(citeResponse?.body);
                    const citeBibtexNode = citeRoot.lastChild
                      .childNodes[0] as any as HTMLElement;
                    if (citeBibtexNode) {
                      // @ts-ignore
                      const citeBibtexUrl = citeBibtexNode.attributes["href"];
                      if (citeBibtexUrl) {
                        const citeBibtexResponse = await safeGot(
                          citeBibtexUrl,
                          headers
                        );
                        bibtex = citeBibtexResponse?.body;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    return this.parsingProcess(bibtex, entityDraft) as PaperEntityDraft;
  } else {
    return entityDraft;
  }
}

export class GoogleScholarScraper extends Scraper {
  constructor(sharedState: SharedState, preference: Preference) {
    super(sharedState, preference);
  }

  preProcess(entityDraft: PaperEntityDraft): ScraperRequestType {
    const enable =
      entityDraft.title !== "" &&
      entityDraft.publication === "" &&
      (this.preference.get("googlescholarScraper") as boolean);

    const query = entityDraft.title.replace(/ /g, "+");

    const scrapeURL = `https://scholar.google.com/scholar?q=${query}`;

    const headers = {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36",
    };

    if (enable) {
      this.sharedState.set(
        "viewState.processInformation",
        `Scraping metadata from google scholar ...`
      );
    }

    return { scrapeURL, headers, enable };
  }

  parsingProcess(
    rawResponse: string,
    entityDraft: PaperEntityDraft
  ): PaperEntityDraft {
    if (rawResponse) {
      const bibtexs = BibtexParser.parseToJSON(rawResponse);
      for (const bibtex of bibtexs) {
        if (bibtex.year) {
          entityDraft.year = bibtex.year;
        }
        if (bibtex.author) {
          const authors = bibtex.author
            .split(" and ")
            .map((author) => {
              const first_last = author.split(",").map((author) => {
                return author.trim();
              });
              first_last.reverse();
              return first_last.join(" ");
            })
            .join(", ");
          entityDraft.authors = authors;
        }
        if (bibtex.type === "article") {
          if (bibtex.journal) {
            entityDraft.publication = bibtex.journal;
          }
          entityDraft.pubType = 0;
        } else if (
          bibtex.type === "inproceedings" ||
          bibtex.type === "incollection"
        ) {
          if (bibtex.booktitle) {
            entityDraft.publication = bibtex.booktitle;
          }
          entityDraft.pubType = 1;
        } else if (bibtex.type === "book") {
          if (bibtex.publisher) {
            entityDraft.publication = bibtex.publisher;
          }
          entityDraft.pubType = 3;
        } else {
          if (bibtex.journal) {
            entityDraft.publication = bibtex.journal;
          }
          entityDraft.pubType = 2;
        }
      }
    }

    return entityDraft;
  }

  scrapeImpl = scrapeImpl;
}
