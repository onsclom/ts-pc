/*
Let's make a grammar that parses simple math expressions

Some examples:

  1 + 2 * 3 / 4
  ["+", "1", ["/", ["*", "2", "3"], "4"]]

  5 * 6 + 7 * 8
  ["+", ["*", "5", "6"], ["*", "7", "8"]]

Basically we allow single digit numbers, the operators 
+, -, *, / and we parse operator precedence correctly
*/

import * as P from "../parser-combinator.ts"

const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

const digitParser = digits
  .map((digit) => P.char(String(digit)))
  .reduce((acc, parser) => P.or(acc, parser))

const prec2Ops = ["*", "/"]

const prec2OpParser = prec2Ops
  .map((op) => P.char(op))
  .reduce((acc, parser) => P.or(acc, parser))

type Prec2Expr = [string, Prec2Expr, string] | string

const prec2ExprParser = P.map(
  P.sequence(digitParser, P.zeroOrMore(P.sequence(prec2OpParser, digitParser))),
  ([firstDigit, rest]) =>
    rest.reduce<Prec2Expr>((acc, [op, digit]) => [op, acc, digit], firstDigit)
)

console.log(P.parseString(prec2ExprParser, "1*2/3*4"))
// [ "*", [ "/", [ "*", "1", "2" ], "3" ], "4" ]

const prec1Ops = ["+", "-"]

const prec1OpParser = prec1Ops
  .map((op) => P.char(op))
  .reduce((acc, parser) => P.or(acc, parser))

type Prec1Expr = [string, Prec1Expr, Prec2Expr] | Prec2Expr

const prec1ExprParser = P.map(
  P.sequence(
    prec2ExprParser,
    P.zeroOrMore(P.sequence(prec1OpParser, prec2ExprParser))
  ),
  ([firstExpr, rest]) =>
    rest.reduce<Prec1Expr>((acc, [op, expr]) => [op, acc, expr], firstExpr)
)

console.log(P.parseString(prec1ExprParser, "1+2*3-4"))
// [ "-", [ "+", "1", [ "*", "2", "3" ] ], "4" ]

// TODO: allow optional whitespace between operators and operands
