import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Brief {
  id: string;
  title: string;
  description?: string;
  role_type_required: string;
  niches?: string[];
  budget_min?: number;
  budget_max?: number;
  urgency: string;
  status: string;
}

interface BriefSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorId: string;
  creatorName: string;
}

const BriefSelectionModal = ({ isOpen, onClose, creatorId, creatorName }: BriefSelectionModalProps) => {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [selectedBrief, setSelectedBrief] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingMatch, setIsCreatingMatch] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && user) {
      fetchUserBriefs();
    }
  }, [isOpen, user]);

  const fetchUserBriefs = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Get company first
      const { data: companies, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (companyError || !companies) {
        toast({
          title: "No company profile found",
          description: "Please complete your company onboarding first.",
          variant: "destructive",
        });
        return;
      }

      // Get company's briefs
      const { data, error } = await supabase
        .from('briefs')
        .select('*')
        .eq('company_id', companies.id)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBriefs(data || []);
    } catch (error) {
      console.error('Error fetching briefs:', error);
      toast({
        title: "Error",
        description: "Failed to load your briefs.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMatch = async () => {
    if (!selectedBrief) return;

    setIsCreatingMatch(true);
    try {
      const { data, error } = await supabase
        .from('matches')
        .insert({
          brief_id: selectedBrief,
          creator_id: creatorId,
          status: 'suggested'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Proposal sent!",
        description: `Your proposal has been sent to ${creatorName}.`,
      });

      onClose();
      navigate(`/match/${data.id}/messages`);
    } catch (error) {
      console.error('Error creating match:', error);
      toast({
        title: "Error",
        description: "Failed to send proposal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingMatch(false);
    }
  };

  const formatBudget = (min?: number, max?: number) => {
    if (!min && !max) return 'Budget not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return 'Budget not specified';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select a Brief for {creatorName}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8">Loading your briefs...</div>
        ) : briefs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">You don't have any open briefs.</p>
            <Button onClick={() => navigate('/brief/new')}>Create a Brief</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select which brief you'd like to send to {creatorName}:
            </p>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {briefs.map((brief) => (
                <Card 
                  key={brief.id} 
                  className={`cursor-pointer transition-all ${
                    selectedBrief === brief.id 
                      ? 'ring-2 ring-primary border-primary' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedBrief(brief.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{brief.title}</CardTitle>
                      <Badge className={getUrgencyColor(brief.urgency)} variant="secondary">
                        {brief.urgency}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {brief.description && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {brief.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Role: {brief.role_type_required.replace('-', ' ')}</span>
                      <span>{formatBudget(brief.budget_min, brief.budget_max)}</span>
                    </div>
                    {brief.niches && brief.niches.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {brief.niches.slice(0, 3).map((niche) => (
                          <Badge key={niche} variant="outline" className="text-xs">
                            {niche}
                          </Badge>
                        ))}
                        {brief.niches.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{brief.niches.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateMatch}
                disabled={!selectedBrief || isCreatingMatch}
              >
                {isCreatingMatch ? 'Sending...' : 'Send Proposal'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BriefSelectionModal;