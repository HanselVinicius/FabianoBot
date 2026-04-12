import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

export class ObjectStorageService {

    private client: S3Client;
    private bucket: string;

    constructor() {
        this.bucket = String(process.env.OBJECT_STORAGE_BUCKET);

        this.client = new S3Client({
            region: "us-east-1",
            endpoint: String(process.env.OBJECT_STORAGE_URL),
            credentials: {
                accessKeyId: String(process.env.OBJECT_STORAGE_ID),
                secretAccessKey: String(process.env.OBJECT_STORAGE_SECRET),
            },
        });
    }

    public async downloadToFile(key: string, outputDir: string): Promise<string> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucket,
                Key: key
            });

            const response = await this.client.send(command);

            if (!response.Body) {
                throw new Error("Empty object body");
            }

            const filePath = path.join(outputDir, key);

            await pipeline(response.Body as any, createWriteStream(filePath));

            return filePath;
        } catch (err) {
            console.error('error trying to download object with key: ', key);
            throw err;
        }
    }
}