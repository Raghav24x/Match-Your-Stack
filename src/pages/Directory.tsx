import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Chip } from '@/components/ui/chip';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { ExternalLink, MessageSquare } from 'lucide-react';

const Directory = () => {
  const [creators, setCreators] = useState([]);
  const [filteredCreators, setFilteredCreators] = useState([]);
  const [filters, setFilters] = useState({
    role_type: '',
    pricing_tier: '',
    availability: '',
    search: '',
    engagement: ''
  });
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [allNiches, setAllNiches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCreators();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [creators, filters, selectedNiches]);

  const fetchCreators = async () => {
    try {
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCreators(data || []);
      
      // Extract all unique niches
      const niches = data?.reduce((acc, creator) => {
        if (creator.niches) {
          creator.niches.forEach(niche => {
            if (!acc.includes(niche)) acc.push(niche);
          });
        }
        return acc;
      }, []) || [];
      
      setAllNiches(niches.sort());
    } catch (error) {
      console.error('Error fetching creators:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = creators.filter(creator => {
      // Role type filter
      if (filters.role_type && creator.role_type !== filters.role_type) return false;
      
      // Pricing tier filter
      if (filters.pricing_tier && creator.pricing_tier !== filters.pricing_tier) return false;
      
      // Availability filter
      if (filters.availability && creator.availability !== filters.availability) return false;
      
      // Engagement filter
      if (filters.engagement) {
        const hasEngagement = creator.subscribers > 0 || creator.posts_count > 0 || creator.activity_score > 0;
        if (filters.engagement === 'high' && (creator.subscribers < 1000 || creator.activity_score < 5)) return false;
        if (filters.engagement === 'medium' && (creator.subscribers < 500 || !hasEngagement)) return false;
        if (filters.engagement === 'low' && hasEngagement) return false;
      }
      
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          creator.name?.toLowerCase().includes(searchLower) ||
          creator.bio?.toLowerCase().includes(searchLower) ||
          creator.niches?.some(niche => niche.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }
      
      // Niche filter
      if (selectedNiches.length > 0) {
        const hasMatchingNiche = selectedNiches.some(niche => 
          creator.niches?.includes(niche)
        );
        if (!hasMatchingNiche) return false;
      }
      
      return true;
    });

    setFilteredCreators(filtered);
  };

  const toggleNiche = (niche: string) => {
    setSelectedNiches(prev => 
      prev.includes(niche) 
        ? prev.filter(n => n !== niche)
        : [...prev, niche]
    );
  };

  const getPricingLabel = (tier: string) => {
    switch(tier) {
      case '$': return 'Budget-friendly';
      case '$$': return 'Mid-range';
      case '$$$': return 'Premium';
      default: return tier;
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch(availability) {
      case 'open': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'limited': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'booked': return 'bg-red-500/10 text-red-700 border-red-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getAvailabilityDot = (availability: string) => {
    switch(availability) {
      case 'open': return 'bg-green-500';
      case 'limited': return 'bg-yellow-500';
      case 'booked': return 'bg-red-500';
      default: return 'bg-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading creators...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 md:px-6 py-16 md:py-20">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4 tracking-tight">🤝 Creator Directory</h1>
          <p className="text-lg text-foreground/80 max-w-3xl leading-relaxed">Discover talented Substack creators for your next project</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="rounded-2xl border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg text-secondary">Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium text-secondary mb-2 block">Search</Label>
                    <Input
                      value={filters.search}
                      onChange={(e) => setFilters({...filters, search: e.target.value})}
                      placeholder="Search creators..."
                      className="rounded-2xl border-border/50"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-secondary mb-3 block">Role Type</Label>
                    <RadioGroup 
                      value={filters.role_type} 
                      onValueChange={(value) => setFilters({...filters, role_type: value})}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="" id="all-roles" />
                        <Label htmlFor="all-roles" className="text-sm">All roles</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ghostwriter" id="ghostwriter" />
                        <Label htmlFor="ghostwriter" className="text-sm">Ghostwriter</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pm-writes" id="pm-writes" />
                        <Label htmlFor="pm-writes" className="text-sm">PM Writes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="content-writer" id="content-writer" />
                        <Label htmlFor="content-writer" className="text-sm">Content Writer</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-secondary mb-3 block">Pricing Tier</Label>
                    <div className="space-y-2">
                      {['', '$', '$$', '$$$'].map((tier) => (
                        <Chip
                          key={tier}
                          variant="filter"
                          selected={filters.pricing_tier === tier}
                          onClick={() => setFilters({...filters, pricing_tier: tier})}
                          className="mr-2 mb-2 cursor-pointer"
                        >
                          {tier === '' ? 'All pricing' : `${tier} ${getPricingLabel(tier)}`}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-secondary mb-3 block">Availability</Label>
                    <div className="space-y-2">
                      {['', 'open', 'limited', 'booked'].map((availability) => (
                        <Chip
                          key={availability}
                          variant="filter"
                          selected={filters.availability === availability}
                          onClick={() => setFilters({...filters, availability: availability})}
                          className="mr-2 mb-2 cursor-pointer capitalize"
                        >
                          {availability === '' ? 'All availability' : availability}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-secondary mb-3 block">Engagement</Label>
                    <div className="space-y-2">
                      {[
                        { value: '', label: 'All levels' },
                        { value: 'high', label: 'High (1K+ subs, 5+ partnerships)' },
                        { value: 'medium', label: 'Medium (500+ subs)' },
                        { value: 'low', label: 'Low engagement' }
                      ].map((engagement) => (
                        <Chip
                          key={engagement.value}
                          variant="filter"
                          selected={filters.engagement === engagement.value}
                          onClick={() => setFilters({...filters, engagement: engagement.value})}
                          className="mr-2 mb-2 cursor-pointer text-xs"
                        >
                          {engagement.label}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-secondary mb-3 block">Niches</Label>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      <div className="flex flex-wrap gap-1">
                        {allNiches.map(niche => (
                          <Chip
                            key={niche}
                            variant="filter"
                            selected={selectedNiches.includes(niche)}
                            onClick={() => toggleNiche(niche)}
                            className="text-xs cursor-pointer"
                          >
                            {niche}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Creators Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                Showing {filteredCreators.length} of {creators.length} creators
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCreators.map((creator) => (
                <Card key={creator.id} className="hover:shadow-lg hover:-translate-y-1 transition-all duration-200 rounded-2xl border-border/50">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-semibold text-primary">
                            {creator.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-lg text-secondary">{creator.name}</CardTitle>
                          <Badge variant="role-match" className="text-xs mt-1">
                            {creator.role_type?.replace('-', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getAvailabilityDot(creator.availability)}`}></div>
                        <Badge className={`text-xs border ${getAvailabilityColor(creator.availability)}`}>
                          {creator.availability}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {creator.bio && (
                      <p className="text-sm text-foreground/80 line-clamp-3 leading-relaxed">
                        {creator.bio}
                      </p>
                    )}

                    {creator.niches && creator.niches.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {creator.niches.slice(0, 5).map((niche) => (
                          <Chip key={niche} variant="default" className="text-xs">
                            {niche}
                          </Chip>
                        ))}
                        {creator.niches.length > 5 && (
                          <Chip variant="default" className="text-xs">
                            +{creator.niches.length - 5}
                          </Chip>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span className="font-medium">
                          {creator.pricing_tier} {getPricingLabel(creator.pricing_tier)}
                        </span>
                        {creator.audience_size && (
                          <span>
                            {creator.audience_size.toLocaleString()} subscribers
                          </span>
                        )}
                      </div>
                      
                      {/* Engagement metrics */}
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <div className="flex gap-3">
                          {creator.subscribers && (
                            <span>{creator.subscribers.toLocaleString()} subs</span>
                          )}
                          {creator.posts_count && (
                            <span>{creator.posts_count} posts</span>
                          )}
                          {creator.activity_score && (
                            <span>{creator.activity_score} partnerships</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      {creator.substack_url && (
                        <Button variant="outline" size="sm" asChild className="rounded-2xl flex-1">
                          <a href={creator.substack_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink size={16} className="mr-1" />
                            Substack
                          </a>
                        </Button>
                      )}
                      <Button variant="cta" size="sm" className="rounded-2xl flex-1">
                        <MessageSquare size={16} className="mr-1" />
                        Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCreators.length === 0 && (
              <Card className="text-center py-12 rounded-2xl border-border/50">
                <CardContent>
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-muted-foreground mb-4">No creators match your current filters.</p>
                  <Button 
                    variant="outline" 
                    className="rounded-2xl"
                    onClick={() => {
                      setFilters({role_type: '', pricing_tier: '', availability: '', search: '', engagement: ''});
                      setSelectedNiches([]);
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Directory;