'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChatMessage } from './chat-message';
import { apiClient } from '@/lib/api';

export function ChatWithData() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Array<{ type: 'user' | 'assistant'; content: any }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    const userQuestion = question.trim();
    setQuestion('');
    setMessages((prev) => [...prev, { type: 'user', content: userQuestion }]);
    setIsLoading(true);

    try {
      const response = await apiClient.chatWithData(userQuestion);
      setMessages((prev) => [
        ...prev,
        {
          type: 'assistant',
          content: response,
        },
      ]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          type: 'assistant',
          content: {
            error: error.message || 'Failed to generate SQL',
          },
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-[calc(100vh-200px)] flex flex-col">
      <CardHeader>
        <CardTitle>Chat with Data</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              Ask a question about your data to generate SQL queries
            </div>
          )}
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
          {isLoading && (
            <div className="text-muted-foreground">Generating SQL...</div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="e.g., What's the total spend in the last 90 days?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !question.trim()}>
            Send
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


