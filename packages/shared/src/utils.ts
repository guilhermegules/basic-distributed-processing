import readline from "readline";
import { Readable } from "stream";

export async function* readFileFromBuffer(
  buffer: Buffer,
  linesPerChunk: number
): AsyncGenerator<string[]> {
  const stream = Readable.from(buffer.toString("utf-8").split("/\r?\n/"));

  const rl = readline.createInterface({
    input: stream,
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
