import { BrowserWindow, Menu, ipcMain, nativeImage } from "electron";

import { loadLocales } from "@/locales/load";
import { Preference, ScraperPreference } from "@/preference/preference";
import {
  IPreferenceService,
  PreferenceService,
} from "@/common/services/preference-service";

const isMac = process.platform === "darwin";

const blueBuf = Buffer.from([246, 130, 59, 0]);
let blueIcon = nativeImage.createFromBuffer(blueBuf, { width: 1, height: 1 });
blueIcon = blueIcon.resize({ width: 3, height: 10 });

const redBuf = Buffer.from([68, 68, 239, 0]);
let redIcon = nativeImage.createFromBuffer(redBuf, { width: 1, height: 1 });
redIcon = redIcon.resize({ width: 3, height: 10 });

const yellowBuf = Buffer.from([8, 179, 234, 0]);
let yellowIcon = nativeImage.createFromBuffer(yellowBuf, {
  width: 1,
  height: 1,
});
yellowIcon = yellowIcon.resize({ width: 3, height: 10 });

const greenBuf = Buffer.from([94, 197, 34, 0]);
let greenIcon = nativeImage.createFromBuffer(greenBuf, { width: 1, height: 1 });
greenIcon = greenIcon.resize({ width: 3, height: 10 });

const orangeBuf = Buffer.from([0, 165, 255, 0]);
let orangeIcon = nativeImage.createFromBuffer(orangeBuf, {
  width: 1,
  height: 1,
});
orangeIcon = orangeIcon.resize({ width: 3, height: 10 });

const cyanBuf = Buffer.from([255, 255, 0, 0]);
let cyanIcon = nativeImage.createFromBuffer(cyanBuf, { width: 1, height: 1 });
cyanIcon = cyanIcon.resize({ width: 3, height: 10 });

const purpleBuf = Buffer.from([128, 0, 128, 0]);
let purpleIcon = nativeImage.createFromBuffer(purpleBuf, {
  width: 1,
  height: 1,
});
purpleIcon = purpleIcon.resize({ width: 3, height: 10 });

const pinkBuf = Buffer.from([203, 192, 255, 0]);
let pinkIcon = nativeImage.createFromBuffer(pinkBuf, { width: 1, height: 1 });
pinkIcon = pinkIcon.resize({ width: 3, height: 10 });

export class ContextMenuService {
  private readonly _locales: { t: (key: string) => string };

  constructor(
    @IPreferenceService private readonly _preferenceService: PreferenceService
  ) {
    this._locales = loadLocales(
      this._preferenceService.get("language") as string
    );
  }

  showPaperDataMenu(allowEdit: boolean, windowId: string) {
    const scraperPrefs = this._preferenceService.get("scrapers") as Record<
      string,
      ScraperPreference
    >;

    let scraperMenuTemplate: Record<string, any> = [];
    for (const [name, scraperPref] of Object.entries(scraperPrefs)) {
      if (scraperPref.enable) {
        scraperMenuTemplate.push({
          label: scraperPref.name,
          click: () => {
            // event.sender.send("data-context-menu-scrape-from", [
            //   scraperPref.name,
            // ]);
          },
        });
      }
    }

    const template = [
      {
        label: this._locales.t("menu.open"),
        accelerator: "Enter",
        click: () => {
          // event.sender.send("data-context-menu-open");
        },
      },
      {
        label: isMac
          ? this._locales.t("menu.showinfinder")
          : this._locales.t("menu.showinexplore"),
        click: () => {
          // event.sender.send("data-context-menu-showinfinder");
        },
      },
      { type: "separator" },
      {
        label: this._locales.t("menu.edit"),
        enabled: allowEdit,
        accelerator: isMac ? "cmd+e" : "ctrl+e",
        click: () => {
          // event.sender.send("data-context-menu-edit");
        },
      },
      {
        label: this._locales.t("menu.rescrape"),
        accelerator: isMac ? "cmd+r" : "ctrl+r",
        click: () => {
          // event.sender.send("data-context-menu-scrape");
        },
      },

      {
        label: this._locales.t("menu.rescrapefrom"),
        submenu: scraperMenuTemplate,
      },

      {
        label: this._locales.t("menu.delete"),
        click: () => {
          // event.sender.send("data-context-menu-delete");
        },
      },
      {
        label: this._locales.t("menu.toggleflag"),
        accelerator: isMac ? "cmd+f" : "ctrl+f",
        click: () => {
          // event.sender.send("data-context-menu-flag");
        },
      },
      { type: "separator" },
      {
        label: this._locales.t("menu.export"),
        submenu: [
          {
            label: "BibTex",
            accelerator: isMac ? "cmd+shift+c" : "ctrl+shift+c",
            click: () => {
              // event.sender.send("data-context-menu-export-bibtex");
            },
          },
          {
            label: this._locales.t("menu.bibtexkey"),
            accelerator: isMac ? "cmd+shift+k" : "ctrl+shift+k",
            click: () => {
              // event.sender.send("data-context-menu-export-bibtex-key");
            },
          },
          {
            label: this._locales.t("menu.plaintext"),
            click: () => {
              // event.sender.send("data-context-menu-export-plain");
            },
          },
        ],
      },
    ];
    // @ts-ignore
    const menu = Menu.buildFromTemplate(template);
    menu.popup();
  }

