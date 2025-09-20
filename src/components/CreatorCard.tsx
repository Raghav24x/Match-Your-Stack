import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Linkedin, MessageSquare } from 'lucide-react';

interface Creator {
  id: string;
  name: string;
  role_type: string;
  niches?: string[];
  bio?: string;
  substack_url?: string;
  linkedin_url?: string;
  audience_size?: number;
  pricing_tier: string;
  availability: string;
}

interface CreatorCardProps {
  creator: Creator;
  onRequestProposal: (creatorId: string) => void;
}

const CreatorCard = ({ creator, onRequestProposal }: CreatorCardProps) => {
  const getRoleBadgeColor = (roleType: string) => {
    switch (roleType) {
      case 'ghostwriter': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'pm-writes': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'content-writer': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'open': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'limited': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'booked': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatRoleType = (roleType: string) => {
    return roleType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-lg font-semibold">{creator.name}</CardTitle>
          <Badge className={getAvailabilityColor(creator.availability)} variant="secondary">
            {creator.availability}
          </Badge>
        </div>
        <Badge className={getRoleBadgeColor(creator.role_type)} variant="secondary">
          {formatRoleType(creator.role_type)}
        </Badge>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        {creator.bio && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
            {creator.bio}
          </p>
        )}

        {creator.niches && creator.niches.length > 0 && (
          <div className="mb-4">
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

        <div className="flex justify-between items-center text-sm mb-4">
          <div className="flex items-center gap-1">
            <span className="font-medium">Pricing:</span>
            <span className="text-primary font-bold">{creator.pricing_tier}</span>
          </div>
          {creator.audience_size && (
            <div className="text-muted-foreground">
              <span className="font-medium">Audience:</span> {creator.audience_size.toLocaleString()}
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-auto">
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
          <Button 
            variant="cta" 
            size="sm" 
            className="ml-auto"
            onClick={() => onRequestProposal(creator.id)}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Request Proposal
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatorCard;