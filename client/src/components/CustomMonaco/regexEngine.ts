import type { editor, Range as MonacoRange } from "monaco-editor";

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

  // Match 0 (ignored): Strings or Comments
  // Match 1: Booleans/Nulls
  // Match 2: Operators
  // Match 3: Function Names
  // Match 4: Object Properties (preceded by a dot, NOT followed by parenthesis)
  const regex =
    /(?:".*?"|'.*?'|`[^`]*`|\/\*[\s\S]*?\*\/|\/\/.*)|(\b(?:true|false|null|undefined)\b)|([+\-*/!%^&|=<>]+)|(\b(?!(?:if|while|for|switch|catch|function|return|new|super|typeof|instanceof|throw|yield|await)\b)[a-zA-Z_$][\w$]*\b)(?=\s*\()|(?<=\.)([a-zA-Z_$][\w$]*)\b(?!\s*\()/g;

  let match;
  while ((match = regex.exec(text)) !== null) {
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
