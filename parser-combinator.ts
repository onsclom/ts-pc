export type ParserInput<T> = {
  input: T[]
  index: number
}

export type ParserSuccess<I, O> = {
  parserState: ParserInput<I>
  result: {
    type: "success"
    value: O
  }
}

export type ParserError<I> = {
  parserState: ParserInput<I>
  result: {
    type: "error"
    error: string
  }
}

export type ParserOutput<I, O> = ParserSuccess<I, O> | ParserError<I>

export type ParserResult<I, O> = ParserSuccess<I, O> | ParserError<I>

export type Parser<I, O> = (input: ParserInput<I>) => ParserResult<I, O>

export function success<I, O>(
  parserState: ParserInput<I>,
  value: O
): ParserSuccess<I, O> {
  return {
    parserState,
    result: { type: "success", value },
  }
}

export function error<I>(
  parserState: ParserInput<I>,
  error: string
): ParserError<I> {
  return {
    parserState,
    result: { type: "error", error },
  }
}

export function char(c: string): Parser<string, string> {
  return (input: ParserInput<string>) => {
    const { index, input: str } = input
    if (str.at(index) === c) return success({ input: str, index: index + 1 }, c)
    return error(input, `expected the character ${c}`)
  }
}

export function parse<I, O>(
  parser: Parser<I, O>,
  input: I[]
): ParserResult<I, O> {
  return parser({ input, index: 0 })
}

export function parseString<O>(
  parser: Parser<string, O>,
  input: string
): ParserResult<string, O> {
  return parser({ input: input.split(""), index: 0 })
}

export function or<I, O1, O2>(
  p1: Parser<I, O1>,
  p2: Parser<I, O2>
): Parser<I, O1 | O2>
export function or<I, O1, O2, O3>(
  p1: Parser<I, O1>,
  p2: Parser<I, O2>,
  p3: Parser<I, O3>
): Parser<I, O1 | O2 | O3>
export function or<I, O1, O2, O3, O4>(
  p1: Parser<I, O1>,
  p2: Parser<I, O2>,
  p3: Parser<I, O3>,
  p4: Parser<I, O4>
): Parser<I, O1 | O2 | O3 | O4>
// deno-lint-ignore no-explicit-any
export function or<I>(...parsers: Parser<I, any>[]): Parser<I, any> {
  return (input: ParserInput<I>) => {
    for (const parser of parsers) {
      const output = parser(input)
      if (output.result.type === "success") return output
    }
    return error(input, "failed or parser")
  }
}

export function map<I, O1, O2>(
  parser: Parser<I, O1>,
  fn: (value: O1) => O2
): Parser<I, O2> {
  return (input: ParserInput<I>): ParserOutput<I, O2> => {
    const result = parser(input)
    if (result.result.type === "success")
      return success(result.parserState, fn(result.result.value))
    return error(result.parserState, result.result.error)
  }
}

type SuccessOnlyParser<I, O> = (
  parserInput: ParserInput<I>
) => ParserSuccess<I, O>

export function zeroOrMore<I, O>(
  parser: Parser<I, O>
): SuccessOnlyParser<I, O[]> {
  return (input: ParserInput<I>): ParserSuccess<I, O[]> => {
    const results: O[] = []
    let state = input
    while (true) {
      const result = parser({ input: state.input, index: state.index })
      if (result.result.type === "error") break
      results.push(result.result.value)
      state = result.parserState
    }
    return success(state, results)
  }
}

export function oneOrMore<I, O>(parser: Parser<I, O>): Parser<I, O[]> {
  return (input: ParserInput<I>): ParserOutput<I, O[]> => {
    const result = zeroOrMore(parser)(input)
    if (result.result.value.length === 0)
      return error(input, "expected at least one of something")
    return result
  }
}

export function optional<I, O>(
  parser: Parser<I, O>
): SuccessOnlyParser<I, O | null> {
  return (input: ParserInput<I>): ParserSuccess<I, O | null> => {
    const result = parser(input)
    if (result.result.type === "error") return success(input, null)
    return success(result.parserState, result.result.value)
  }
}

export function sequence<I, O1, O2>(
  parser1: Parser<I, O1>,
  parser2: Parser<I, O2>
): Parser<I, [O1, O2]> {
  return (input: ParserInput<I>): ParserOutput<I, [O1, O2]> => {
    const result1 = parser1(input)
    if (result1.result.type === "error")
      return error(result1.parserState, result1.result.error)
    const result2 = parser2(result1.parserState)
    if (result2.result.type === "error")
      return error(result2.parserState, result2.result.error)
    return success(result2.parserState, [
      result1.result.value,
      result2.result.value,
    ])
  }
}

export const digit = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  .map((digit) => char(digit.toString()))
  .reduce((prev, curr) => or(prev, curr))

export function notOneOfChar(chars: string[]): Parser<string, string> {
  return (input: ParserInput<string>): ParserOutput<string, string> => {
    const { index, input: str } = input
    const c = str.at(index)
    if (!c) return error(input, "expected a character")
    if (chars.includes(c))
      return error(input, `expected not one of ${chars.join(", ")}`)
    return success({ input: str, index: index + 1 }, c)
  }
}

export const whitespace = [" ", "\n", "\t", "\r"].map((c) => char(c)).reduce(or)

export function lazy<I, O>(parser: () => Parser<I, O>): Parser<I, O> {
  return (input: ParserInput<I>): ParserOutput<I, O> => parser()(input)
}

export function seperatedBy<I, O, O2>(
  parser: Parser<I, O>,
  seperator: Parser<I, O2>
) {
  return (input: ParserInput<I>): ParserOutput<I, O[]> => {
    const results: O[] = []
    let state = input
    while (true) {
      const result = parser({ input: state.input, index: state.index })
      if (result.result.type === "error") break
      results.push(result.result.value)
      state = result.parserState
      const seperatorResult = seperator(result.parserState)
      if (seperatorResult.result.type === "error") break
      state = seperatorResult.parserState
    }
    return success(state, results)
  }
}

export function skipWhitespace<O>(
  parser: Parser<string, O>
): Parser<string, O> {
  return map(
    sequence(zeroOrMore(whitespace), sequence(parser, zeroOrMore(whitespace))),
    ([, [value]]) => value
  )
}
