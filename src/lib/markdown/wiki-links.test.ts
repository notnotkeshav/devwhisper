import { describe, expect, it } from "vitest";
import { extractWikiLinks, replaceWikiLinks } from "./wiki-links";

describe("wiki links", () => {
  it("extracts unique wiki links with slugs and aliases", () => {
    expect(extractWikiLinks("[[redis pubsub|Redis Pub/Sub]] and [[websockets]]")).toEqual([
      { label: "redis pubsub", slug: "redis-pubsub", alias: "Redis Pub/Sub" },
      { label: "websockets", slug: "websockets", alias: undefined }
    ]);
  });

  it("renders wiki links as portable markdown links", () => {
    expect(replaceWikiLinks("Compare [[redis pubsub]] with [[websockets|WS]].")).toBe(
      "Compare [redis pubsub](/kb/redis-pubsub) with [WS](/kb/websockets)."
    );
  });
});
