import { beforeEach, describe, expect, it, vi } from "vitest";
import { CallBroosCommand } from "./CallBroosCommand.js";

describe("CallBroosCommand", () => {
    const command = new CallBroosCommand();
    const reply = vi.fn().mockResolvedValue(undefined);
    const message = () => ({ content: "", reply }) as any;

    beforeEach(() => {
        vi.unstubAllGlobals();
        process.env.NOCTIS_API_URL = "https://noctis.example.com/api/whatsapp/call";
        process.env.NOCTIS_API_KEY = "secret-key";
        reply.mockClear();
    });

    it("does nothing when content does not include !call", async () => {
        await command.execute(message());
        expect(reply).not.toHaveBeenCalled();
    });

    it("replies with the args when the API returns 201", async () => {
        const mockFetch = vi.fn().mockResolvedValue({ status: 201 });
        vi.stubGlobal("fetch", mockFetch);

        await command.execute(messageWith("!call bros 1"));

        expect(mockFetch).toHaveBeenCalledWith(
            "https://noctis.example.com/api/whatsapp/call",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": "secret-key",
                },
                body: JSON.stringify({
                    message: "CHAMADO PARA O DISCORD MENSAGEM: bros, 1",
                }),
            }
        );
        expect(reply).toHaveBeenCalledWith("Calling Broos with args: bros, 1");
    });

    it("replies with a failure message when the API returns a non-201 status", async () => {
        const mockFetch = vi.fn().mockResolvedValue({ status: 500 });
        vi.stubGlobal("fetch", mockFetch);

        await command.execute(messageWith("!call bros"));

        expect(reply).toHaveBeenCalledWith("Failed to call Broos. Please try again later.");
    });

    it("replies with a failure message when the API call throws", async () => {
        const mockFetch = vi.fn().mockRejectedValue(new Error("network error"));
        vi.stubGlobal("fetch", mockFetch);

        await command.execute(messageWith("!call bros"));

        expect(reply).toHaveBeenCalledWith("Failed to call Broos. Please try again later.");
    });

    function messageWith(content: string) {
        return { content, reply } as any;
    }
});