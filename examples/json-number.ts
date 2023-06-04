import * as P from "../parser-combinator.ts"
import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts"

const optionalNegative = P.optional(P.char("-"))

const nonZeroDigits = [1, 2, 3, 4, 5, 6, 7, 8, 9]

const nonZeroDigitParser = nonZeroDigits
  .map((d) => P.char(d.toString()))
  .reduce((acc, parser) => P.or(acc, parser))

const digitParser = P.or(nonZeroDigitParser, P.char("0"))

const digitsStartingWithoutZero = P.sequence(
  nonZeroDigitParser,
  P.zeroOrMore(digitParser)
)

Deno.test("json number parser", () => {
  assertEquals(P.parseString(digitsStartingWithoutZero, "123"), {
    parserState: { input: "123".split(""), index: 3 },
    result: { type: "success", value: ["1", ["2", "3"]] },
  })

  // the error message is really long
  const result = P.parseString(digitsStartingWithoutZero, "0123")
  assertEquals(result.result.type, "error")
})
