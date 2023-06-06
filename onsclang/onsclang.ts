import * as P from "../parser-combinator.ts"

const lParen = P.char("(")

const rParen = P.char(")")

/*
Number literals have some interesting edge cases

Valid numbers:
  20
  0
  -241
  12.324
  12.0
  .2321
  1. // seems easier to just allow this, even if a little strange

Invalid numbers:
  1.2.3 // => (2 seperate numbers) 1.2, .3
  01 // this is octal in some langs, but i don't want to support that
  i don't care to support scientific notation
  --1 // this gets weird, i won't support this
  . // this is not a valid number
*/

const nonZeroDigits = [1, 2, 3, 4, 5, 6, 7, 8, 9]

const nonZeroDigit = nonZeroDigits
  .map((d) => P.char(d.toString()))
  .reduce((acc, parser) => P.or(acc, parser))

const digit = P.or(nonZeroDigit, P.char("0"))

const digitsStartingWithoutZero = P.map(
  P.sequence(nonZeroDigit, P.zeroOrMore(digit)),
  ([firstDigit, rest]) => [firstDigit, ...rest]
)

const digitsWithOptionalFraction = P.map(
  P.sequence(
    digitsStartingWithoutZero,
    P.optional(P.sequence(P.char("."), P.zeroOrMore(digit)))
  ),
  ([whole, fraction]) =>
    fraction === null ? whole : [...whole, ".", ...fraction[1]]
)

const fractionalNumber = P.map(
  P.sequence(P.char("."), P.oneOrMore(digit)),
  ([_, digits]) => ["0", ".", ...digits]
)

// probably should do more than just map to number
// but should be good enough for now
const positiveNumber = P.or(
  P.map(P.char("0"), (_) => ["0"]),
  digitsWithOptionalFraction,
  fractionalNumber
)

export const number = P.map(
  P.sequence(P.optional(P.char("-")), positiveNumber),
  ([sign, number]) => Number((sign ? ["-", ...number] : number).join(""))
)
