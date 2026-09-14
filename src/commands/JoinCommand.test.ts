import { beforeEach, describe, expect, it, vi } from "vitest";
import { entersState, joinVoiceChannel, VoiceConnectionStatus } from "@discordjs/voice";
import { AudioService } from "../service/AudioService.js";
import { JoinCommand } from "./JoinCommand.js";

vi.mock("@discordjs/voice", () => ({
    joinVoiceChannel: vi.fn(),
    entersState: vi.fn(),
    VoiceConnectionStatus: { Ready: "ready" },
}));

vi.mock("../service/AudioService.js", () => ({
    AudioService: vi.fn(function (this: any) {
        this.play = vi.fn();
    }),
}));

vi.mock("../service/ObjectStorageService.js", () => ({
    ObjectStorageService: vi.fn(function (this: any) {}),
}));

describe("JoinCommand", () => {
    const command = new JoinCommand();
    const reply = vi.fn().mockResolvedValue(undefined);
    const destroy = vi.fn();
    const connection = { id: "connection-id", destroy } as any;
    const mockedJoinVoiceChannel = vi.mocked(joinVoiceChannel);
    const mockedEntersState = vi.mocked(entersState);

    beforeEach(() => {
        reply.mockClear();
        destroy.mockClear();
        mockedJoinVoiceChannel.mockReturnValue(connection);
    });

    it("does nothing when content does not include !join", async () => {
        await command.execute(message("hello", guild(), memberWithChannel()));
        expect(reply).not.toHaveBeenCalled();
    });

    it("replies that a sound is needed when no sound name is given", async () => {
        await command.execute(message("!join", guild(), memberWithChannel()));
        expect(reply).toHaveBeenCalledWith("You need to specify a sound");
    });

    it("does nothing when the message has no guild", async () => {
        await command.execute({ content: "!join sound", reply } as any);
        expect(mockedJoinVoiceChannel).not.toHaveBeenCalled();
        expect(reply).not.toHaveBeenCalled();
    });

    it("replies that the user needs to be on a voice channel when not connected", async () => {
        await command.execute(message("!join sound", guild(), undefined));
        expect(reply).toHaveBeenCalledWith("You need to be on a voice channel.");
    });

    it("joins the voice channel and plays the sound", async () => {
        const channel = { id: "channel-id" };
        mockedJoinVoiceChannel.mockReturnValue(connection);
        mockedEntersState.mockResolvedValue(connection);

        await command.execute(message("!join bros", guild(), memberWithChannel(channel)));

        expect(mockedJoinVoiceChannel).toHaveBeenCalledWith({
            channelId: "channel-id",
            guildId: "guild-id",
            adapterCreator: "adapter",
        });
        expect(mockedEntersState).toHaveBeenCalledWith(connection, VoiceConnectionStatus.Ready, 5000);
        const audioServiceInstance = vi.mocked(AudioService).mock.instances[0] as any;
        expect(audioServiceInstance.play).toHaveBeenCalledWith(connection, "bros");
    });

    it("replies it does not have the sound and destroys the connection on error", async () => {
        mockedEntersState.mockRejectedValue(new Error("not ready"));

        await command.execute(message("!join bros", guild(), memberWithChannel()));

        expect(reply).toHaveBeenCalledWith("I didnt have this sound here broo");
        expect(destroy).toHaveBeenCalled();
    });

    function guild() {
        return { id: "guild-id", voiceAdapterCreator: "adapter" };
    }

    function memberWithChannel(channel = { id: "channel-id" }) {
        return { voice: { channel } };
    }

    function message(content: string, guild: any, member: any) {
        return { content, guild, member, reply } as any;
    }
});