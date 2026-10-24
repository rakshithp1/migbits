"use client";
// Migbits preview composed with shadcn/ui (MIT); see ../ui/LICENSE.
import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockTitle,
  CodeBlockActions,
  CodeBlockCopyButton,
  CodeBlockContent,
  CodeBlockLine,
} from "../ui/code-block";
const source =
  'import { Button } from "./components/ui/button";\n\nexport default function App() {\n  return <Button>Make it yours</Button>;\n}';
export default function Example() {
  return (
    <CodeBlock className="w-full max-w-lg rounded-xl border bg-card">
      <CodeBlockHeader className="border-b p-3">
        <CodeBlockTitle>hello.tsx</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={source} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent className="p-4 text-xs leading-7" lineNumbers>
        {source.split("\n").map((line, i) => (
          <CodeBlockLine key={i}>{line}</CodeBlockLine>
        ))}
      </CodeBlockContent>
    </CodeBlock>
  );
}
