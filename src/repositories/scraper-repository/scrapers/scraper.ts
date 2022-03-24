import got, { Response } from 'got';

import { PDFFileResponseType } from './pdf';
import { PaperEntityDraft } from '../../../models/PaperEntityDraft';
import { Preference } from '../../../utils/preference';

export interface ScraperRequestType {
  scrapeURL: string;
  headers: Record<string, string>;
  enable: boolean;
}

export interface ScraperType {
  preference: Preference;
  scrape(entityDraft: PaperEntityDraft): Promise<PaperEntityDraft>;
  preProcess(entityDraft: PaperEntityDraft): ScraperRequestType | void;
  parsingProcess(
    rawResponse: Response<string> | PDFFileResponseType,
    entityDraft: PaperEntityDraft
  ): PaperEntityDraft | void;
  scrapeImpl: (_: PaperEntityDraft) => Promise<PaperEntityDraft>;
}

export class Scraper implements ScraperType {
  preference: Preference;

  constructor(preference: Preference) {
    this.preference = preference;
  }

  scrape(entityDraft: PaperEntityDraft): Promise<PaperEntityDraft> {
    return this.scrapeImpl(entityDraft);
  }

  preProcess(_entityDraft: PaperEntityDraft): ScraperRequestType | void {
    throw new Error('Method not implemented.');
  }

  parsingProcess(
    _rawResponse: Response<string>,
    _entityDraft: PaperEntityDraft
  ): PaperEntityDraft | void {
    throw new Error('Method not implemented.');
  }

  scrapeImpl = scrapeImpl;
}

async function scrapeImpl(
  this: ScraperType,
  entityDraft: PaperEntityDraft
): Promise<PaperEntityDraft> {
  const { scrapeURL, headers, enable } = this.preProcess(
    entityDraft
  ) as ScraperRequestType;

  if (enable) {
    const options = {
      headers: headers,
      timeout: 5000,
    };
    const response = await got(scrapeURL, options);
    return this.parsingProcess(response, entityDraft) as PaperEntityDraft;
  } else {
    return entityDraft;
  }
}
