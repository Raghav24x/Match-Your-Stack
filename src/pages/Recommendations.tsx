import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { RecommendationSkeletons } from '@/components/RecommendationSkeletons';
import { ExternalLink, MessageSquare, Star, Heart, ArrowLeft, Linkedin } from 'lucide-react';

interface Brief {
  id: string;
  title: string;
  description?: string;
  role_type_required: string;
  niches?: string[];
  budget_min?: number;
  budget_max?: number;
  urgency: string;
  cadence: string;
  companies?: {
    name: string;
  };
}

interface Recommendation {
  creator_id: string;
  creator_name: string;
  role_type: string;
  niches?: string[];
  bio?: string;
  substack_url?: string;
  linkedin_url?: string;
  audience_size?: number;
  pricing_tier: string;
  availability: string;
  score?: number;
}

const Recommendations = () => {
  const { id } = useParams();
  const [brief, setBrief] = useState<Brief | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shortlistingIds, setShortlistingIds] = useState<Set<string>>(new Set());
  const [messagingIds, setMessagingIds] = useState<Set<string>>(new Set());
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
        .limit(10);

      if (error) throw error;
      setRecommendations(data || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShortlist = async (creatorId: string) => {
    setShortlistingIds(prev => new Set(prev).add(creatorId));
    
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
        title: "Added to shortlist!",
        description: "Creator has been shortlisted successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setShortlistingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(creatorId);
        return newSet;
      });
    }
  };

  const handleMessage = async (creatorId: string) => {
    setMessagingIds(prev => new Set(prev).add(creatorId));
    
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
    } finally {
      setMessagingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(creatorId);
        return newSet;
      });
    }
  };

  const getReasonBadges = (creator: Recommendation) => {
    const badges = [];
    
    // Role match badge
    if (creator.role_type === brief?.role_type_required) {
      badges.push({ 
        text: "Role match", 
        variant: "default" as const,
        className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      });
    }
    
    // Niche overlap badge
    if (brief?.niches && creator.niches) {
      const overlap = brief.niches.filter(niche => creator.niches?.includes(niche)).length;
      if (overlap > 0) {
        badges.push({ 
          text: `Niche overlap: ${overlap}`, 
          variant: "secondary" as const,
          className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
        });
      }
    }
    
    // Pricing fit badge - determine if pricing aligns with budget
    const isPricingFit = checkPricingFit(creator.pricing_tier, brief);
    if (isPricingFit) {
      badges.push({ 
        text: "Pricing fit", 
        variant: "outline" as const,
        className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      });
    }
    
    return badges;
  };

  const checkPricingFit = (pricingTier: string, brief: Brief | null) => {
    if (!brief?.budget_max) return false;
    
    switch (pricingTier) {
      case '$':
        return brief.budget_max <= 2000;
      case '$$':
        return brief.budget_max >= 2000 && brief.budget_max <= 5000;
      case '$$$':
        return brief.budget_max > 5000;
      default:
        return false;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500 text-white';
    if (score >= 60) return 'bg-yellow-500 text-white';
    if (score >= 40) return 'bg-orange-500 text-white';
    return 'bg-red-500 text-white';
  };

  const formatBudget = (min?: number, max?: number) => {
    if (!min && !max) return 'Budget not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return 'Budget not specified';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Link to="/directory" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Directory
            </Link>
            <div className="space-y-2">
              <div className="h-8 w-64 bg-muted animate-pulse rounded" />
              <div className="h-4 w-48 bg-muted animate-pulse rounded" />
            </div>
          </div>
          
          <div className="mb-6">
            <div className="h-6 w-48 bg-muted animate-pulse rounded mb-4" />
            <RecommendationSkeletons />
          </div>
        </div>
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Brief not found</h1>
            <p className="text-muted-foreground mb-6">The brief you're looking for doesn't exist or you don't have access to it.</p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => navigate('/directory')}>
                Browse Directory
              </Button>
              <Button onClick={() => navigate('/brief/new')}>
                Create New Brief
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Navigation & Header */}
        <div className="mb-8">
          <Link to="/directory" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Directory
          </Link>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-primary">{brief.title}</h1>
            <p className="text-muted-foreground">
              {brief.companies?.name} • Looking for {brief.role_type_required?.replace('-', ' ')} • {formatBudget(brief.budget_min, brief.budget_max)}
            </p>
          </div>
        </div>

        {/* Brief Details Card */}
        <Card className="mb-8 border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Brief Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Cadence</p>
                <p className="font-medium">{brief.cadence}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Budget Range</p>
                <p className="font-medium">{formatBudget(brief.budget_min, brief.budget_max)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Urgency</p>
                <Badge variant={brief.urgency === 'urgent' ? 'destructive' : 'secondary'}>
                  {brief.urgency}
                </Badge>
              </div>
            </div>
            
            {brief.niches && brief.niches.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Target Niches</p>
                <div className="flex flex-wrap gap-1">
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recommended Creators</h2>
            <span className="text-sm text-muted-foreground">
              {recommendations.length} match{recommendations.length !== 1 ? 'es' : ''} found
            </span>
          </div>
          
          {recommendations.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <Star className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">No recommendations yet</h3>
                    <p className="text-muted-foreground mb-4">
                      We couldn't find creators that match your brief requirements. This could be because your criteria are very specific or no creators are available.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="outline" asChild>
                      <Link to="/directory">Browse All Creators</Link>
                    </Button>
                    <Button asChild>
                      <Link to={`/brief/${id}/edit`}>Edit Brief</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recommendations.map((creator) => (
                <Card key={creator.creator_id} className="hover:shadow-lg transition-all duration-200 animate-fade-in">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">{creator.creator_name}</CardTitle>
                        <CardDescription className="capitalize">
                          {creator.role_type?.replace('-', ' ')}
                        </CardDescription>
                      </div>
                      
                      {/* Score Pill */}
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(creator.score || 0)}`}>
                        {Math.round(creator.score || 0)}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {creator.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {creator.bio}
                      </p>
                    )}

                    {/* Reason badges */}
                    <div className="flex flex-wrap gap-2">
                      {getReasonBadges(creator).map((badge, index) => (
                        <Badge 
                          key={index} 
                          variant={badge.variant}
                          className={badge.className}
                        >
                          {badge.text}
                        </Badge>
                      ))}
                    </div>

                    {/* Creator niches */}
                    {creator.niches && creator.niches.length > 0 && (
                      <div>
                        <div className="flex flex-wrap gap-1">
                          {creator.niches.slice(0, 5).map((niche) => (
                            <Badge key={niche} variant="outline" className="text-xs">
                              {niche}
                            </Badge>
                          ))}
                          {creator.niches.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{creator.niches.length - 5}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Pricing:</span>
                        <span className="font-semibold text-primary">{creator.pricing_tier}</span>
                      </div>
                      {creator.audience_size && (
                        <div className="text-muted-foreground">
                          <span>Audience:</span> <strong>{creator.audience_size.toLocaleString()}</strong>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <div className="flex gap-1">
                        {creator.substack_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={creator.substack_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {creator.linkedin_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={creator.linkedin_url} target="_blank" rel="noopener noreferrer">
                              <Linkedin className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-auto">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleShortlist(creator.creator_id)}
                          disabled={shortlistingIds.has(creator.creator_id)}
                          className="hover-scale"
                        >
                          <Heart className="h-4 w-4 mr-1" />
                          {shortlistingIds.has(creator.creator_id) ? 'Adding...' : 'Shortlist'}
                        </Button>
                        <Button 
                          variant="cta" 
                          size="sm"
                          onClick={() => handleMessage(creator.creator_id)}
                          disabled={messagingIds.has(creator.creator_id)}
                          className="hover-scale"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {messagingIds.has(creator.creator_id) ? 'Starting...' : 'Message'}
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