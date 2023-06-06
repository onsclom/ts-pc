/*
A parser for [fe](https://github.com/rxi/fe).
*/

import * as P from "../parser-combinator.ts"

const lParen = P.char("(")

const rParen = P.char(")")

const numberLiteral = P.map(P.oneOrMore(P.digit), (digits) =>
  Number(digits.join(""))
)

type Identifier = {
  type: "identifier"
  value: string
}

const identifier = P.map(
  P.oneOrMore(P.notOneOfChar(["(", ")", " ", "\n", "\t", "\r", '"', "'", "`"])),
  (chars): Identifier => ({
    type: "identifier",
    value: chars.join(""),
  })
)

const quote = P.char('"')

const nonQuoteChars = P.zeroOrMore(P.notOneOfChar(['"']))

const stringLiteral = P.map(
  P.sequence(quote, P.sequence(nonQuoteChars, quote)),
  (result) => result[1][0].join("")
)

const seperatingWhitespace = P.oneOrMore(P.whitespace)

const atom = P.or(
  P.or(P.or(numberLiteral, stringLiteral), identifier),
  P.lazy(() => sExpression)
)

type SExpression = (string | number | Identifier | SExpression)[]

const atomList: P.Parser<string, SExpression> = P.seperatedBy(
  atom,
  seperatingWhitespace
)

const sExpression = P.map(
  P.sequence(lParen, P.sequence(P.skipWhitespace(atomList), rParen)),
  (result) => result[1][0]
)

console.log(
  P.parseString(
    sExpression,
    `(  doesItAllow? + ( "test big string" okay 3 ) 2 )`
  )
)

// TODO: write tests for fe
