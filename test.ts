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
