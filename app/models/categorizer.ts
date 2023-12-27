import { ObjectId } from "bson";
import { OID } from "./id";

export interface ICategorizerDraft {
  _id?: OID;
  _partition?: string;
  name?: string;
  count?: number;
  color?: string;
}

export class Categorizer {
  static schema: Record<string, any>;

  _id: OID;
  _partition: string;
  name: string;
  count: number;
  color?: string;

  constructor(object: ICategorizerDraft, initObjectId = false) {
    this._id = object._id || "";
    this._partition = object._partition || "";
    this.name = object.name || "";
    this.count = object.count || 0;
    this.color = object.color;

    if (initObjectId) {
      this._id = new ObjectId();
    }
  }

  initialize(object: ICategorizerDraft) {
    this._id = object._id || "";
    this._partition = object._partition || "";
    this.name = object.name || "";
    this.count = object.count || 0;
    this.color = object.color;

    return this;
  }
}

export class PaperTag extends Categorizer {
  static schema = {
    name: "PaperTag",
    primaryKey: "_id",
    properties: {
      _id: "objectId",
      _partition: "string?",
      name: "string",
      count: "int",
      color: "string?",
    },
  };

  constructor(object: ICategorizerDraft, initObjectId = false) {
    super(object, initObjectId);
  }
}

export class PaperFolder extends Categorizer {
  static schema = {
    name: "PaperFolder",
    primaryKey: "_id",
    properties: {
      _id: "objectId",
      _partition: "string?",
      name: "string",
      count: "int",
      color: "string?",
    },
  };

  constructor(object: ICategorizerDraft, initObjectId = false) {
    super(object, initObjectId);
  }
}

export enum Colors {
  red = "red",
  green = "green",
  blue = "blue",
  yellow = "yellow",
  orange = "orange",
  cyan = "cyan",
  purple = "purple",
  pink = "pink",
}

export enum CategorizerType {
  PaperTag = "PaperTag",
  PaperFolder = "PaperFolder",
}
