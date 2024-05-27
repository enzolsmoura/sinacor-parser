import { parseNote } from "./notes/note-parser";
import { extractTextFromPDF, writeFile } from "./handler/file-handler";
import * as fs from "fs";
import { groupNotes } from "./utils/groupNotes";

const holderList = ["bradesco", "agora"];

holderList.forEach(async (holder) => {
  const pdfDirectory: string = `src/files/pdf/${holder}`;
  const files = fs.readdirSync(pdfDirectory);
  files.forEach(async (file) => {
    const pdfPath: string = `${pdfDirectory}/${file}`;
    const text = await extractTextFromPDF(pdfPath); // Extract text from PDF
    if (text) {
      const txtPath = `src/files/txt/${holder}/${file.replace(
        ".pdf",
        ".txt"
      )}`;
      await writeFile(txtPath, text); // Write the text to a file
    }
  });
});

const notes = holderList.map((holder) => {
  const txtDirectory: string = `src/files/txt/${holder}`;
  const files = fs.readdirSync(txtDirectory);
  const notes = files.map((file) => {
    const txtPath: string = `${txtDirectory}/${file}`;
    const text = fs.readFileSync(txtPath, "utf8");
    return parseNote(text);
  });  
  const groupedNotes = groupNotes(notes);
  return groupedNotes;
});

notes.forEach((note, holder)=>{
    fs.writeFileSync(`src/out/notas_${holderList[holder]}.json`, JSON.stringify(note));
})
