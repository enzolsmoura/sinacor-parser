import * as fs from "fs";
import * as path from "path";
import { noteNumberRegex } from "../regex/regexes";
import pdf from "pdf-parse";

async function extractTextFromPDF(filePath: string): Promise<string | null> {
  try {
    const dataBuffer = fs.readFileSync(filePath); // Read the file as a buffer
    const data = await pdf(dataBuffer); // Parse the PDF content
    return data.text; // Log the text content of the PDF
  } catch (error) {
    console.error("Error parsing PDF:", error);
    return null;
  }
}

async function writeFile(filePath: string, data: string): Promise<void> {
  try {
    fs.writeFileSync(filePath, data); // Write the data to a file
    console.log("File written successfully");
  } catch (error) {
    console.error("Error writing file:", error);
  }
}

async function main() {
  const text = await extractTextFromPDF(pdfPath); // Extract text from PDF
  if (text) {
    const txtPath = "../assets/txt/nota_bradesco.txt";
    await writeFile(txtPath, text); // Write the text to a file
  }
}
const pdfPath: string = "../assets/pdf/nota_bradesco.pdf";
main();
