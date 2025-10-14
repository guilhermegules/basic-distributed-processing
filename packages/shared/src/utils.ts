import fs from "fs";
import readline from "readline";

export async function* readFileChunks(
  path: string,
  linesPerChunk: number
): AsyncGenerator<string[]> {
  const fileStream = fs.createReadStream(path, { encoding: "utf8" });

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let chunk: string[] = [];

  for await (const line of rl) {
    chunk.push(line);
    if (chunk.length === linesPerChunk) {
      yield chunk;
      chunk = [];
    }
  }

  if (chunk.length > 0) {
    yield chunk;
  }
}
