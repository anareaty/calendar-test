import type { Moment } from "moment";
import type { TFile } from "obsidian";
import type { IDayMetadata, IDot } from "obsidian-calendar-ui";
import { getDailyNote, getWeeklyNote } from "obsidian-daily-notes-interface";
import { get } from "svelte/store";
import { getMonthlyNote } from "src/io/monthlyNotes"

import { DEFAULT_WORDS_PER_DOT } from "src/constants";

import { dailyNotes, settings, weeklyNotes } from "../stores";
import { clamp, getWordCount } from "../utils";

const NUM_MAX_DOTS = 5;

export async function getWordLengthAsDots(note: TFile): Promise<number> {
  const { wordsPerDot = DEFAULT_WORDS_PER_DOT } = get(settings);
  if (!note || wordsPerDot <= 0) {
    return 0;
  }
  const fileContents = await window.app.vault.cachedRead(note);

  const wordCount = getWordCount(fileContents);
  const numDots = wordCount / wordsPerDot;
  return clamp(Math.floor(numDots), 1, NUM_MAX_DOTS);
}

export async function getDotsForDailyNote(
  dailyNote: TFile | null
): Promise<IDot[]> {
  if (!dailyNote) {
    return [];
  }
  const numSolidDots = await getWordLengthAsDots(dailyNote);

  const dots = [];
  for (let i = 0; i < numSolidDots; i++) {
    dots.push({
      color: "default",
      isFilled: true,
      className: ""
    });
  }
  return dots;
}




async function getWordLengthAsDotsMonthly(note: TFile, heading: any, headings: any) {
  const { wordsPerDot = DEFAULT_WORDS_PER_DOT } = get(settings);
  if (!note || wordsPerDot <= 0) {
      return 0;
  }

  const fileContents = await window.app.vault.cachedRead(note);
  let contentArray = fileContents.split("\n")
  let sectionStartLine = heading.position.start.line
  let sectionEndLine = contentArray.length
  let headingIndex = headings.indexOf(heading)
  let nextHeading = headings[headingIndex + 1]

  if (nextHeading) {
      sectionEndLine = nextHeading.position.start.line
  }

  contentArray = contentArray.slice(sectionStartLine, sectionEndLine)
  let sectionContent = contentArray.join("\n")

  const wordCount = getWordCount(sectionContent);
  const numDots = wordCount / wordsPerDot;
  return clamp(Math.floor(numDots), 1, NUM_MAX_DOTS);
}



async function getDotsForMonthlyNote(date: Moment) {

  let options = get(settings)

  let monthlyNote = getMonthlyNote(date, options)

  if (!monthlyNote) {
      return [];
  }

  let headerString = date.format(options.monthlyDayFormat)

  let cache = window.app.metadataCache.getFileCache(monthlyNote)
  let headings = cache!.headings
  
  let heading = headings!.find(h => h.heading.toLowerCase() == headerString.toLowerCase())

  if (!heading) {
      return [];
  }


  const numSolidDots = await getWordLengthAsDotsMonthly(monthlyNote, heading, headings);
  const dots = [];
  for (let i = 0; i < numSolidDots; i++) {
      dots.push({
          color: "default",
          isFilled: true,
          className: ""
      });
  }
  return dots;
}

export const wordCountSource:any = {
  getDailyMetadata: async (date: Moment): Promise<IDayMetadata> => {

    const file = getDailyNote(date, get(dailyNotes));
    let dots = await getDotsForDailyNote(file);

    if (!file) {
      dots = await getDotsForMonthlyNote(date);
    }

    return {
      dots,
    };
  },

  getWeeklyMetadata: async (date: Moment): Promise<IDayMetadata> => {
    const file = getWeeklyNote(date, get(weeklyNotes));
    const dots = await getDotsForDailyNote(file);

    return {
      dots,
    };
  },
};
