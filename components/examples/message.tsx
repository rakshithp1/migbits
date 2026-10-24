"use client";
// Migbits preview composed with shadcn/ui (MIT); see ../ui/LICENSE.
import {
  Message,
  MessageGroup,
  MessageContent,
  MessageHeader,
  MessageFooter,
} from "../ui/message";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Bubble, BubbleContent } from "../ui/bubble";
export default function Example() {
  return (
    <MessageGroup className="w-full max-w-sm gap-6">
      <Message>
        <Avatar>
          <AvatarFallback>MK</AvatarFallback>
        </Avatar>
        <MessageContent>
          <MessageHeader>
            Mika <span className="text-muted-foreground">10:42</span>
          </MessageHeader>
          <Bubble>
            <BubbleContent>The new library is looking good.</BubbleContent>
          </Bubble>
          <MessageFooter>Delivered</MessageFooter>
        </MessageContent>
      </Message>
      <Message align="end">
        <Avatar>
          <AvatarFallback>YO</AvatarFallback>
        </Avatar>
        <MessageContent>
          <MessageHeader>You</MessageHeader>
          <Bubble>
            <BubbleContent>It?s all in the details.</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </MessageGroup>
  );
}
