import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { ExternalLink, MessageSquare, Star } from 'lucide-react';

const Recommendations = () => {
  const { id } = useParams();
  const [brief, setBrief] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchBrief();
      fetchRecommendations();
    }
  }, [id]);

  const fetchBrief = async () => {
    try {
      const { data, error } = await supabase
        .from('briefs')
        .select(`
          *,
          companies (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setBrief(data);
    } catch (error) {
      console.error('Error fetching brief:', error);
      toast({
        title: "Error",
        description: "Could not load brief details",
        variant: "destructive"
      });
    }
  };

  const fetchRecommendations = async () => {
    try {
      const { data, error } = await supabase
        .from('v_recommendations')
        .select('*')
        .eq('brief_id', id)
        .order('score', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecommendations(data || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShortlist = async (creatorId: string) => {
    try {
      const { error } = await supabase
        .from('matches')
        .insert([{
          brief_id: id,
          creator_id: creatorId,
          status: 'shortlisted'
        }]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Creator shortlisted successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleMessage = async (creatorId: string) => {
    try {
      // Create or get existing match
      const { data: existingMatch } = await supabase
        .from('matches')
        .select('id')
        .eq('brief_id', id)
        .eq('creator_id', creatorId)
        .maybeSingle();

      let matchId = existingMatch?.id;

      if (!matchId) {
        const { data: newMatch, error } = await supabase
          .from('matches')
          .insert([{
            brief_id: id,
            creator_id: creatorId,
            status: 'contacted'
          }])
          .select('id')
          .single();

        if (error) throw error;
        matchId = newMatch.id;
      }

      navigate(`/match/${matchId}/messages`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getReasonBadges = (creator) => {
    const badges = [];
    
    if (creator.role_type === brief?.role_type_required) {
      badges.push({ text: "Role Match", variant: "default" });
    }
    
    if (brief?.niches && creator.niches) {
      const overlap = brief.niches.filter(niche => creator.niches.includes(niche)).length;
      if (overlap > 0) {
        badges.push({ text: `${overlap} Niche${overlap > 1 ? 's' : ''} Match`, variant: "secondary" });
      }
    }
    
    badges.push({ text: `${creator.pricing_tier} Pricing`, variant: "outline" });
    
    return badges;
  };

  const getPricingLabel = (tier: string) => {
    switch(tier) {
      case '$': return 'Budget-friendly';
      case '$$': return 'Mid-range';
      case '$$$': return 'Premium';
      default: return tier;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading recommendations...</div>
        </div>
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Brief not found</h1>
            <Button onClick={() => navigate('/brief/new')}>Create New Brief</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Brief Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{brief.title}</CardTitle>
            <CardDescription>
              {brief.companies?.name} • Looking for {brief.role_type_required?.replace('-', ' ')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <strong>Cadence:</strong> {brief.cadence}
              </div>
              <div>
                <strong>Budget:</strong> ${brief.budget_min?.toLocaleString()} - ${brief.budget_max?.toLocaleString()}
              </div>
              <div>
                <strong>Urgency:</strong> {brief.urgency}
              </div>
            </div>
            {brief.niches && brief.niches.length > 0 && (
              <div className="mt-4">
                <strong>Niches:</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {brief.niches.map(niche => (
                    <Badge key={niche} variant="outline">{niche}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommendations */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Recommended Creators ({recommendations.length})</h2>
          
          {recommendations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No creators match your brief requirements yet.
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Try browsing our directory or adjusting your brief criteria.
                </p>
                <Button variant="outline" onClick={() => navigate('/directory')}>
                  Browse Directory
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recommendations.map((creator) => (
                <Card key={creator.creator_id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{creator.creator_name}</CardTitle>
                        <CardDescription className="capitalize">
                          {creator.role_type?.replace('-', ' ')}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-500" />
                        <span className="text-sm font-medium">{creator.score?.toFixed(1)}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {creator.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {creator.bio}
                        </p>
                      )}

                      {/* Reason badges */}
                      <div className="flex flex-wrap gap-1">
                        {getReasonBadges(creator).map((badge, index) => (
                          <Badge key={index} variant={badge.variant}>
                            {badge.text}
                          </Badge>
                        ))}
                      </div>

                      {creator.niches && creator.niches.length > 0 && (
                        <div>
                          <div className="flex flex-wrap gap-1">
                            {creator.niches.slice(0, 4).map((niche) => (
                              <Badge key={niche} variant="outline" className="text-xs">
                                {niche}
                              </Badge>
                            ))}
                            {creator.niches.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{creator.niches.length - 4} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-sm">
                        <span>
                          <strong>Pricing:</strong> {getPricingLabel(creator.pricing_tier)}
                        </span>
                        {creator.audience_size && (
                          <span>
                            <strong>Audience:</strong> {creator.audience_size.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        {creator.substack_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={creator.substack_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink size={16} className="mr-1" />
                              View
                            </a>
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleShortlist(creator.creator_id)}
                        >
                          Shortlist
                        </Button>
                        <Button 
                          variant="cta" 
                          size="sm"
                          onClick={() => handleMessage(creator.creator_id)}
                        >
                          <MessageSquare size={16} className="mr-1" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recommendations;