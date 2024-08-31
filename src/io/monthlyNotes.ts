import type { Moment } from "moment";
import type { TFile } from "obsidian";





export function getMonthlyNote(date: Moment, options: any): TFile | null {

  let monthlyNoteFolder = options.monthlyNoteFolder
  let dateTemplates = [...monthlyNoteFolder.matchAll(/({{date:)([^}]*)(}})/g)]

  dateTemplates.forEach(match => {
    let format = match[2]
    let formattedDate = date.format(format)
    monthlyNoteFolder = monthlyNoteFolder.replace(/({{date:)([^}]*)(}})/, formattedDate)
  })

  let monthlyNoteFormat = options.monthlyNoteFormat
  let monthNoteName = date.format(monthlyNoteFormat)
  let monthlyPath = monthlyNoteFolder + "/" + monthNoteName + ".md"

  let monthlyFile = window.app.vault.getAbstractFileByPath(monthlyPath) as TFile ?? null;
  return monthlyFile
}
