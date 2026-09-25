"use client";

import { useEffect, useRef, useState } from "react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import { RotateCcw, Send, Sparkles, StopCircle, X } from "lucide-react";
import {
  Avatar,
  Badge,
  Card,
  Flex,
  IconButton,
  ScrollArea,
  Text,
  TextArea,
} from "@radix-ui/themes";

const AI_WELCOME =
  "Hi! I'm the AI Brain. Ask me to find the perfect tool for your needs.";

function messageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

function MessageBubble({ message }: { message: UIMessage }) {
  if (message.role === "user") {
    return (
      <Flex justify="end">
        <Text
          size="2"
          className="max-w-[80%] rounded-xl rounded-br-sm bg-zinc-700/80 px-3 py-2 text-zinc-50 whitespace-pre-wrap"
        >
          {messageText(message)}
        </Text>
      </Flex>
    );
  }
  return (
    <Flex gap="2" align="start">
      <Avatar
        size="1"
        radius="full"
        color="gray"
        variant="soft"
        fallback={<Sparkles size={12} />}
      />
      <Text
        size="2"
        className="max-w-[80%] rounded-xl rounded-bl-sm bg-zinc-800 px-3 py-2 text-zinc-200 whitespace-pre-wrap"
      >
        {messageText(message)}
      </Text>
    </Flex>
  );
}

export default function AIBrain() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const { messages, sendMessage, status, error, stop, regenerate } = useChat({
    transport: new DefaultChatTransport({ api: "/api/brain" }),
  });
  const viewportRef = useRef<HTMLDivElement>(null);

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    const el = viewportRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, status, open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function handleSend() {
    const text = draft.trim();
    if (!text || busy) return;
    sendMessage({ text });
    setDraft("");
  }

  return (
    <>
      <IconButton
        size="4"
        variant="solid"
        aria-label="Open AI Brain"
        title="Open AI Brain"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-[9999] shadow-lg transition hover:scale-105 active:scale-95"
      >
        <Sparkles size={20} />
      </IconButton>

      {open && (
        <div
          role="dialog"
          aria-label="AI Brain chat"
          className="fixed bottom-24 right-4 z-[9998] h-[600px] max-h-[calc(100vh-7rem)] w-[400px] max-w-[calc(100vw-2rem)]"
        >
          <Card size="3" variant="classic" className="overflow-hidden" style={{ height: "100%" }}>
            <Flex direction="column" style={{ height: "100%" }}>
              <Flex align="center" justify="between" className="mb-3">
                <Flex align="center" gap="2">
                  <Sparkles size={16} className="text-zinc-300" />
                  <Text weight="bold" size="3">
                    AI Brain
                  </Text>
                  <Badge color="gray" variant="soft">
                    Beta
                  </Badge>
                </Flex>
                <IconButton
                  size="1"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  aria-label="Close AI Brain"
                >
                  <X size={16} />
                </IconButton>
              </Flex>

              <div className="min-h-0 flex-1">
                <ScrollArea
                  ref={viewportRef}
                  type="auto"
                  scrollbars="vertical"
                  style={{ height: "100%" }}
                >
                  <div className="flex flex-col gap-3 pr-2">
                    {messages.length === 0 && (
                      <Flex gap="2" align="start">
                        <Avatar
                          size="1"
                          radius="full"
                          color="gray"
                          variant="soft"
                          fallback={<Sparkles size={12} />}
                        />
                        <Text
                          size="2"
                          className="max-w-[80%] rounded-xl rounded-bl-sm bg-zinc-800 px-3 py-2 text-zinc-200"
                        >
                          {AI_WELCOME}
                        </Text>
                      </Flex>
                    )}
                    {messages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))}
                    {status === "submitted" && (
                      <Flex gap="2" align="center">
                        <Avatar
                          size="1"
                          radius="full"
                          color="gray"
                          variant="soft"
                          fallback={<Sparkles size={12} />}
                        />
                        <Text size="2" color="gray">
                          Thinking…
                        </Text>
                      </Flex>
                    )}
                    {error && (
                      <Flex gap="2" align="center" justify="between" className="rounded-xl bg-red-950/40 px-3 py-2">
                        <Text size="2" color="red" className="flex-1">
                          Something went wrong.
                        </Text>
                        <IconButton
                          size="2"
                          variant="soft"
                          onClick={() => regenerate()}
                          aria-label="Retry"
                        >
                          <RotateCcw size={14} />
                        </IconButton>
                      </Flex>
                    )}
                  </div>
                </ScrollArea>
              </div>

              <Flex gap="2" align="end" className="mt-3">
                <TextArea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Ask about tools..."
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="flex-1"
                />
                {busy ? (
                  <IconButton
                    size="4"
                    variant="soft"
                    onClick={() => stop()}
                    aria-label="Stop generating"
                  >
                    <StopCircle size={16} />
                  </IconButton>
                ) : (
                  <IconButton
                    size="4"
                    variant="solid"
                    onClick={handleSend}
                    disabled={!draft.trim()}
                    aria-label="Send message"
                  >
                    <Send size={16} />
                  </IconButton>
                )}
              </Flex>
            </Flex>
          </Card>
        </div>
      )}
    </>
  );
}