  showFeedDataMenu(windowId: string) {
    const template = [
      {
        label: this._locales.t("menu.open"),
        accelerator: "Enter",
        click: () => {
          // event.sender.send("data-context-menu-open");
        },
      },
      { type: "separator" },
      {
        label: this._locales.t("menu.addtolibrary"),
        click: () => {
          // event.sender.send("feed-data-context-menu-add");
        },
      },
      {
        label: this._locales.t("menu.toggleread"),
        click: () => {
          // event.sender.send("feed-data-context-menu-read");
        },
      },
    ];
    // @ts-ignore
    const menu = Menu.buildFromTemplate(template);
    menu.popup();
  }

  showSidebarMenu(data: string, type: string, windowId: string) {
    const template = [
      {
        label: "Blue",
        click: () => {
          // event.sender.send("sidebar-context-menu-color", [data, type, "blue"]);
        },
        icon: blueIcon,
      },
      {
        label: "Red",
        click: () => {
          // event.sender.send("sidebar-context-menu-color", [data, type, "red"]);
        },
        icon: redIcon,
      },
      {
        label: "Yellow",
        click: () => {
          // event.sender.send("sidebar-context-menu-color", [
          //   data,
          //   type,
          //   "yellow",
          // ]);
        },
        icon: yellowIcon,
      },
      {
        label: "Green",
        click: () => {
          // event.sender.send("sidebar-context-menu-color", [
          //   data,
          //   type,
          //   "green",
          // ]);
        },
        icon: greenIcon,
      },
      {
        label: "Orange",
        click: () => {
          // event.sender.send("sidebar-context-menu-color", [
          //   data,
          //   type,
          //   "orange",
          // ]);
        },
        icon: orangeIcon,
      },
      {
        label: "Cyan",
        click: () => {
          // event.sender.send("sidebar-context-menu-color", [data, type, "cyan"]);
        },
        icon: cyanIcon,
      },
      {
        label: "Purple",
        click: () => {
          // event.sender.send("sidebar-context-menu-color", [
          //   data,
          //   type,
          //   "purple",
          // ]);
        },
        icon: purpleIcon,
      },
      {
        label: "Pink",
        click: () => {
          // event.sender.send("sidebar-context-menu-color", [data, type, "pink"]);
        },
        icon: pinkIcon,
      },
      { type: "separator" },
      {
        label: this._locales.t("menu.delete"),
        click: () => {
          // event.sender.send("sidebar-context-menu-delete", [data, type]);
        },
      },
    ];
    if (type === "feed") {
      template.push({
        label: this._locales.t("menu.refresh"),
        click: () => {
          // event.sender.send("sidebar-context-menu-feed-refresh", [data, type]);
        },
      });
    } else if (type === "PaperPaperSmartFilter") {
    } else {
      template.push({
        label: this._locales.t("menu.edit"),
        click: () => {
          // event.sender.send("sidebar-context-menu-edit", [data, type]);
        },
      });
    }
    // @ts-ignore
    const menu = Menu.buildFromTemplate(template);
    menu.popup();
  }

  showSupMenu(fileURL: string, windowId: string) {
    const template = [
      {
        label: this._locales.t("menu.delete"),
        click: () => {
          // event.sender.send("sup-context-menu-delete", fileURL);
        },
      },
    ];
    // @ts-ignore
    const menu = Menu.buildFromTemplate(template);
    menu.popup();
  }

  showThumbnailMenu(fileURL: string, windowId: string) {
    const template = [
      {
        label: this._locales.t("menu.replace"),
        click: () => {
          // event.sender.send("thumbnail-context-menu-replace", args);
        },
      },
      {
        label: this._locales.t("menu.refresh"),
        click: () => {
          // event.sender.send("thumbnail-context-menu-refresh", args);
        },
      },
    ];
    // @ts-ignore
    const menu = Menu.buildFromTemplate(template);
    menu.popup();
  }
}
