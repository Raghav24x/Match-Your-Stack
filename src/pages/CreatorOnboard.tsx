import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { X } from 'lucide-react';
import Header from '@/components/Header';

const CreatorOnboard = () => {
  const [formData, setFormData] = useState({
    name: '',
    role_type: '',
    bio: '',
    substack_url: '',
    audience_size: '',
    linkedin_url: '',
    pricing_tier: '$$',
    availability: 'open'
  });
  const [niches, setNiches] = useState<string[]>([]);
  const [samples, setSamples] = useState<string[]>([]);
  const [currentNiche, setCurrentNiche] = useState('');
  const [currentSample, setCurrentSample] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [existingCreator, setExistingCreator] = useState(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkExistingCreator();
  }, [user]);

  const checkExistingCreator = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('creators')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data) {
      setExistingCreator(data);
      setFormData({
        name: data.name || '',
        role_type: data.role_type || '',
        bio: data.bio || '',
        substack_url: data.substack_url || '',
        audience_size: data.audience_size?.toString() || '',
        linkedin_url: data.linkedin_url || '',
        pricing_tier: data.pricing_tier || '$$',
        availability: data.availability || 'open'
      });
      setNiches(data.niches || []);
      setSamples(data.samples || []);
    }
  };

  const addNiche = () => {
    if (currentNiche.trim() && !niches.includes(currentNiche.trim())) {
      setNiches([...niches, currentNiche.trim()]);
      setCurrentNiche('');
    }
  };

  const removeNiche = (niche: string) => {
    setNiches(niches.filter(n => n !== niche));
  };

  const addSample = () => {
    if (currentSample.trim() && !samples.includes(currentSample.trim())) {
      setSamples([...samples, currentSample.trim()]);
      setCurrentSample('');
    }
  };

  const removeSample = (sample: string) => {
    setSamples(samples.filter(s => s !== sample));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const creatorData = {
        user_id: user?.id,
        name: formData.name,
        role_type: formData.role_type,
        bio: formData.bio,
        substack_url: formData.substack_url,
        audience_size: formData.audience_size ? parseInt(formData.audience_size) : null,
        linkedin_url: formData.linkedin_url,
        pricing_tier: formData.pricing_tier,
        availability: formData.availability,
        niches,
        samples
      };

      const { error } = existingCreator
        ? await supabase.from('creators').update(creatorData).eq('id', existingCreator.id)
        : await supabase.from('creators').insert([creatorData]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: existingCreator ? "Profile updated successfully" : "Creator profile created successfully"
      });

      navigate('/directory');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>{existingCreator ? 'Update Your' : 'Create Your'} Creator Profile</CardTitle>
            <CardDescription>
              Tell companies about your writing style, audience, and expertise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role_type">Role Type</Label>
                  <select
                    id="role_type"
                    value={formData.role_type}
                    onChange={(e) => setFormData({...formData, role_type: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Select role type</option>
                    <option value="ghostwriter">Ghostwriter</option>
                    <option value="pm-writes">PM Writes</option>
                    <option value="content-writer">Content Writer</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Tell companies about your writing style and experience..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Niches</Label>
                <div className="flex gap-2">
                  <Input
                    value={currentNiche}
                    onChange={(e) => setCurrentNiche(e.target.value)}
                    placeholder="Add a niche (e.g., Tech, Finance, Health)"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addNiche())}
                  />
                  <Button type="button" onClick={addNiche} variant="outline">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {niches.map((niche) => (
                    <Badge key={niche} variant="secondary" className="flex items-center gap-1">
                      {niche}
                      <X size={14} className="cursor-pointer" onClick={() => removeNiche(niche)} />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="substack_url">Substack URL</Label>
                  <Input
                    id="substack_url"
                    type="url"
                    value={formData.substack_url}
                    onChange={(e) => setFormData({...formData, substack_url: e.target.value})}
                    placeholder="https://yourname.substack.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="audience_size">Audience Size</Label>
                  <Input
                    id="audience_size"
                    type="number"
                    value={formData.audience_size}
                    onChange={(e) => setFormData({...formData, audience_size: e.target.value})}
                    placeholder="e.g., 5000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                <Input
                  id="linkedin_url"
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
                  placeholder="https://linkedin.com/in/yourname"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pricing_tier">Pricing Tier</Label>
                  <select
                    id="pricing_tier"
                    value={formData.pricing_tier}
                    onChange={(e) => setFormData({...formData, pricing_tier: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="$">$ (Budget-friendly)</option>
                    <option value="$$">$$ (Mid-range)</option>
                    <option value="$$$">$$$ (Premium)</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  <select
                    id="availability"
                    value={formData.availability}
                    onChange={(e) => setFormData({...formData, availability: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="open">Open</option>
                    <option value="limited">Limited</option>
                    <option value="booked">Booked</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sample Work URLs</Label>
                <div className="flex gap-2">
                  <Input
                    value={currentSample}
                    onChange={(e) => setCurrentSample(e.target.value)}
                    placeholder="Add a URL to your work"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSample())}
                  />
                  <Button type="button" onClick={addSample} variant="outline">Add</Button>
                </div>
                <div className="space-y-1 mt-2">
                  {samples.map((sample) => (
                    <div key={sample} className="flex items-center justify-between p-2 bg-secondary rounded">
                      <span className="text-sm truncate">{sample}</span>
                      <X size={14} className="cursor-pointer" onClick={() => removeSample(sample)} />
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" variant="cta" className="w-full" disabled={isLoading}>
                {isLoading ? 'Saving...' : existingCreator ? 'Update Profile' : 'Create Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreatorOnboard;