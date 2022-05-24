import { JP, Texts } from "../config/texts"

/**
 * Textsを取得します。
 * 現在は出し分ける必要がないため、必ず日本語Textsを返します。
 */
export const getTexts = (options?: {}): Texts => JP;