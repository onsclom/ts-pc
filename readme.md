# TypeScript Parser Combinator Library

## Why?

Building a parser combinator library in TypeScript sounds like a fun challenge. I have been interested in Deno, functional programming, TypeScript, and test driven development. This project will be combining all of that. And after it is done, hopefully I'll have a parser combinator that I can use well. It will be fun to do some parsing with it.

## Potential Challenges

Parser combinators like `or` or `and` are tricky to type. Normally they take 1 to many arguments, so other parser combinator libraries will lie to TypeScript to get useful types. I don't really want to fake types, so I might just make these combinators always take 2 arguments. Maybe I'll change my mind though.

EDIT: I changed my mind, it's so much more fun to use these with more than 2 arguments. Though I'm still not happy about having to lie to TypeScript.

Useful error messages are tricky. I'm going to start by going with my gut. There will be error messages, but they may not optimally useful.

Resuming on failure is tricky. I actually have no idea how to do this and I actually don't really want to figure it out yet. For now I'll proceed without caring about this.

I am not great with type classes. In an optimal world I would learn all the necessary type classes and use something like `fp-ts`, but this sounds less fun than just winging it. Maybe I will come back and redo this `fp-ts` later.

# Dev

I enjoy the workflow of watching tests as I program:

```bash
deno test --watch test.ts
```