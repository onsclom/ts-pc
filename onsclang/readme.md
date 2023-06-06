# onsclang

A simple (but hopefully expressive expressive) language using S-expressions. And it is not a Lisp. The inspiration for this came from listening to [Devine Lu Linvega](https://wiki.xxiivv.com/site/home.html) talk on the [Future of Coding](https://futureofcoding.org/) podcast. They talked about how their initial misconception of Lisp resulted in them implementing an interesting, original language. When I was first learning about Lisp I imagined a different version of it too. Here it is!

# examples

```
(print "hello world")
; hello world
```

```
(print (+ 1 (* 2 3))) 
; 7
```

```
(def name (prompt "what is your name?"))
(print (concat "hello, " name "!"))
; hello, austin!
```

```
(print 
  (if (< .5 (random))
        "heads" "tails"))
; heads
```

```
; advent of code 2022 day 1

; using reduce 

(def puzzle-input (read-file "input.txt"))

(def reduced-input
  (reduce 
    (lines puzzle-input) 
    (fn [[cur-sum cur-max], cur]
      (if (= "" cur)
        [0 (max sum cur-max)]
        [(cur-sum (number cur)) cur-max]))
    [0 0])) ; [current-sum current-max]

(print (max reduced-input))

; ==========================

; using map

(def parsed-input
  (split
    (map (lines puzzle-input)
      (fn [line] 
        (if (= line "") line
          (parse-number line)))))
    "")

(def sums
  (map parsed-input sum))

(print (max sums))
```

TODO:
* make examples using `[]` and `{}` for immutable data like clojure


