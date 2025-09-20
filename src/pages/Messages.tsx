import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Send, ArrowLeft, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Match {
  id: string;
  status: string;
  briefs: {
    id: string;
    title: string;
    companies: {
      id: string;
      name: string;
      user_id: string;
    };
  };
  creators: {
    id: string;
    name: string;
    user_id: string;
    role_type: string;
  };
}

interface Message {
  id: string;
  body: string;
  sender_role: 'company' | 'creator';
  created_at: string;
  match_id: string;
  isOptimistic?: boolean;
  error?: boolean;
}

const Messages = () => {
  const { id } = useParams();
  const [match, setMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [userRole, setUserRole] = useState<'company' | 'creator' | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id && user) {
      fetchMatchAndMessages();
    } else if (!user) {
      setHasAccess(false);
      setIsLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMatchAndMessages = async () => {
    if (!id || !user) return;

    try {
      // Fetch match with authorization check
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select(`
          *,
          briefs (
            id,
            title,
            companies (
              id,
              name,
              user_id
            )
          ),
          creators (
            id,
            name,
            user_id,
            role_type
          )
        `)
        .eq('id', id)
        .single();

      if (matchError) {
        if (matchError.code === 'PGRST116') {
          // No rows returned - user doesn't have access
          setHasAccess(false);
          setIsLoading(false);
          return;
        }
        throw matchError;
      }

      setMatch(matchData);

      // Determine user role
      let role: 'company' | 'creator' | null = null;
      if (matchData.briefs.companies.user_id === user.id) {
        role = 'company';
      } else if (matchData.creators.user_id === user.id) {
        role = 'creator';
      }

      if (!role) {
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      setUserRole(role);
      setHasAccess(true);

      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', id)
        .order('created_at', { ascending: false }); // Newest first

      if (messagesError) throw messagesError;

      setMessages((messagesData || []).map((msg: any) => ({
        ...msg,
        sender_role: msg.sender_role as 'company' | 'creator'
      })));
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Could not load conversation details",
        variant: "destructive"
      });
      setHasAccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userRole || !id) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    // Create optimistic message
    const optimisticMessage: Message = {
      id: `optimistic-${Date.now()}`,
      body: messageText,
      sender_role: userRole,
      created_at: new Date().toISOString(),
      match_id: id,
      isOptimistic: true
    };

    // Add optimistic message to top (newest first)
    setMessages(prev => [optimisticMessage, ...prev]);

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          match_id: id,
          sender_role: userRole,
          body: messageText
        }])
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic message with real one
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticMessage.id ? {
          ...data,
          sender_role: data.sender_role as 'company' | 'creator'
        } : msg
      ));

      toast({
        title: "Message sent",
        description: "Your message has been delivered",
      });

      // Focus back on input
      inputRef.current?.focus();
    } catch (error: any) {
      // Mark optimistic message as failed
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticMessage.id 
          ? { ...msg, error: true }
          : msg
      ));

      toast({
        title: "Failed to send message",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const retryMessage = async (message: Message) => {
    if (!message.isOptimistic || !message.error) return;

    // Reset error state
    setMessages(prev => prev.map(msg => 
      msg.id === message.id 
        ? { ...msg, error: false }
        : msg
    ));

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          match_id: id,
          sender_role: userRole,
          body: message.body
        }])
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic message with real one
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? {
          ...data,
          sender_role: data.sender_role as 'company' | 'creator'
        } : msg
      ));

      toast({
        title: "Message sent",
        description: "Your message has been delivered",
      });
    } catch (error: any) {
      // Mark as failed again
      setMessages(prev => prev.map(msg => 
        msg.id === message.id 
          ? { ...msg, error: true }
          : msg
      ));

      toast({
        title: "Failed to send message",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getOtherParty = () => {
    if (!match || !userRole) return null;
    return userRole === 'company' ? match.creators : match.briefs.companies;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="space-y-3 mt-8">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                  <Skeleton className="h-16 w-64 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (hasAccess === false) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-12">
            <XCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-6">
              You don't have permission to view this conversation.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => navigate('/directory')}>
                Browse Directory
              </Button>
              <Button onClick={() => navigate('/')}>
                Go Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!match || !userRole) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Conversation not found</h1>
            <p className="text-muted-foreground mb-6">
              This conversation may have been deleted or you may not have access to it.
            </p>
            <Button onClick={() => navigate('/directory')}>
              Browse Directory
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const otherParty = getOtherParty();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-4 max-w-4xl h-screen flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <Link 
            to="/directory" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Directory
          </Link>
          
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-lg">
                    {getInitials(otherParty?.name || '')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-xl">{otherParty?.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span>About: {match.briefs.title}</span>
                    <Badge variant="secondary" className="ml-2">
                      {match.status}
                    </Badge>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Messages Container - Scrollable */}
        <Card className="flex-1 flex flex-col">
          <CardContent className="p-0 flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[60vh]">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                    <Send className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Start the conversation</h3>
                  <p className="text-sm">
                    Send your first message to get things rolling!
                  </p>
                </div>
              ) : (
                <>
                  {/* Messages in reverse chronological order (newest first) */}
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_role === userRole ? 'justify-end' : 'justify-start'
                      } animate-fade-in`}
                    >
                      <div className="flex items-end gap-2 max-w-[70%]">
                        {message.sender_role !== userRole && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {getInitials(otherParty?.name || '')}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            message.sender_role === userRole
                              ? 'bg-primary text-primary-foreground rounded-br-sm'
                              : 'bg-muted text-foreground rounded-bl-sm'
                          } ${message.isOptimistic ? 'opacity-75' : ''} ${
                            message.error ? 'border-2 border-destructive' : ''
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.body}</p>
                          <div className="flex items-center justify-between mt-1 gap-2">
                            <p className="text-xs opacity-70">
                              {formatDate(message.created_at)}
                            </p>
                            {message.isOptimistic && (
                              <div className="flex items-center gap-1">
                                {message.error ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-0 text-xs text-destructive hover:text-destructive"
                                    onClick={() => retryMessage(message)}
                                  >
                                    Retry
                                  </Button>
                                ) : (
                                  <Clock className="h-3 w-3 opacity-50" />
                                )}
                              </div>
                            )}
                            {!message.isOptimistic && message.sender_role === userRole && (
                              <CheckCircle className="h-3 w-3 opacity-50" />
                            )}
                          </div>
                        </div>

                        {message.sender_role === userRole && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              You
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Composer */}
            <div className="border-t p-4">
              <form onSubmit={sendMessage} className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message ${otherParty?.name}...`}
                  disabled={isSending}
                  className="flex-1"
                  autoComplete="off"
                />
                <Button 
                  type="submit" 
                  variant="cta" 
                  disabled={isSending || !newMessage.trim()}
                  className="px-4"
                >
                  {isSending ? (
                    <Clock className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Messages;