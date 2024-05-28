import * as fs from "fs";
import pdf from "pdf-parse";

export async function extractTextFromPDF(
  filePath: string
): Promise<string | null> {
  try {
    const dataBuffer = fs.readFileSync(filePath); // Read the file as a buffer
    const data = await pdf(dataBuffer); // Parse the PDF content
    return data.text; // Log the text content of the PDF
  } catch (error) {
    console.error("Error parsing PDF:", error);
    return null;
  }
}

export async function writeFile(filePath: string, data: string): Promise<void> {
  try {
    fs.writeFileSync(filePath, data); // Write the data to a file
    console.log("File written successfully");
  } catch (error) {
    console.error("Error writing file:", error);
  }
}
