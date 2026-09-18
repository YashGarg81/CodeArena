// CodeArena — Multi-Language Problem Driver Matrix
// Provides standard stdin/stdout harnesses for sandboxed execution across languages

export const DRIVERS: Record<string, Record<string, string>> = {
    "two-sum": {
        js: `\nconst fs = require('fs');\ntry {\n  const lines = fs.readFileSync(0, 'utf-8').split(/\\r?\\n/).map(s => s.trim()).filter(Boolean);\n  if (lines.length >= 2) {\n    const nums = lines[0].split(/\\s+/).map(Number);\n    const target = Number(lines[1]);\n    const fn = typeof twoSum === 'function' ? twoSum : two_sum;\n    const res = fn(nums, target);\n    console.log(Array.isArray(res) ? res.slice().sort((a,b)=>a-b).join(' ') : "");\n  }\n} catch (e) { console.error(e.message); process.exit(1); }`,
        py: `\nimport sys\ntry:\n    lines = [l.strip() for l in sys.stdin.read().split('\\n') if l.strip()]\n    if len(lines) >= 2:\n        nums = list(map(int, lines[0].split()))\n        target = int(lines[1])\n        fn = two_sum if 'two_sum' in globals() else twoSum\n        res = fn(nums, target)\n        print(" ".join(map(str, sorted(res))) if isinstance(res, (list, tuple)) else "")\nexcept Exception as e:\n    sys.stderr.write(str(e)); sys.exit(1)`,
        cpp: `\n#include <iostream>\n#include <vector>\n#include <sstream>\n#include <algorithm>\nint main() {\n    std::string line;\n    if (std::getline(std::cin, line)) {\n        std::vector<int> nums; std::stringstream ss(line); int val;\n        while (ss >> val) nums.push_back(val);\n        int target; if (std::cin >> target) {\n            auto res = twoSum(nums, target);\n            std::sort(res.begin(), res.end());\n            for (size_t i = 0; i < res.size(); ++i) std::cout << res[i] << (i + 1 == res.size() ? "" : " ");\n            std::cout << std::endl;\n        }\n    }\n    return 0;\n}`,
        java: `\nclass Driver {\n    public static void main(String[] args) {\n        java.util.Scanner sc = new java.util.Scanner(System.in);\n        if (sc.hasNextLine()) {\n            String[] parts = sc.nextLine().trim().split("\\\\s+");\n            if (parts.length == 1 && parts[0].isEmpty()) parts = new String[0];\n            int[] nums = new int[parts.length];\n            for(int i=0; i<parts.length; i++) nums[i] = Integer.parseInt(parts[i]);\n            if(sc.hasNextInt()) {\n                int target = sc.nextInt();\n                int[] res = new Solution().twoSum(nums, target);\n                if(res != null && res.length == 2) {\n                    java.util.Arrays.sort(res);\n                    System.out.println(res[0] + " " + res[1]);\n                } else {\n                    System.out.println("");\n                }\n            }\n        }\n    }\n}`,
        go: `\nimport (\n\t"bufio"\n\t"fmt"\n\t"os"\n\t"sort"\n\t"strconv"\n\t"strings"\n)\n\nfunc main() {\n\tscanner := bufio.NewScanner(os.Stdin)\n\tif scanner.Scan() {\n\t\tline := strings.TrimSpace(scanner.Text())\n\t\tvar nums []int\n\t\tif line != "" {\n\t\t\tparts := strings.Split(line, " ")\n\t\t\tfor _, p := range parts {\n\t\t\t\tval, _ := strconv.Atoi(p)\n\t\t\t\tnums = append(nums, val)\n\t\t\t}\n\t\t}\n\t\tif scanner.Scan() {\n\t\t\ttarget, _ := strconv.Atoi(strings.TrimSpace(scanner.Text()))\n\t\t\tres := twoSum(nums, target)\n\t\t\tif len(res) == 2 {\n\t\t\t\tsort.Ints(res)\n\t\t\t\tfmt.Printf("%d %d\\n", res[0], res[1])\n\t\t\t} else {\n\t\t\t\tfmt.Println("")\n\t\t\t}\n\t\t}\n\t}\n}`,
        ts: `
import fs from "fs";
try {
  const lines = fs.readFileSync(0, "utf-8").split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  if (lines.length >= 2) {
    const nums = lines[0].split(/\s+/).map(Number);
    const target = Number(lines[1]);
    const fn = typeof twoSum === "function" ? twoSum : two_sum;
    const res = fn(nums, target);
    console.log(Array.isArray(res) ? res.slice().sort((a,b)=>a-b).join(" ") : "");
  }
} catch (e) { console.error(e.message); process.exit(1); }`
    },
    "reverse-string": {
        js: `\nconst fs = require('fs');\ntry {\n  const input = fs.readFileSync(0, 'utf-8').replace(/\\r?\\n$/, '');\n  console.log(reverseString(input));\n} catch (e) { console.error(e.message); process.exit(1); }`,
        py: `\nimport sys\ntry:\n    input_data = sys.stdin.read().rstrip('\\r\\n')\n    print(reverse_string(input_data))\nexcept Exception as e:\n    sys.stderr.write(str(e)); sys.exit(1)`,
        cpp: `\n#include <iostream>\n#include <string>\nint main() {\n    std::string s;\n    if (std::getline(std::cin, s)) {\n        std::cout << reverseString(s) << std::endl;\n    }\n    return 0;\n}`,
        java: `\nclass Driver {\n    public static void main(String[] args) {\n        java.util.Scanner sc = new java.util.Scanner(System.in);\n        if (sc.hasNextLine()) {\n            System.out.println(new Solution().reverseString(sc.nextLine()));\n        }\n    }\n}`,
        go: `\nimport (\n\t"bufio"\n\t"fmt"\n\t"os"\n)\n\nfunc main() {\n\tscanner := bufio.NewScanner(os.Stdin)\n\tif scanner.Scan() {\n\t\tfmt.Println(reverseString(scanner.Text()))\n\t}\n}`,
        ts: `
import fs from "fs";
try {
  const input = fs.readFileSync(0, "utf-8").replace(/\r?\n$/, "");
  console.log(reverseString(input));
} catch (e) { console.error(e.message); process.exit(1); }`
    },
    "fibonacci-number": {
        js: `\nconst fs = require('fs');\ntry {\n  const input = fs.readFileSync(0, 'utf-8').trim();\n  console.log(fib(Number(input)));\n} catch (e) { console.error(e.message); process.exit(1); }`,
        py: `\nimport sys\ntry:\n    input_data = sys.stdin.read().strip()\n    if input_data: print(fib(int(input_data)))\nexcept Exception as e:\n    sys.stderr.write(str(e)); sys.exit(1)`,
        cpp: `\n#include <iostream>\nint main() {\n    int n; if (std::cin >> n) std::cout << fib(n) << std::endl;\n    return 0;\n}`,
        java: `\nclass Driver {\n    public static void main(String[] args) {\n        java.util.Scanner sc = new java.util.Scanner(System.in);\n        if (sc.hasNextInt()) {\n            System.out.println(new Solution().fib(sc.nextInt()));\n        }\n    }\n}`,
        go: `\nimport (\n\t"fmt"\n)\n\nfunc main() {\n\tvar n int\n\tif _, err := fmt.Scan(&n); err == nil {\n\t\tfmt.Println(fib(n))\n\t}\n}`,
        ts: `
import fs from "fs";
try {
  const input = fs.readFileSync(0, "utf-8").trim();
  console.log(fib(Number(input)));
} catch (e) { console.error(e.message); process.exit(1); }`
    },
    "valid-parentheses": {
        js: `\nconst fs = require('fs');\ntry {\n  const s = fs.readFileSync(0, 'utf-8').trim();\n  console.log(isValid(s) ? 'true' : 'false');\n} catch (e) { console.error(e.message); process.exit(1); }`,
        py: `\nimport sys\ntry:\n    s = sys.stdin.read().strip()\n    print('true' if is_valid(s) else 'false')\nexcept Exception as e:\n    sys.stderr.write(str(e)); sys.exit(1)`,
        cpp: `\n#include <iostream>\n#include <string>\nint main() {\n    std::string s;\n    if (std::cin >> s) std::cout << (isValid(s) ? "true" : "false") << std::endl;\n    return 0;\n}`,
        java: `\nclass Driver {\n    public static void main(String[] args) {\n        java.util.Scanner sc = new java.util.Scanner(System.in);\n        if (sc.hasNext()) {\n            System.out.println(new Solution().isValid(sc.next()) ? "true" : "false");\n        }\n    }\n}`,
        go: `\nimport (\n\t"fmt"\n)\n\nfunc main() {\n\tvar s string\n\tif _, err := fmt.Scan(&s); err == nil {\n\t\tif isValid(s) {\n\t\t\tfmt.Println("true")\n\t\t} else {\n\t\t\tfmt.Println("false")\n\t\t}\n\t}\n}`,
        ts: `
import fs from "fs";
try {
  const s = fs.readFileSync(0, "utf-8").trim();
  console.log(isValid(s) ? "true" : "false");
} catch (e) { console.error(e.message); process.exit(1); }`
    },
    "binary-search": {
        js: `\nconst fs = require('fs');\ntry {\n  const lines = fs.readFileSync(0, 'utf-8').split(/\\r?\\n/).map(s=>s.trim()).filter(Boolean);\n  if (lines.length >= 2) {\n    const nums = lines[0].split(/\\s+/).map(Number);\n    const target = Number(lines[1]);\n    console.log(search(nums, target));\n  }\n} catch (e) { console.error(e.message); process.exit(1); }`,
        py: `\nimport sys\ntry:\n    lines = [l.strip() for l in sys.stdin.read().split('\\n') if l.strip()]\n    if len(lines) >= 2:\n        nums = list(map(int, lines[0].split()))\n        target = int(lines[1])\n        print(search(nums, target))\nexcept Exception as e:\n    sys.stderr.write(str(e)); sys.exit(1)`,
        cpp: `\n#include <iostream>\n#include <vector>\n#include <sstream>\nint main() {\n    std::string line; if (std::getline(std::cin, line)) {\n        std::vector<int> nums; std::stringstream ss(line); int val;\n        while (ss >> val) nums.push_back(val);\n        int target; if (std::cin >> target) std::cout << search(nums, target) << std::endl;\n    }\n    return 0;\n}`,
        java: `\nclass Driver {\n    public static void main(String[] args) {\n        java.util.Scanner sc = new java.util.Scanner(System.in);\n        if (sc.hasNextLine()) {\n            String[] parts = sc.nextLine().trim().split("\\\\s+");\n            if (parts.length == 1 && parts[0].isEmpty()) parts = new String[0];\n            int[] nums = new int[parts.length];\n            for(int i=0; i<parts.length; i++) nums[i] = Integer.parseInt(parts[i]);\n            if(sc.hasNextInt()) {\n                System.out.println(new Solution().search(nums, sc.nextInt()));\n            }\n        }\n    }\n}`,
        go: `\nimport (\n\t"bufio"\n\t"fmt"\n\t"os"\n\t"strconv"\n\t"strings"\n)\n\nfunc main() {\n\tscanner := bufio.NewScanner(os.Stdin)\n\tif scanner.Scan() {\n\t\tline := strings.TrimSpace(scanner.Text())\n\t\tvar nums []int\n\t\tif line != "" {\n\t\t\tparts := strings.Split(line, " ")\n\t\t\tfor _, p := range parts {\n\t\t\t\tval, _ := strconv.Atoi(p)\n\t\t\t\tnums = append(nums, val)\n\t\t\t}\n\t\t}\n\t\tif scanner.Scan() {\n\t\t\ttarget, _ := strconv.Atoi(strings.TrimSpace(scanner.Text()))\n\t\t\tfmt.Println(search(nums, target))\n\t\t}\n\t}\n}`,
        ts: `
import fs from "fs";
try {
  const lines = fs.readFileSync(0, "utf-8").split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  if (lines.length >= 2) {
    const nums = lines[0].split(/\s+/).map(Number);
    const target = Number(lines[1]);
    console.log(search(nums, target));
  }
} catch (e) { console.error(e.message); process.exit(1); }`
    },
    "best-time-to-buy-stock": {
        js: `\nconst fs = require('fs');\ntry {\n  const raw = fs.readFileSync(0, 'utf-8').trim();\n  const prices = raw ? raw.split(/\\s+/).map(Number) : [];\n  console.log(maxProfit(prices));\n} catch (e) { console.error(e.message); process.exit(1); }`,
        py: `\nimport sys\ntry:\n    raw = sys.stdin.read().strip()\n    prices = list(map(int, raw.split())) if raw else []\n    print(max_profit(prices))\nexcept Exception as e:\n    sys.stderr.write(str(e)); sys.exit(1)`,
        cpp: `\n#include <iostream>\n#include <vector>\nint main() {\n    std::vector<int> prices; int p;\n    while (std::cin >> p) prices.push_back(p);\n    std::cout << maxProfit(prices) << std::endl;\n    return 0;\n}`,
        java: `\nclass Driver {\n    public static void main(String[] args) {\n        java.util.Scanner sc = new java.util.Scanner(System.in);\n        java.util.List<Integer> list = new java.util.ArrayList<>();\n        while(sc.hasNextInt()) list.add(sc.nextInt());\n        int[] prices = new int[list.size()];\n        for(int i=0; i<list.size(); i++) prices[i] = list.get(i);\n        System.out.println(new Solution().maxProfit(prices));\n    }\n}`,
        go: `\nimport (\n\t"fmt"\n)\n\nfunc main() {\n\tvar prices []int\n\tvar p int\n\tfor {\n\t\t_, err := fmt.Scan(&p)\n\t\tif err != nil {\n\t\t\tbreak\n\t\t}\n\t\tprices = append(prices, p)\n\t}\n\tfmt.Println(maxProfit(prices))\n}`,
        ts: `
import fs from "fs";
try {
  const raw = fs.readFileSync(0, "utf-8").trim();
  const prices = raw ? raw.split(/\s+/).map(Number) : [];
  console.log(maxProfit(prices));
} catch (e) { console.error(e.message); process.exit(1); }`
    },
    "climbing-stairs": {
        js: `\nconst fs = require('fs');\ntry {\n  const input = fs.readFileSync(0, 'utf-8').trim();\n  console.log(climbStairs(Number(input)));\n} catch (e) { console.error(e.message); process.exit(1); }`,
        py: `\nimport sys\ntry:\n    raw = sys.stdin.read().strip()\n    if raw: print(climb_stairs(int(raw)))\nexcept Exception as e:\n    sys.stderr.write(str(e)); sys.exit(1)`,
        cpp: `\n#include <iostream>\nint main() {\n    int n; if (std::cin >> n) std::cout << climbStairs(n) << std::endl;\n    return 0;\n}`,
        java: `\nclass Driver {\n    public static void main(String[] args) {\n        java.util.Scanner sc = new java.util.Scanner(System.in);\n        if(sc.hasNextInt()) System.out.println(new Solution().climbStairs(sc.nextInt()));\n    }\n}`,
        go: `\nimport (\n\t"fmt"\n)\n\nfunc main() {\n\tvar n int\n\tif _, err := fmt.Scan(&n); err == nil {\n\t\tfmt.Println(climbStairs(n))\n\t}\n}`,
        ts: `
import fs from "fs";
try {
  const input = fs.readFileSync(0, "utf-8").trim();
  console.log(climbStairs(Number(input)));
} catch (e) { console.error(e.message); process.exit(1); }`
    },
    "longest-substring": {
        js: `\nconst fs = require('fs');\ntry {\n  const input = fs.readFileSync(0, 'utf-8').replace(/\\r?\\n$/, '');\n  console.log(lengthOfLongestSubstring(input));\n} catch (e) { console.error(e.message); process.exit(1); }`,
        py: `\nimport sys\ntry:\n    s = sys.stdin.read().rstrip('\\r\\n')\n    print(length_of_longest_substring(s))\nexcept Exception as e:\n    sys.stderr.write(str(e)); sys.exit(1)`,
        cpp: `\n#include <iostream>\n#include <string>\nint main() {\n    std::string s; std::getline(std::cin, s);\n    std::cout << lengthOfLongestSubstring(s) << std::endl;\n    return 0;\n}`,
        java: `\nclass Driver {\n    public static void main(String[] args) {\n        java.util.Scanner sc = new java.util.Scanner(System.in);\n        if(sc.hasNextLine()) System.out.println(new Solution().lengthOfLongestSubstring(sc.nextLine()));\n    }\n}`,
        go: `\nimport (\n\t"bufio"\n\t"fmt"\n\t"os"\n)\n\nfunc main() {\n\tscanner := bufio.NewScanner(os.Stdin)\n\tif scanner.Scan() {\n\t\tfmt.Println(lengthOfLongestSubstring(scanner.Text()))\n\t}\n}`,
        ts: `
import fs from "fs";
try {
  const input = fs.readFileSync(0, "utf-8").replace(/\r?\n$/, "");
  console.log(lengthOfLongestSubstring(input));
} catch (e) { console.error(e.message); process.exit(1); }`
    },
    "three-sum": {
        js: `\nconst fs = require('fs');\ntry {\n  const raw = fs.readFileSync(0, 'utf-8').trim();\n  const nums = raw ? raw.split(/\\s+/).map(Number) : [];\n  const res = threeSum(nums) || [];\n  const sorted = res.map(triplet => triplet.slice().sort((a,b)=>a-b)).sort((a,b)=> (a[0]-b[0]) || (a[1]-b[1]) || (a[2]-b[2]));\n  sorted.forEach(t => console.log(t.join(' ')));\n} catch (e) { console.error(e.message); process.exit(1); }`,
        py: `\nimport sys\ntry:\n    raw = sys.stdin.read().strip()\n    nums = list(map(int, raw.split())) if raw else []\n    res = three_sum(nums) or []\n    sorted_res = sorted([sorted(t) for t in res])\n    for t in sorted_res:\n        print(" ".join(map(str, t)))\nexcept Exception as e:\n    sys.stderr.write(str(e)); sys.exit(1)`,
        cpp: `\n#include <iostream>\n#include <vector>\n#include <algorithm>\nint main() {\n    std::vector<int> nums; int val;\n    while (std::cin >> val) nums.push_back(val);\n    auto res = threeSum(nums);\n    for (auto& t : res) std::sort(t.begin(), t.end());\n    std::sort(res.begin(), res.end());\n    for (const auto& t : res) {\n        if (t.size() == 3) std::cout << t[0] << " " << t[1] << " " << t[2] << std::endl;\n    }\n    return 0;\n}`,
        java: `\nclass Driver {\n    public static void main(String[] args) {\n        java.util.Scanner sc = new java.util.Scanner(System.in);\n        java.util.List<Integer> list = new java.util.ArrayList<>();\n        while(sc.hasNextInt()) list.add(sc.nextInt());\n        int[] nums = new int[list.size()];\n        for(int i=0; i<list.size(); i++) nums[i] = list.get(i);\n        java.util.List<java.util.List<Integer>> res = new Solution().threeSum(nums);\n        if(res != null) {\n            for(java.util.List<Integer> t : res) java.util.Collections.sort(t);\n            res.sort((a,b) -> {\n                for(int i=0; i<3; i++) {\n                    int c = Integer.compare(a.get(i), b.get(i));\n                    if(c != 0) return c;\n                }\n                return 0;\n            });\n            for(java.util.List<Integer> t : res) System.out.println(t.get(0) + " " + t.get(1) + " " + t.get(2));\n        }\n    }\n}`,
        go: `\nimport (\n\t"fmt"\n\t"sort"\n)\n\nfunc main() {\n\tvar nums []int\n\tvar p int\n\tfor {\n\t\t_, err := fmt.Scan(&p)\n\t\tif err != nil {\n\t\t\tbreak\n\t\t}\n\t\tnums = append(nums, p)\n\t}\n\tres := threeSum(nums)\n\tfor _, t := range res {\n\t\tsort.Ints(t)\n\t}\n\tsort.Slice(res, func(i, j int) bool {\n\t\tfor k := 0; k < 3; k++ {\n\t\t\tif res[i][k] != res[j][k] {\n\t\t\t\treturn res[i][k] < res[j][k]\n\t\t\t}\n\t\t}\n\t\treturn false\n\t})\n\tfor _, t := range res {\n\t\tfmt.Printf("%d %d %d\\n", t[0], t[1], t[2])\n\t}\n}`,
        ts: `
import fs from "fs";
try {
  const raw = fs.readFileSync(0, "utf-8").trim();
  const nums = raw ? raw.split(/\s+/).map(Number) : [];
  const res = threeSum(nums) || [];
  const sorted = res.map(triplet => triplet.slice().sort((a,b)=>a-b)).sort((a,b)=> (a[0]-b[0]) || (a[1]-b[1]) || (a[2]-b[2]));
  sorted.forEach(t => console.log(t.join(" ")));
} catch (e) { console.error(e.message); process.exit(1); }`
    },
    "merge-intervals": {
        js: `\nconst fs = require('fs');\ntry {\n  const lines = fs.readFileSync(0, 'utf-8').split(/\\r?\\n/).map(s=>s.trim()).filter(Boolean);\n  const intervals = lines.map(l => l.split(/\\s+/).map(Number));\n  const res = merge(intervals) || [];\n  res.forEach(iv => console.log(iv.join(' ')));\n} catch (e) { console.error(e.message); process.exit(1); }`,
        py: `\nimport sys\ntry:\n    lines = [l.strip() for l in sys.stdin.read().split('\\n') if l.strip()]\n    intervals = [list(map(int, l.split())) for l in lines]\n    res = merge(intervals) or []\n    for iv in res:\n        print(" ".join(map(str, iv)))\nexcept Exception as e:\n    sys.stderr.write(str(e)); sys.exit(1)`,
        cpp: `\n#include <iostream>\n#include <vector>\n#include <sstream>\nint main() {\n    std::vector<std::vector<int>> intervals; std::string line;\n    while (std::getline(std::cin, line)) {\n        if (line.empty()) continue;\n        std::stringstream ss(line); int s, e; if (ss >> s >> e) intervals.push_back({s, e});\n    }\n    auto res = merge(intervals);\n    for (const auto& iv : res) std::cout << iv[0] << " " << iv[1] << std::endl;\n    return 0;\n}`,
        java: `\nclass Driver {\n    public static void main(String[] args) {\n        java.util.Scanner sc = new java.util.Scanner(System.in);\n        java.util.List<int[]> list = new java.util.ArrayList<>();\n        while(sc.hasNextLine()) {\n            String line = sc.nextLine().trim();\n            if(line.isEmpty()) continue;\n            String[] parts = line.split("\\\\s+");\n            if(parts.length >= 2) list.add(new int[]{Integer.parseInt(parts[0]), Integer.parseInt(parts[1])});\n        }\n        int[][] intervals = list.toArray(new int[0][]);\n        int[][] res = new Solution().merge(intervals);\n        if(res != null) {\n            for(int[] iv : res) System.out.println(iv[0] + " " + iv[1]);\n        }\n    }\n}`,
        go: `\nimport (\n\t"bufio"\n\t"fmt"\n\t"os"\n\t"strconv"\n\t"strings"\n)\n\nfunc main() {\n\tvar intervals [][]int\n\tscanner := bufio.NewScanner(os.Stdin)\n\tfor scanner.Scan() {\n\t\tline := strings.TrimSpace(scanner.Text())\n\t\tif line == "" {\n\t\t\tcontinue\n\t\t}\n\t\tparts := strings.Split(line, " ")\n\t\tif len(parts) >= 2 {\n\t\t\ts, _ := strconv.Atoi(parts[0])\n\t\t\te, _ := strconv.Atoi(parts[1])\n\t\t\tintervals = append(intervals, []int{s, e})\n\t\t}\n\t}\n\tres := merge(intervals)\n\tfor _, iv := range res {\n\t\tfmt.Printf("%d %d\\n", iv[0], iv[1])\n\t}\n}`,
        ts: `
import fs from "fs";
try {
  const lines = fs.readFileSync(0, "utf-8").split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  const intervals = lines.map(l => l.split(/\s+/).map(Number));
  const res = merge(intervals) || [];
  res.forEach(iv => console.log(iv.join(" ")));
} catch (e) { console.error(e.message); process.exit(1); }`
    },
    "coin-change": {
        js: `\nconst fs = require('fs');\ntry {\n  const lines = fs.readFileSync(0, 'utf-8').split(/\\r?\\n/).map(s=>s.trim()).filter(Boolean);\n  if (lines.length >= 2) {\n    const coins = lines[0].split(/\\s+/).map(Number);\n    const amount = Number(lines[1]);\n    console.log(coinChange(coins, amount));\n  }\n} catch (e) { console.error(e.message); process.exit(1); }`,
        py: `\nimport sys\ntry:\n    lines = [l.strip() for l in sys.stdin.read().split('\\n') if l.strip()]\n    if len(lines) >= 2:\n        coins = list(map(int, lines[0].split()))\n        amount = int(lines[1])\n        print(coin_change(coins, amount))\nexcept Exception as e:\n    sys.stderr.write(str(e)); sys.exit(1)`,
        cpp: `\n#include <iostream>\n#include <vector>\n#include <sstream>\nint main() {\n    std::string line; if (std::getline(std::cin, line)) {\n        std::vector<int> coins; std::stringstream ss(line); int val;\n        while (ss >> val) coins.push_back(val);\n        int amount; if (std::cin >> amount) std::cout << coinChange(coins, amount) << std::endl;\n    }\n    return 0;\n}`,
        java: `\nclass Driver {\n    public static void main(String[] args) {\n        java.util.Scanner sc = new java.util.Scanner(System.in);\n        if(sc.hasNextLine()) {\n            String[] parts = sc.nextLine().trim().split("\\\\s+");\n            if (parts.length == 1 && parts[0].isEmpty()) parts = new String[0];\n            int[] coins = new int[parts.length];\n            for(int i=0; i<parts.length; i++) coins[i] = Integer.parseInt(parts[i]);\n            if(sc.hasNextInt()) System.out.println(new Solution().coinChange(coins, sc.nextInt()));\n        }\n    }\n}`,
        go: `\nimport (\n\t"bufio"\n\t"fmt"\n\t"os"\n\t"strconv"\n\t"strings"\n)\n\nfunc main() {\n\tscanner := bufio.NewScanner(os.Stdin)\n\tif scanner.Scan() {\n\t\tline := strings.TrimSpace(scanner.Text())\n\t\tvar coins []int\n\t\tif line != "" {\n\t\t\tparts := strings.Split(line, " ")\n\t\t\tfor _, p := range parts {\n\t\t\t\tval, _ := strconv.Atoi(p)\n\t\t\t\tcoins = append(coins, val)\n\t\t\t}\n\t\t}\n\t\tif scanner.Scan() {\n\t\t\tamount, _ := strconv.Atoi(strings.TrimSpace(scanner.Text()))\n\t\t\tfmt.Println(coinChange(coins, amount))\n\t\t}\n\t}\n}`,
        ts: `
import fs from "fs";
try {
  const lines = fs.readFileSync(0, "utf-8").split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  if (lines.length >= 2) {
    const coins = lines[0].split(/\s+/).map(Number);
    const amount = Number(lines[1]);
    console.log(coinChange(coins, amount));
  }
} catch (e) { console.error(e.message); process.exit(1); }`
    },
    "lru-cache": {
        js: `\nconst fs = require('fs');\ntry {\n  const lines = fs.readFileSync(0, 'utf-8').split(/\\r?\\n/).map(s=>s.trim()).filter(Boolean);\n  if (lines.length > 0) {\n    const cap = Number(lines[0]);\n    const cache = new LRUCache(cap);\n    for (let i = 1; i < lines.length; i++) {\n      const parts = lines[i].split(/\\s+/);\n      if (parts[0] === 'put') cache.put(Number(parts[1]), Number(parts[2]));\n      else if (parts[0] === 'get') console.log(cache.get(Number(parts[1])));\n    }\n  }\n} catch (e) { console.error(e.message); process.exit(1); }`,
        py: `\nimport sys\ntry:\n    lines = [l.strip() for l in sys.stdin.read().split('\\n') if l.strip()]\n    if lines:\n        cap = int(lines[0])\n        cache = LRUCache(cap)\n        for l in lines[1:]:\n            parts = l.split()\n            if parts[0] == 'put': cache.put(int(parts[1]), int(parts[2]))\n            elif parts[0] == 'get': print(cache.get(int(parts[1])))\nexcept Exception as e:\n    sys.stderr.write(str(e)); sys.exit(1)`,
        cpp: `\n#include <iostream>\n#include <string>\nint main() {\n    int cap; if (std::cin >> cap) {\n        LRUCache cache(cap); std::string cmd;\n        while (std::cin >> cmd) {\n            if (cmd == "put") { int k, v; std::cin >> k >> v; cache.put(k, v); }\n            else if (cmd == "get") { int k; std::cin >> k; std::cout << cache.get(k) << std::endl; }\n        }\n    }\n    return 0;\n}`,
        java: `\nclass Driver {\n    public static void main(String[] args) {\n        java.util.Scanner sc = new java.util.Scanner(System.in);\n        LRUCache cache = null;\n        while(sc.hasNextLine()) {\n            String line = sc.nextLine().trim();\n            if(line.isEmpty()) continue;\n            String[] parts = line.split("\\\\s+");\n            if(parts[0].equals("LRUCache")) {\n                cache = new LRUCache(Integer.parseInt(parts[1]));\n                System.out.println("null");\n            } else if(parts[0].equals("put")) {\n                cache.put(Integer.parseInt(parts[1]), Integer.parseInt(parts[2]));\n                System.out.println("null");\n            } else if(parts[0].equals("get")) {\n                System.out.println(cache.get(Integer.parseInt(parts[1])));\n            }\n        }\n    }\n}`,
        go: `\nimport (\n\t"bufio"\n\t"fmt"\n\t"os"\n\t"strconv"\n\t"strings"\n)\n\nfunc main() {\n\tscanner := bufio.NewScanner(os.Stdin)\n\tvar cache LRUCache\n\tfor scanner.Scan() {\n\t\tline := strings.TrimSpace(scanner.Text())\n\t\tif line == "" {\n\t\t\tcontinue\n\t\t}\n\t\tparts := strings.Split(line, " ")\n\t\tif parts[0] == "LRUCache" {\n\t\t\tcap, _ := strconv.Atoi(parts[1])\n\t\t\tcache = Constructor(cap)\n\t\t\tfmt.Println("null")\n\t\t} else if parts[0] == "put" {\n\t\t\tk, _ := strconv.Atoi(parts[1])\n\t\t\tv, _ := strconv.Atoi(parts[2])\n\t\t\tcache.Put(k, v)\n\t\t\tfmt.Println("null")\n\t\t} else if parts[0] == "get" {\n\t\t\tk, _ := strconv.Atoi(parts[1])\n\t\t\tfmt.Println(cache.Get(k))\n\t\t}\n\t}\n}`,
        ts: `
import fs from "fs";
try {
  const lines = fs.readFileSync(0, "utf-8").split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  if (lines.length > 0) {
    const cap = Number(lines[0]);
    const cache = new LRUCache(cap);
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(/\s+/);
      if (parts[0] === "put") cache.put(Number(parts[1]), Number(parts[2]));
      else if (parts[0] === "get") console.log(cache.get(Number(parts[1])));
    }
  }
} catch (e) { console.error(e.message); process.exit(1); }`
    },
    "word-search": {
        js: `\nconst fs = require('fs');\ntry {\n  const lines = fs.readFileSync(0, 'utf-8').split(/\\r?\\n/).map(s=>s.trim()).filter(Boolean);\n  if (lines.length >= 2) {\n    const word = lines[lines.length - 1];\n    const board = lines.slice(0, lines.length - 1).map(l => l.split(/\\s+/));\n    console.log(exist(board, word) ? 'true' : 'false');\n  }\n} catch (e) { console.error(e.message); process.exit(1); }`,
        py: `\nimport sys\ntry:\n    lines = [l.strip() for l in sys.stdin.read().split('\\n') if l.strip()]\n    if len(lines) >= 2:\n        word = lines[-1]\n        board = [l.split() for l in lines[:-1]]\n        print('true' if exist(board, word) else 'false')\nexcept Exception as e:\n    sys.stderr.write(str(e)); sys.exit(1)`,
        cpp: `\n#include <iostream>\n#include <vector>\n#include <string>\n#include <sstream>\nint main() {\n    std::vector<std::string> lines; std::string line;\n    while (std::getline(std::cin, line)) if (!line.empty()) lines.push_back(line);\n    if (lines.size() >= 2) {\n        std::string word = lines.back();\n        std::vector<std::vector<char>> board;\n        for (size_t i = 0; i + 1 < lines.size(); ++i) {\n            std::vector<char> row; std::stringstream ss(lines[i]); char c;\n            while (ss >> c) row.push_back(c);\n            board.push_back(row);\n        }\n        std::cout << (exist(board, word) ? "true" : "false") << std::endl;\n    }\n    return 0;\n}`
    },
    "number-of-islands": {
        js: `\nconst fs = require('fs');\ntry {\n  const lines = fs.readFileSync(0, 'utf-8').split(/\\r?\\n/).map(s=>s.trim()).filter(Boolean);\n  const grid = lines.map(l => l.split(/\\s+/));\n  console.log(numIslands(grid));\n} catch (e) { console.error(e.message); process.exit(1); }`,
        py: `\nimport sys\ntry:\n    lines = [l.strip() for l in sys.stdin.read().split('\\n') if l.strip()]\n    grid = [l.split() for l in lines]\n    print(num_islands(grid))\nexcept Exception as e:\n    sys.stderr.write(str(e)); sys.exit(1)`,
        cpp: `\n#include <iostream>\n#include <vector>\n#include <sstream>\nint main() {\n    std::vector<std::vector<char>> grid; std::string line;\n    while (std::getline(std::cin, line)) {\n        if (line.empty()) continue;\n        std::vector<char> row; std::stringstream ss(line); char c;\n        while (ss >> c) row.push_back(c);\n        grid.push_back(row);\n    }\n    std::cout << numIslands(grid) << std::endl;\n    return 0;\n}`
    },
    "longest-common-subsequence": {
        js: `\nconst fs = require('fs');\ntry {\n  const lines = fs.readFileSync(0, 'utf-8').split(/\\r?\\n/).map(s=>s.trim()).filter(Boolean);\n  if (lines.length >= 2) console.log(longestCommonSubsequence(lines[0], lines[1]));\n} catch (e) { console.error(e.message); process.exit(1); }`,
        py: `\nimport sys\ntry:\n    lines = [l.strip() for l in sys.stdin.read().split('\\n') if l.strip()]\n    if len(lines) >= 2: print(longest_common_subsequence(lines[0], lines[1]))\nexcept Exception as e:\n    sys.stderr.write(str(e)); sys.exit(1)`,
        cpp: `\n#include <iostream>\n#include <string>\nint main() {\n    std::string s1, s2; if (std::cin >> s1 >> s2) std::cout << longestCommonSubsequence(s1, s2) << std::endl;\n    return 0;\n}`
    },
    "trapping-rain-water": {
        js: `\nconst fs = require('fs');\ntry {\n  const raw = fs.readFileSync(0, 'utf-8').trim();\n  const heights = raw ? raw.split(/\\s+/).map(Number) : [];\n  console.log(trap(heights));\n} catch (e) { console.error(e.message); process.exit(1); }`,
        py: `\nimport sys\ntry:\n    raw = sys.stdin.read().strip()\n    heights = list(map(int, raw.split())) if raw else []\n    print(trap(heights))\nexcept Exception as e:\n    sys.stderr.write(str(e)); sys.exit(1)`,
        cpp: `\n#include <iostream>\n#include <vector>\nint main() {\n    std::vector<int> h; int val;\n    while (std::cin >> val) h.push_back(val);\n    std::cout << trap(h) << std::endl;\n    return 0;\n}`
    },
    "median-sorted-arrays": {
        js: `\nconst fs = require('fs');\ntry {\n  const lines = fs.readFileSync(0, 'utf-8').split(/\\r?\\n/).map(s=>s.trim()).filter(Boolean);\n  const n1 = lines[0] ? lines[0].split(/\\s+/).map(Number) : [];\n  const n2 = lines[1] ? lines[1].split(/\\s+/).map(Number) : [];\n  const res = findMedianSortedArrays(n1, n2);\n  console.log(Number(res).toFixed(5));\n} catch (e) { console.error(e.message); process.exit(1); }`,
        py: `\nimport sys\ntry:\n    lines = [l.strip() for l in sys.stdin.read().split('\\n') if l.strip()]\n    n1 = list(map(int, lines[0].split())) if len(lines) > 0 and lines[0] else []\n    n2 = list(map(int, lines[1].split())) if len(lines) > 1 and lines[1] else []\n    res = find_median_sorted_arrays(n1, n2)\n    print(f"{float(res):.5f}")\nexcept Exception as e:\n    sys.stderr.write(str(e)); sys.exit(1)`,
        cpp: `\n#include <iostream>\n#include <vector>\n#include <sstream>\n#include <iomanip>\nint main() {\n    std::string l1, l2; std::vector<int> n1, n2;\n    if (std::getline(std::cin, l1)) { std::stringstream ss(l1); int v; while (ss >> v) n1.push_back(v); }\n    if (std::getline(std::cin, l2)) { std::stringstream ss(l2); int v; while (ss >> v) n2.push_back(v); }\n    std::cout << std::fixed << std::setprecision(5) << findMedianSortedArrays(n1, n2) << std::endl;\n    return 0;\n}`
    },
    "word-ladder": {
        js: `\nconst fs = require('fs');\ntry {\n  const lines = fs.readFileSync(0, 'utf-8').split(/\\r?\\n/).map(s=>s.trim()).filter(Boolean);\n  if (lines.length >= 3) {\n    const begin = lines[0]; const end = lines[1];\n    const words = lines[2].split(/\\s+/);\n    console.log(ladderLength(begin, end, words));\n  }\n} catch (e) { console.error(e.message); process.exit(1); }`,
        py: `\nimport sys\ntry:\n    lines = [l.strip() for l in sys.stdin.read().split('\\n') if l.strip()]\n    if len(lines) >= 3:\n        print(ladder_length(lines[0], lines[1], lines[2].split()))\nexcept Exception as e:\n    sys.stderr.write(str(e)); sys.exit(1)`,
        cpp: `\n#include <iostream>\n#include <vector>\n#include <string>\n#include <sstream>\nint main() {\n    std::string b, e, wlLine;\n    if (std::cin >> b >> e) {\n        std::vector<std::string> wl; std::string w;\n        while (std::cin >> w) wl.push_back(w);\n        std::cout << ladderLength(b, e, wl) << std::endl;\n    }\n    return 0;\n}`
    },
    "container-with-most-water": {
        js: `\nconst fs = require('fs');\ntry {\n  const raw = fs.readFileSync(0, 'utf-8').trim();\n  const h = raw ? raw.split(/\\s+/).map(Number) : [];\n  console.log(maxArea(h));\n} catch (e) { console.error(e.message); process.exit(1); }`,
        py: `\nimport sys\ntry:\n    raw = sys.stdin.read().strip()\n    h = list(map(int, raw.split())) if raw else []\n    print(max_area(h))\nexcept Exception as e:\n    sys.stderr.write(str(e)); sys.exit(1)`,
        cpp: `\n#include <iostream>\n#include <vector>\nint main() {\n    std::vector<int> h; int v;\n    while (std::cin >> v) h.push_back(v);\n    std::cout << maxArea(h) << std::endl;\n    return 0;\n}`
    },
    "maximum-subarray": {
        js: `\nconst fs = require('fs');\ntry {\n  const raw = fs.readFileSync(0, 'utf-8').trim();\n  const nums = raw ? raw.split(/\\s+/).map(Number) : [];\n  console.log(maxSubArray(nums));\n} catch (e) { console.error(e.message); process.exit(1); }`,
        py: `\nimport sys\ntry:\n    raw = sys.stdin.read().strip()\n    nums = list(map(int, raw.split())) if raw else []\n    print(max_sub_array(nums))\nexcept Exception as e:\n    sys.stderr.write(str(e)); sys.exit(1)`,
        cpp: `\n#include <iostream>\n#include <vector>\nint main() {\n    std::vector<int> nums; int v;\n    while (std::cin >> v) nums.push_back(v);\n    std::cout << maxSubArray(nums) << std::endl;\n    return 0;\n}`
    },
    "reverse-linked-list": {
        js: `\nclass ListNode { constructor(val=0, next=null) { this.val = val; this.next = next; } }\nconst fs = require('fs');\ntry {\n  const raw = fs.readFileSync(0, 'utf-8').trim();\n  const arr = raw ? raw.split(/\\s+/).map(Number) : [];\n  let head = null; let tail = null;\n  for (const v of arr) {\n    const node = new ListNode(v);\n    if (!head) { head = node; tail = node; } else { tail.next = node; tail = node; }\n  }\n  let curr = reverseList(head);\n  const out = []; while (curr) { out.push(curr.val); curr = curr.next; }\n  console.log(out.join(' '));\n} catch (e) { console.error(e.message); process.exit(1); }`,
        py: `\nclass ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\nimport sys\ntry:\n    raw = sys.stdin.read().strip()\n    arr = list(map(int, raw.split())) if raw else []\n    head = None; tail = None\n    for v in arr:\n        node = ListNode(v)\n        if not head: head = node; tail = node\n        else: tail.next = node; tail = node\n    curr = reverse_list(head)\n    out = []\n    while curr: out.append(str(curr.val)); curr = curr.next\n    print(" ".join(out))\nexcept Exception as e:\n    sys.stderr.write(str(e)); sys.exit(1)`,
        cpp: `\nstruct ListNode { int val; ListNode *next; ListNode(int x) : val(x), next(nullptr) {} };\n#include <iostream>\n#include <vector>\nint main() {\n    std::vector<int> vals; int v; while (std::cin >> v) vals.push_back(v);\n    ListNode* head = nullptr; ListNode* tail = nullptr;\n    for (int x : vals) { ListNode* n = new ListNode(x); if (!head) { head = n; tail = n; } else { tail->next = n; tail = n; } }\n    ListNode* curr = reverseList(head);\n    while (curr) { std::cout << curr->val << (curr->next ? " " : ""); curr = curr->next; }\n    std::cout << std::endl;\n    return 0;\n}`
    },
    "invert-binary-tree": {
        js: `\nclass TreeNode { constructor(val=0, left=null, right=null) { this.val = val; this.left = left; this.right = right; } }\nconst fs = require('fs');\ntry {\n  const raw = fs.readFileSync(0, 'utf-8').trim();\n  const vals = raw ? raw.split(/\\s+/) : [];\n  if (vals.length === 0 || vals[0] === 'null') { console.log(""); process.exit(0); }\n  const root = new TreeNode(Number(vals[0]));\n  const q = [root]; let i = 1;\n  while (q.length > 0 && i < vals.length) {\n    const node = q.shift();\n    if (i < vals.length && vals[i] !== 'null') { node.left = new TreeNode(Number(vals[i])); q.push(node.left); } i++;\n    if (i < vals.length && vals[i] !== 'null') { node.right = new TreeNode(Number(vals[i])); q.push(node.right); } i++;\n  }\n  const inv = invertTree(root);\n  const out = []; const q2 = inv ? [inv] : [];\n  while (q2.length > 0) {\n    const node = q2.shift();\n    if (node) { out.push(node.val); q2.push(node.left); q2.push(node.right); }\n  }\n  while (out.length > 0 && out[out.length-1] === null) out.pop();\n  console.log(out.join(' '));\n} catch (e) { console.error(e.message); process.exit(1); }`,
        py: `\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val; self.left = left; self.right = right\nimport sys\ntry:\n    raw = sys.stdin.read().strip()\n    vals = raw.split() if raw else []\n    if not vals or vals[0] == 'null': print(""); sys.exit(0)\n    root = TreeNode(int(vals[0]))\n    q = [root]; i = 1\n    while q and i < len(vals):\n        node = q.pop(0)\n        if i < len(vals) and vals[i] != 'null': node.left = TreeNode(int(vals[i])); q.append(node.left)\n        i += 1\n        if i < len(vals) and vals[i] != 'null': node.right = TreeNode(int(vals[i])); q.append(node.right)\n        i += 1\n    inv = invert_tree(root)\n    out = []; q2 = [inv] if inv else []\n    while q2:\n        node = q2.pop(0)\n        if node: out.append(str(node.val)); q2.append(node.left); q2.append(node.right)\n    print(" ".join(out))\nexcept Exception as e:\n    sys.stderr.write(str(e)); sys.exit(1)`,
        cpp: `\nstruct TreeNode { int val; TreeNode *left; TreeNode *right; TreeNode(int x) : val(x), left(nullptr), right(nullptr) {} };\n#include <iostream>\n#include <vector>\n#include <string>\n#include <queue>\nint main() {\n    std::vector<std::string> vals; std::string s; while (std::cin >> s) vals.push_back(s);\n    if (vals.empty() || vals[0] == "null") return 0;\n    TreeNode* root = new TreeNode(std::stoi(vals[0]));\n    std::queue<TreeNode*> q; q.push(root); size_t i = 1;\n    while (!q.empty() && i < vals.size()) {\n        TreeNode* n = q.front(); q.pop();\n        if (i < vals.size() && vals[i] != "null") { n->left = new TreeNode(std::stoi(vals[i])); q.push(n->left); } i++;\n        if (i < vals.size() && vals[i] != "null") { n->right = new TreeNode(std::stoi(vals[i])); q.push(n->right); } i++;\n    }\n    TreeNode* inv = invertTree(root);\n    std::queue<TreeNode*> q2; if (inv) q2.push(inv);\n    bool first = true;\n    while (!q2.empty()) {\n        TreeNode* n = q2.front(); q2.pop();\n        if (n) {\n            if (!first) std::cout << " "; first = false;\n            std::cout << n->val;\n            q2.push(n->left); q2.push(n->right);\n        }\n    }\n    std::cout << std::endl;\n    return 0;\n}`
    },
    "serialize-deserialize-tree": {
        js: `\nclass TreeNode { constructor(val=0, left=null, right=null) { this.val = val; this.left = left; this.right = right; } }\nconst fs = require('fs');\ntry {\n  const input = fs.readFileSync(0, 'utf-8').trim();\n  const root = deserialize(input);\n  const res = serialize(root);\n  console.log(res);\n} catch (e) { console.error(e.message); process.exit(1); }`,
        py: `\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val; self.left = left; self.right = right\nimport sys\ntry:\n    input_data = sys.stdin.read().strip()\n    root = deserialize(input_data)\n    print(serialize(root))\nexcept Exception as e:\n    sys.stderr.write(str(e)); sys.exit(1)`,
        cpp: `\nstruct TreeNode { int val; TreeNode *left; TreeNode *right; TreeNode(int x) : val(x), left(nullptr), right(nullptr) {} };\n#include <iostream>\n#include <string>\nint main() {\n    std::string data; std::getline(std::cin, data);\n    TreeNode* root = deserialize(data);\n    std::cout << serialize(root) << std::endl;\n    return 0;\n}`
    },
    "tle-demo": {
        js: "",
        py: "",
        cpp: ""
    }
};
