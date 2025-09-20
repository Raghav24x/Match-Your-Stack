import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    search: ''
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
      case 'open': return 'bg-green-100 text-green-800';
      case 'limited': return 'bg-yellow-100 text-yellow-800';
      case 'booked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Creator Directory</h1>
          <p className="text-muted-foreground">Discover talented Substack creators for your next project</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Search</label>
                  <Input
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    placeholder="Search creators..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Role Type</label>
                  <select
                    value={filters.role_type}
                    onChange={(e) => setFilters({...filters, role_type: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">All roles</option>
                    <option value="ghostwriter">Ghostwriter</option>
                    <option value="pm-writes">PM Writes</option>
                    <option value="content-writer">Content Writer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Pricing Tier</label>
                  <select
                    value={filters.pricing_tier}
                    onChange={(e) => setFilters({...filters, pricing_tier: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">All pricing</option>
                    <option value="$">$ Budget-friendly</option>
                    <option value="$$">$$ Mid-range</option>
                    <option value="$$$">$$$ Premium</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Availability</label>
                  <select
                    value={filters.availability}
                    onChange={(e) => setFilters({...filters, availability: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">All availability</option>
                    <option value="open">Open</option>
                    <option value="limited">Limited</option>
                    <option value="booked">Booked</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Niches</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {allNiches.map(niche => (
                      <label key={niche} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedNiches.includes(niche)}
                          onChange={() => toggleNiche(niche)}
                          className="rounded"
                        />
                        <span className="text-sm">{niche}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Creators Grid */}
          <div className="lg:col-span-3">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Showing {filteredCreators.length} of {creators.length} creators
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCreators.map((creator) => (
                <Card key={creator.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{creator.name}</CardTitle>
                        <CardDescription className="capitalize">
                          {creator.role_type?.replace('-', ' ')}
                        </CardDescription>
                      </div>
                      <Badge className={getAvailabilityColor(creator.availability)}>
                        {creator.availability}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {creator.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {creator.bio}
                        </p>
                      )}

                      {creator.niches && creator.niches.length > 0 && (
                        <div>
                          <div className="flex flex-wrap gap-1">
                            {creator.niches.slice(0, 3).map((niche) => (
                              <Badge key={niche} variant="outline" className="text-xs">
                                {niche}
                              </Badge>
                            ))}
                            {creator.niches.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{creator.niches.length - 3} more
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
                              Substack
                            </a>
                          </Button>
                        )}
                        <Button variant="cta" size="sm">
                          <MessageSquare size={16} className="mr-1" />
                          Request Proposal
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCreators.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No creators match your current filters.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setFilters({role_type: '', pricing_tier: '', availability: '', search: ''});
                    setSelectedNiches([]);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Directory;