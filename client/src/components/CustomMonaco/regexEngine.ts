import type { editor, Range as MonacoRange } from "monaco-editor";

// Pre-compiled global regex pattern defined outside of execution loop to prevent re-compiling on every single keypress
const SEMANTIC_HIGHLIGHT_REGEX =
  /(?:".*?"|'.*?'|`[^`]*`|\/\*[\s\S]*?\*\/|\/\/.*)|(\b(?:true|false|null|undefined)\b)|([+\-*/!%^&|=<>]+)|(\b(?!(?:if|while|for|switch|catch|function|return|new|super|typeof|instanceof|throw|yield|await)\b)[a-zA-Z_$][\w$]*\b)(?=\s*\()|(?<=\.)([a-zA-Z_$][\w$]*)\b(?!\s*\()/g;

/**
 * Executes the regex engine against the provided model text and returns
 * the array of Monaco semantic decorations.
 */
export const getSemanticDecorations = (
  model: editor.ITextModel,
  RangeClass: typeof MonacoRange
): editor.IModelDeltaDecoration[] => {
  const text = model.getValue();
  const newDecorations: editor.IModelDeltaDecoration[] = [];

  // Reset lastIndex because the regex is global and stateful across executions
  SEMANTIC_HIGHLIGHT_REGEX.lastIndex = 0;

  let match;
  while ((match = SEMANTIC_HIGHLIGHT_REGEX.exec(text)) !== null) {
    if (!match[1] && !match[2] && !match[3] && !match[4]) {
      // It matched the non-capturing group (string or comment), skip it
      continue;
    }

    const startPos = model.getPositionAt(match.index);
    const endPos = model.getPositionAt(match.index + match[0].length);
    const range = new RangeClass(
      startPos.lineNumber,
      startPos.column,
      endPos.lineNumber,
      endPos.column
    );

    if (match[1]) {
      newDecorations.push({
        range,
        options: { inlineClassName: "custom-boolean-color" },
      });
    } else if (match[2]) {
      newDecorations.push({
        range,
        options: { inlineClassName: "custom-operator-color" },
      });
    } else if (match[3]) {
      newDecorations.push({
        range,
        options: { inlineClassName: "custom-function-color" },
      });
    } else if (match[4]) {
      newDecorations.push({
        range,
        options: { inlineClassName: "custom-property-color" },
      });
    }
  }

  return newDecorations;
};
