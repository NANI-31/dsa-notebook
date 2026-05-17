/**
 * Regex Test SandBox for Custom Monaco Syntax Highlighting.
 * 
 * This file serves as an isolated test case with multiple edge cases
 * to verify that our custom semantic regex logic works perfectly:
 * - Coloring booleans, null, undefined ONLY outside of strings/comments.
 * - Coloring operators properly without matching within strings/comments.
 * - Coloring functions correctly (avoiding keywords like if/while/for).
 * - Coloring object properties (.length) that do not have parenthesis.
 */

// 1. Core Regex definition matching the implementation in regexEngine.ts
const highlightRegex =
  /(?:".*?"|'.*?'|`[^`]*`|\/\*[\s\S]*?\*\/|\/\/.*)|(\b(?:true|false|null|undefined)\b)|([+\-*/!%^&|=<>]+)|(\b(?!(?:if|while|for|switch|catch|function|return|new|super|typeof|instanceof|throw|yield|await)\b)[a-zA-Z_$][\w$]*\b)(?=\s*\()|(?<=\.)([a-zA-Z_$][\w$]*)\b(?!\s*\()/g;

// 2. Test Cases covering multiple syntax structures
const testCases = {
  commentsAndStrings: `
    // This is a comment with true, false, null, and undefined.
    /* Multiline comment
       containing operators: + - * / and functions: myTest()
    */
    const myString = "Avoid matching true or + inside double quotes";
    const mySingleQuote = 'Avoid matching false or - inside single quotes';
    const myTemplate = \`Avoid matching null or * inside templates \${true}\`;
  `,
  booleansAndNulls: `
    const isReady = true;
    const isFinished = false;
    let data = null;
    let index = undefined;
  `,
  operators: `
    let result = (a + b) * c - d / e;
    let isGreater = x > y && y <= z || !flag;
    let bitwise = a & b | c ^ d;
  `,
  functions: `
    function longestPalindrome(s) {
      if (s.length < 2) return s; // 'if' is a keyword, 'longestPalindrome' is a function.
      myCustomFunction();
      let x = isPalindrome(sub);
      console.log(x);
    }
  `,
  properties: `
    let size = arr.length; // 'length' is a property (red).
    let value = obj.someValue; // 'someValue' is a property (red).
    let run = obj.someFunc(); // 'someFunc' is a function (blue).
  `
};

// 3. Test Runner to simulate and print matching logs
export const runRegexSandboxTest = () => {
  console.log("=== RUNNING SEMANTIC REGEX HIGHLIGHTER TESTS ===");

  Object.entries(testCases).forEach(([section, code]) => {
    console.log(`\n--- Section: ${section} ---`);
    let match;
    const matches: any[] = [];
    
    // Reset index just in case
    highlightRegex.lastIndex = 0;

    while ((match = highlightRegex.exec(code)) !== null) {
      if (match[1]) {
        matches.push({ type: "BOOLEAN/NULL", text: match[1], index: match.index });
      } else if (match[2]) {
        matches.push({ type: "OPERATOR", text: match[2], index: match.index });
      } else if (match[3]) {
        matches.push({ type: "FUNCTION", text: match[3], index: match.index });
      } else if (match[4]) {
        matches.push({ type: "PROPERTY", text: match[4], index: match.index });
      }
    }

    if (matches.length === 0) {
      console.log("No semantic matches found (Perfect for strings/comments section!).");
    } else {
      console.table(matches);
    }
  });
};
