"use client";
// Migbits preview composed with shadcn/ui (MIT); see ../ui/LICENSE.
import { FileText, Download } from "lucide-react";
import {
  Attachment,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
} from "../ui/attachment";
export default function Example() {
  return (
    <AttachmentGroup>
      <Attachment>
        <AttachmentMedia>
          <FileText />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>Brand guidelines.pdf</AttachmentTitle>
          <AttachmentDescription>2.4 MB · Reference file</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction aria-label="Download component source" asChild>
            <a href="/api/open-source/components">
              <Download />
            </a>
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>
    </AttachmentGroup>
  );
}
