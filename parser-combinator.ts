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

export type ParserFailure<I> = {
  parserState: ParserInput<I>
  result: {
    type: "error"
    error: string
  }
}

export type ParserOutput<I, O> = ParserSuccess<I, O> | ParserFailure<I>

export type ParserResult<I, O> = ParserSuccess<I, O> | ParserFailure<I>

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

export function failure<I>(
  parserState: ParserInput<I>,
  error: string
): ParserFailure<I> {
  return {
    parserState,
    result: { type: "error", error },
  }
}

export function char(c: string): Parser<string, string> {
  return (input: ParserInput<string>) => {
    const { index, input: str } = input
    if (str.at(index) === c) return success({ input: str, index: index + 1 }, c)
    return failure(input, `expected the character ${c}`)
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
  parser1: Parser<I, O1>,
  parser2: Parser<I, O2>
): Parser<I, O1 | O2> {
  return (input: ParserInput<I>) => {
    const result1 = parser1(input)
    if (result1.result.type === "success") return result1
    const result2 = parser2(input)
    if (result2.result.type === "success") return result2
    return failure(input, `${result1.result.error} or ${result2.result.error}`)
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
    return failure(result.parserState, result.result.error)
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
      return failure(input, "expected at least one of something")
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
      return failure(result1.parserState, result1.result.error)
    const result2 = parser2(result1.parserState)
    if (result2.result.type === "error")
      return failure(result2.parserState, result2.result.error)
    return success(result2.parserState, [
      result1.result.value,
      result2.result.value,
    ])
  }
}
