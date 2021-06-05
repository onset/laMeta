/* --------------------------------------------------------------------
  Set up the stuff handled by lingui
  ---------------------------------------------------------------------*/
import { i18n as i18nFromLinguiCore } from "@lingui/core";
import userSettings from "./UserSettings";
import { remote } from "electron";
import { t } from "@lingui/macro";
// tslint:disable-next-line: no-submodule-imports
import * as allPlurals from "make-plural/plurals"; // this is from lingui.

import moment from "moment";
import { FieldDefinition } from "../model/field/FieldDefinition";
import { IChoice } from "../model/field/Field";
import { loadOLACRoles } from "../model/Project/AuthorityLists/AuthorityLists";
import pupa from "pupa";

const languages = ["en", "es", "fr", "ps", "ru", "pt-BR"];
export const catalogs = {};
export let currentUILanguage: string;
// in the past we had to have our own version, with the upgrade to lingui 3
// this could probably go away.
export const i18n = i18nFromLinguiCore;

let olacRoles: IChoice[];

export function initializeLocalization() {
  // messages.js are generated by ``yarn lingui-compile``
  // languages.forEach(
  //   (code) => (catalogs[code] = require(`../../locale/${code}/messages.js`))
  // );

  currentUILanguage = userSettings.UILanguage;
  // if the language in the settings isn't one this version supports,
  // or if there was no setting for this and we have the default (empty string)
  if (languages.indexOf(currentUILanguage) < 0) {
    // See if their OS's language is one we support
    currentUILanguage = remote.app.getLocale();
    // Do we have a localization for that language? If not, the default is English.
    if (languages.indexOf(currentUILanguage) < 0) {
      currentUILanguage = "en";
    }
  }
  // TODO: lingui has fallback, so maybe we should not default to English above?

  setUILanguage(currentUILanguage, false);

  // //i18n.loadLocaleData("en", { plurals: en }) ;
  // i18n.load(
  //   currentUILanguage,
  //   require(`../../locale/${currentUILanguage}/messages.js`)
  // );
  // i18n.activate(currentUILanguage);

  // i18n = setupI18n({
  //   language: currentUILanguage,
  //   catalogs,
  // }).use(currentUILanguage);

  olacRoles = loadOLACRoles();
}

export function setUILanguage(code: string, reload: boolean = true): void {
  currentUILanguage = code;
  moment.locale(currentUILanguage); // this is a global change

  // we don't actually use this plural function but without it, we get console errors if we don't set this.
  const pluralFn = allPlurals[code] || allPlurals["en"];
  i18n.loadLocaleData(code, { plurals: pluralFn });
  i18n.load(
    currentUILanguage,
    require(`../../locale/${currentUILanguage}/messages.js`)
  );
  i18n.activate(code);
  userSettings.UILanguage = code;

  if (reload) remote.getCurrentWindow().reload();
}

// This is for strings that are not part of react, e.g. menus. They use this i18n variable to do localization

/* --------------------------------------------------------------------
  Handle the l10n of various data files while we wait for lingui to 
  be able to handle non-code input.
  ---------------------------------------------------------------------*/
// I don't have a way of making the lingui-extract scanner scan our fields.json5, so I just extracted this csv manually,
// and it lives as a second file on Crowdin.com that has to be translated.
const fields = require("../../locale/fields.csv");
const choices = require("../../locale/choices.csv");
const roles = require("../../locale/roles.csv");
const genres = require("../../locale/genres.csv");
const accessProtocols = require("../../locale/accessProtocols.csv");
const tips = require("../../locale/tips.csv"); // tooltips and specialinfo

// This is our own wrapper that is more unit-test friendly.
// call to this must have the comment /*18n*/ in order for the lingui scanner to find it
// e.g. translationMessage(/*18n*/{id: "foobar"})
export function translateMessage(arg: { id: string; values?: object }): string {
  if (i18n) {
    return i18n._(arg.id, arg.values);
  } else {
    // when unit testing, we just fill in the template
    if (arg.values) return pupa(arg.id, arg.values);
    else return arg.id;
  }
}

export function translateFileType(englishTypeName: string): string {
  switch (englishTypeName) {
    case "Project":
      return i18n._(t`Project`);
    case "Session":
      return i18n._(t`Session`);
    case "Person":
      return i18n._(t`Person`);
    case "Video":
      return i18n._(t`Video`);
    case "Image":
      return i18n._(t`Image`);
    case "Audio":
      return i18n._(t`Audio`);
    default:
      return englishTypeName; // e.g. "mp3"
  }
}

export function translateFieldLabel(fieldDef: FieldDefinition): string {
  if (fieldDef === undefined) {
    return "LABEL ERROR";
  }
  return getMatch(fields, fieldDef.englishLabel, "fields.csv");
}
export function translateTooltip(fieldDef: FieldDefinition): string {
  if (!fieldDef.tooltip) {
    return "";
  }
  return fieldDef.tooltip ? getMatch(tips, fieldDef.tooltip, "tips.csv") : "";
}

export function translateTooltipNotice(notice: string): string {
  return getMatch(tips, notice, "tips.csv");
}
export function translateSpecialInfo(fieldDef: FieldDefinition): string {
  if (!fieldDef.specialInfo) {
    return "";
  }
  return fieldDef.specialInfo
    ? getMatch(tips, fieldDef.specialInfo, "tips.csv")
    : "";
}
export function translateAccessProtocol(choice: string): string {
  return getMatch(accessProtocols, choice, "accessProtocols.csv");
}
export function translateChoice(choice: string, fieldName?: string): string {
  return getMatch(choices, choice, "choices.csv", fieldName);
}

export function translateRole(role: string) {
  const roleChoice: IChoice | undefined = olacRoles.find((c) => c.id === role);

  return getMatch(roles, roleChoice?.label || role, "roles.csv");
}

export function translateGenre(genre: string) {
  return getMatch(genres, genre, "genres.csv");
}
function getMatch(
  lines: any[],
  s: string,
  fileThatShouldHaveThis: string,
  fieldName?: string
): string {
  const match = lines.find((f) => f.en === s);

  if (currentUILanguage === "ps") {
    // do we have a column for english for this?
    if (match && match["en"]) return s + "✓";
    else {
      if (s && s.length > 0) {
        // at the moment we're not asking translators to take on translating country names, so we don't expect to find them in the locale/choices.csv file
        if (!fieldName || fieldName.toLowerCase().indexOf("country") < 0) {
          const forField = fieldName ? `for field ${fieldName}` : "";

          console.warn(
            `TODO: Add \t"${s}"\t to locale/${fileThatShouldHaveThis} ${forField}`
          );
        }
        return "MISSING-" + s;
      }
    }
  }

  if (match && match[currentUILanguage]) {
    return match[currentUILanguage];
  }
  //console.log(`No ${currentUILanguage} translation for ${s}, "${s}"`);
  return s;
}
