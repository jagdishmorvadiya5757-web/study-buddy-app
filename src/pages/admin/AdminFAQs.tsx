import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Save, Plus, Trash2, GripVertical } from 'lucide-react';
import { useFAQSettings, useUpdateFAQSettings, FAQ } from '@/hooks/useSupportSettings';

const AdminFAQs = () => {
  const { data: settings, isLoading } = useFAQSettings();
  const updateSettings = useUpdateFAQSettings();
  
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  useEffect(() => {
    if (settings) {
      setFaqs(settings.faqs);
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings.mutateAsync({ faqs });
  };

  const addFAQ = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const removeFAQ = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const updateFAQ = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = [...faqs];
    updated[index] = { ...updated[index], [field]: value };
    setFaqs(updated);
  };

  const hasChanges = JSON.stringify(settings?.faqs) !== JSON.stringify(faqs);

  return (
    <AdminLayout
      title="FAQs"
      subtitle="Manage frequently asked questions"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={addFAQ} className="gap-2">
            <Plus className="w-4 h-4" />
            Add FAQ
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || updateSettings.isPending}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <div className="bg-card rounded-xl shadow-soft p-8 text-center text-muted-foreground">
          Loading...
        </div>
      ) : faqs.length === 0 ? (
        <div className="bg-card rounded-xl shadow-soft p-8 text-center">
          <p className="text-muted-foreground mb-4">No FAQs added yet</p>
          <Button onClick={addFAQ} className="gap-2">
            <Plus className="w-4 h-4" />
            Add First FAQ
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="shadow-soft">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex items-start pt-2">
                    <GripVertical className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <Label htmlFor={`question-${index}`}>Question</Label>
                      <Input
                        id={`question-${index}`}
                        value={faq.question}
                        onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                        placeholder="Enter the question..."
                      />
                    </div>
                    <div>
                      <Label htmlFor={`answer-${index}`}>Answer</Label>
                      <Textarea
                        id={`answer-${index}`}
                        value={faq.answer}
                        onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                        placeholder="Enter the answer..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeFAQ(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminFAQs;
