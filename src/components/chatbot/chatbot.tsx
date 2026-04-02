'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getChatbotResponse } from '@/app/actions';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

type Message = {
  role: 'user' | 'assistant' | 'loading';
  content: string;
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (input.trim() === '') return;
    const userInput = input;
    setInput('');

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: userInput },
      { role: 'loading', content: '...' },
    ]);
    
    const result = await getChatbotResponse(userInput);

    setMessages((prev) => {
      const newMessages = prev.filter((msg) => msg.role !== 'loading');
      if (result.response) {
        return [...newMessages, { role: 'assistant', content: result.response }];
      }
      if (result.error) {
        return [...newMessages, { role: 'assistant', content: result.error }];
      }
      return newMessages;
    });
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
        setTimeout(() => {
            const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
            if (viewport) {
                 viewport.scrollTop = viewport.scrollHeight;
            }
        }, 100);
    }
  }, [messages]);

  useEffect(() => {
    if(isOpen && messages.length === 0) {
      setMessages([{ role: 'assistant', content: '¡Hola! Soy el asistente virtual del CBTIS 294. ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre carreras, admisión y más.' }]);
    }
  }, [isOpen, messages.length]);

  return (
    <>
      <div className={cn("fixed bottom-6 right-6 z-50 transition-all duration-300", isOpen ? 'opacity-0 scale-90' : 'opacity-100 scale-100')}>
        <Button size="icon" className="rounded-full w-16 h-16 shadow-lg" onClick={() => setIsOpen(true)}>
          <Bot className="w-8 h-8" />
        </Button>
      </div>

      <div className={cn("fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out", isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none')}>
        <Card className="w-[350px] h-[500px] shadow-2xl flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="text-primary" /> Asistente Virtual
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full" ref={scrollAreaRef}>
              <div className="p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex gap-2 text-sm',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="w-8 h-8">
                       <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="w-5 h-5"/></AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={cn(
                      'rounded-lg px-3 py-2 max-w-[80%]',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    {message.role === 'loading' ? (
                      <div className="flex items-center justify-center p-1">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    ) : (
                      message.content
                    )}
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="w-8 h-8">
                       <AvatarFallback><User className="w-5 h-5"/></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex w-full items-center space-x-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu pregunta..."
                autoComplete="off"
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
