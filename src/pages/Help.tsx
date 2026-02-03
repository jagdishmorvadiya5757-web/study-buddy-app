import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/gtu/Header';
import BottomNavigation from '@/components/gtu/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ArrowLeft, HelpCircle, MessageSquare, Send } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useFAQSettings, useCreateSupportRequest } from '@/hooks/useSupportSettings';

const Help = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: faqSettings, isLoading } = useFAQSettings();
  const createSupportRequest = useCreateSupportRequest();
  
  const [contactOpen, setContactOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    await createSupportRequest.mutateAsync({ subject, message });
    setSubject('');
    setMessage('');
    setContactOpen(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      <Header />
      
      <main className="flex-1">
        {/* Header */}
        <section className="bg-muted/50 py-4 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="font-display text-xl font-bold text-foreground">Help & Support</h1>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-6">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <Accordion type="single" collapsible className="space-y-2">
                {faqSettings?.faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`faq-${index}`}
                    className="bg-card rounded-xl shadow-soft border-none px-4"
                  >
                    <AccordionTrigger className="hover:no-underline text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </section>

        {/* Contact Owner */}
        <section className="py-6">
          <div className="container mx-auto px-4">
            <div className="bg-card rounded-xl shadow-soft p-6 text-center">
              <MessageSquare className="w-12 h-12 text-primary mx-auto mb-3" />
              <h2 className="text-lg font-semibold mb-2">Still need help?</h2>
              <p className="text-muted-foreground mb-4">
                Can't find what you're looking for? Contact us and we'll get back to you.
              </p>

              {user ? (
                <Dialog open={contactOpen} onOpenChange={setContactOpen}>
                  <DialogTrigger asChild>
                    <Button className="gradient-primary">
                      <Send className="w-4 h-4 mr-2" />
                      Contact Owner
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Contact Support</DialogTitle>
                      <DialogDescription>
                        Submit your question or report an issue. We'll respond as soon as possible.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitRequest} className="space-y-4">
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          placeholder="Brief description of your issue"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          placeholder="Describe your issue in detail..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={4}
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={createSupportRequest.isPending}
                      >
                        {createSupportRequest.isPending ? 'Submitting...' : 'Submit Request'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              ) : (
                <Button asChild>
                  <Link to="/auth">Sign in to Contact</Link>
                </Button>
              )}
            </div>
          </div>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Help;
