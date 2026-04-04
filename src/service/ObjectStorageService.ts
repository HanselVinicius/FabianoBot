import {
    S3Client,
    GetObjectCommand
} from "@aws-sdk/client-s3";

import { Readable } from "node:stream";

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

    public async getObjectStream(key: string): Promise<Readable> {
        const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: key
        });

        const response = await this.client.send(command);

        if (!response.Body) {
            throw new Error("Empty object body");
        }

        return response.Body as Readable;
    }
}