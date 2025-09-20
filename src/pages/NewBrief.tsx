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

const NewBrief = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    role_type_required: '',
    cadence: 'monthly',
    budget_min: '',
    budget_max: '',
    urgency: 'medium'
  });
  const [niches, setNiches] = useState<string[]>([]);
  const [currentNiche, setCurrentNiche] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [company, setCompany] = useState(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkCompany();
  }, [user]);

  const checkCompany = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (!data) {
      toast({
        title: "Company Profile Required",
        description: "Please create your company profile first",
        variant: "destructive"
      });
      navigate('/onboard/company');
      return;
    }
    
    setCompany(data);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    
    setIsLoading(true);

    try {
      const briefData = {
        company_id: company.id,
        title: formData.title,
        description: formData.description,
        role_type_required: formData.role_type_required,
        cadence: formData.cadence,
        budget_min: formData.budget_min ? parseInt(formData.budget_min) : null,
        budget_max: formData.budget_max ? parseInt(formData.budget_max) : null,
        urgency: formData.urgency,
        niches,
        status: 'open'
      };

      const { data, error } = await supabase
        .from('briefs')
        .insert([briefData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Brief created successfully"
      });

      navigate(`/brief/${data.id}/recommendations`);
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

  if (!company) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Post a New Brief</CardTitle>
            <CardDescription>
              Describe your content needs and we'll match you with perfect creators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Brief Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Weekly Tech Newsletter for Developers"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your content needs, target audience, and any specific requirements..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role_type_required">Required Role Type</Label>
                <select
                  id="role_type_required"
                  value={formData.role_type_required}
                  onChange={(e) => setFormData({...formData, role_type_required: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Select role type</option>
                  <option value="ghostwriter">Ghostwriter</option>
                  <option value="pm-writes">PM Writes</option>
                  <option value="content-writer">Content Writer</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Content Niches</Label>
                <div className="flex gap-2">
                  <Input
                    value={currentNiche}
                    onChange={(e) => setCurrentNiche(e.target.value)}
                    placeholder="Add a niche (e.g., AI, SaaS, Fintech)"
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
                  <Label htmlFor="cadence">Cadence</Label>
                  <select
                    id="cadence"
                    value={formData.cadence}
                    onChange={(e) => setFormData({...formData, cadence: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="one-off">One-off</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency</Label>
                  <select
                    id="urgency"
                    value={formData.urgency}
                    onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget_min">Budget Min ($)</Label>
                  <Input
                    id="budget_min"
                    type="number"
                    value={formData.budget_min}
                    onChange={(e) => setFormData({...formData, budget_min: e.target.value})}
                    placeholder="e.g., 1000"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="budget_max">Budget Max ($)</Label>
                  <Input
                    id="budget_max"
                    type="number"
                    value={formData.budget_max}
                    onChange={(e) => setFormData({...formData, budget_max: e.target.value})}
                    placeholder="e.g., 5000"
                  />
                </div>
              </div>

              <Button type="submit" variant="cta" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating Brief...' : 'Post Brief & See Matches'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewBrief;