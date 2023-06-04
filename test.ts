import * as P from "./parser-combinator.ts"
import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts"

Deno.test("char parser", () => {
  const aParser = P.char("a")
  assertEquals(aParser({ input: "abc".split(""), index: 0 }), {
    parserState: { input: "abc".split(""), index: 1 },
    result: { type: "success", value: "a" },
  })
  assertEquals(aParser({ input: "abc".split(""), index: 1 }), {
    parserState: { input: "abc".split(""), index: 1 },
    result: { type: "error", error: "expected the character a" },
  })
  assertEquals(aParser({ input: "abc".split(""), index: 10 }), {
    parserState: { input: "abc".split(""), index: 10 },
    result: { type: "error", error: "expected the character a" },
  })
})

Deno.test("parse and string parse", () => {
  const aParser = P.char("a")
  assertEquals(P.parse(aParser, "abc".split("")), {
    parserState: { input: "abc".split(""), index: 1 },
    result: { type: "success", value: "a" },
  })
  assertEquals(P.parseString(aParser, "abc"), {
    parserState: { input: "abc".split(""), index: 1 },
    result: { type: "success", value: "a" },
  })
})

Deno.test("or parser", () => {
  const aOrBParser = P.or(P.char("a"), P.char("b"))
  assertEquals(aOrBParser({ input: "abc".split(""), index: 0 }), {
    parserState: { input: "abc".split(""), index: 1 },
    result: { type: "success", value: "a" },
  })
  assertEquals(aOrBParser({ input: "abc".split(""), index: 1 }), {
    parserState: { input: "abc".split(""), index: 2 },
    result: { type: "success", value: "b" },
  })
  assertEquals(aOrBParser({ input: "abc".split(""), index: 2 }), {
    parserState: { input: "abc".split(""), index: 2 },
    result: {
      type: "error",
      error: "expected the character a or expected the character b",
    },
  })
})

Deno.test("map parser", () => {
  const aParser = P.char("a")
  const aToBParser = P.map(aParser, (a) => a + "b")
  assertEquals(P.parseString(aToBParser, "abc"), {
    parserState: { input: "abc".split(""), index: 1 },
    result: { type: "success", value: "ab" },
  })
})

Deno.test("zero or more parser", () => {
  const aParser = P.char("a")
  const zeroOrMoreAParser = P.zeroOrMore(aParser)
  assertEquals(P.parseString(zeroOrMoreAParser, "abc"), {
    parserState: { input: "abc".split(""), index: 1 },
    result: { type: "success", value: ["a"] },
  })
  assertEquals(P.parseString(zeroOrMoreAParser, "aaaabc"), {
    parserState: { input: "aaaabc".split(""), index: 4 },
    result: { type: "success", value: ["a", "a", "a", "a"] },
  })
  assertEquals(P.parseString(zeroOrMoreAParser, "bc"), {
    parserState: { input: "bc".split(""), index: 0 },
    result: { type: "success", value: [] },
  })
})

Deno.test("one or more parser", () => {
  const aParser = P.char("a")
  const oneOrMoreAParser = P.oneOrMore(aParser)
  assertEquals(P.parseString(oneOrMoreAParser, "abc"), {
    parserState: { input: "abc".split(""), index: 1 },
    result: { type: "success", value: ["a"] },
  })
  assertEquals(P.parseString(oneOrMoreAParser, "aaaabc"), {
    parserState: { input: "aaaabc".split(""), index: 4 },
    result: { type: "success", value: ["a", "a", "a", "a"] },
  })
  assertEquals(P.parseString(oneOrMoreAParser, "bc"), {
    parserState: { input: "bc".split(""), index: 0 },
    result: { type: "error", error: "expected at least one of something" },
  })
})

Deno.test("optional parser", () => {
  const aParser = P.char("a")
  const optionalAParser = P.optional(aParser)
  assertEquals(P.parseString(optionalAParser, "abc"), {
    parserState: { input: "abc".split(""), index: 1 },
    result: { type: "success", value: "a" },
  })
  assertEquals(P.parseString(optionalAParser, "bc"), {
    parserState: { input: "bc".split(""), index: 0 },
    result: { type: "success", value: null },
  })
})

Deno.test("sequence parser", () => {
  const aParser = P.char("a")
  const bParser = P.char("b")
  assertEquals(P.parseString(P.sequence(aParser, bParser), "abc"), {
    parserState: { input: "abc".split(""), index: 2 },
    result: { type: "success", value: ["a", "b"] },
  })
  assertEquals(P.parseString(P.sequence(aParser, bParser), "bc"), {
    parserState: { input: "bc".split(""), index: 0 },
    result: { type: "error", error: "expected the character a" },
  })
  assertEquals(P.parseString(P.sequence(aParser, bParser), "ac"), {
    parserState: { input: "ac".split(""), index: 1 },
    result: { type: "error", error: "expected the character b" },
  })
})
