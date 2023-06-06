import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts"
import { number } from "./onsclang.ts"
import { parseString } from "../parser-combinator.ts"

Deno.test("number test", () => {
  // TODO: figure out better way to write these tests
  const numberLiteral = "123"
  assertEquals(parseString(number, numberLiteral), {
    parserState: { input: numberLiteral.split(""), index: 3 },
    result: { type: "success", value: 123 },
  })

  const numberLiteral2 = "123.123"
  assertEquals(parseString(number, numberLiteral2), {
    parserState: { input: numberLiteral2.split(""), index: 7 },
    result: { type: "success", value: 123.123 },
  })

  const numberLiteral3 = "123.123.123"
  assertEquals(parseString(number, numberLiteral3), {
    parserState: { input: numberLiteral3.split(""), index: 7 },
    result: { type: "success", value: 123.123 },
  })

  // TODO: add case starting with 0

  // TODO: make failing tests
})
