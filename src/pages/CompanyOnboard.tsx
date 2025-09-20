import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { X } from 'lucide-react';
import Header from '@/components/Header';

const CompanyOnboard = () => {
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    contact_email: ''
  });
  const [industries, setIndustries] = useState<string[]>([]);
  const [currentIndustry, setCurrentIndustry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [existingCompany, setExistingCompany] = useState(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkExistingCompany();
  }, [user]);

  const checkExistingCompany = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data) {
      setExistingCompany(data);
      setFormData({
        name: data.name || '',
        website: data.website || '',
        contact_email: data.contact_email || ''
      });
      setIndustries(data.industries || []);
    }
  };

  const addIndustry = () => {
    if (currentIndustry.trim() && !industries.includes(currentIndustry.trim())) {
      setIndustries([...industries, currentIndustry.trim()]);
      setCurrentIndustry('');
    }
  };

  const removeIndustry = (industry: string) => {
    setIndustries(industries.filter(i => i !== industry));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const companyData = {
        user_id: user?.id,
        name: formData.name,
        website: formData.website,
        contact_email: formData.contact_email,
        industries
      };

      const { error } = existingCompany
        ? await supabase.from('companies').update(companyData).eq('id', existingCompany.id)
        : await supabase.from('companies').insert([companyData]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: existingCompany ? "Company updated successfully" : "Company profile created successfully"
      });

      navigate('/brief/new');
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
            <CardTitle>{existingCompany ? 'Update Your' : 'Create Your'} Company Profile</CardTitle>
            <CardDescription>
              Tell creators about your company and what you're looking for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  placeholder="https://yourcompany.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                  placeholder="contact@yourcompany.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Industries</Label>
                <div className="flex gap-2">
                  <Input
                    value={currentIndustry}
                    onChange={(e) => setCurrentIndustry(e.target.value)}
                    placeholder="Add an industry (e.g., Technology, Healthcare, Finance)"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIndustry())}
                  />
                  <Button type="button" onClick={addIndustry} variant="outline">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {industries.map((industry) => (
                    <Badge key={industry} variant="secondary" className="flex items-center gap-1">
                      {industry}
                      <X size={14} className="cursor-pointer" onClick={() => removeIndustry(industry)} />
                    </Badge>
                  ))}
                </div>
              </div>

              <Button type="submit" variant="cta" className="w-full" disabled={isLoading}>
                {isLoading ? 'Saving...' : existingCompany ? 'Update Company' : 'Create Company'}
              </Button>
              
              {existingCompany && (
                <div className="text-center pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/brief/new')}
                  >
                    Post a Brief
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyOnboard;