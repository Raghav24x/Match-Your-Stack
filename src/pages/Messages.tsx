import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Send } from 'lucide-react';

const Messages = () => {
  const { id } = useParams(); // match ID
  const [match, setMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'company' or 'creator'
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (id && user) {
      fetchMatch();
      fetchMessages();
      determineUserRole();
    }
  }, [id, user]);

  const determineUserRole = async () => {
    if (!user || !id) return;

    // Check if user is the company
    const { data: companyMatch } = await supabase
      .from('matches')
      .select(`
        briefs (
          companies (
            user_id
          )
        )
      `)
      .eq('id', id)
      .single();

    if (companyMatch?.briefs?.companies?.user_id === user.id) {
      setUserRole('company');
      return;
    }

    // Check if user is the creator
    const { data: creatorMatch } = await supabase
      .from('matches')
      .select(`
        creators (
          user_id
        )
      `)
      .eq('id', id)
      .single();

    if (creatorMatch?.creators?.user_id === user.id) {
      setUserRole('creator');
    }
  };

  const fetchMatch = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          briefs (
            *,
            companies (*)
          ),
          creators (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setMatch(data);
    } catch (error) {
      console.error('Error fetching match:', error);
      toast({
        title: "Error",
        description: "Could not load conversation details",
        variant: "destructive"
      });
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userRole) return;

    setIsSending(true);

    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          match_id: id,
          sender_role: userRole,
          body: newMessage.trim()
        }]);

      if (error) throw error;

      setNewMessage('');
      fetchMessages(); // Refresh messages
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading conversation...</div>
        </div>
      </div>
    );
  }

  if (!match || !userRole) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Conversation not found</h1>
            <p className="text-muted-foreground">You don't have access to this conversation.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Conversation Header */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">
              {userRole === 'company' ? match.creators.name : match.briefs.companies.name}
            </CardTitle>
            <CardDescription>
              About: {match.briefs.title}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Messages */}
        <Card className="mb-4">
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_role === userRole ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender_role === userRole
                          ? 'bg-cta text-cta-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      <p className="text-sm">{message.body}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {formatDate(message.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Message Input */}
        <Card>
          <CardContent className="p-4">
            <form onSubmit={sendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={isSending}
                className="flex-1"
              />
              <Button 
                type="submit" 
                variant="cta" 
                disabled={isSending || !newMessage.trim()}
              >
                <Send size={16} />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Messages;