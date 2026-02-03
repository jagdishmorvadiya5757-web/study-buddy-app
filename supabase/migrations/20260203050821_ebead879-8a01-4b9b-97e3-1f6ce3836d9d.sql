-- Create support_requests table for user issues
CREATE TABLE public.support_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_response TEXT,
  responded_by UUID,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_requests
CREATE POLICY "Users can create own support requests"
ON public.support_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own support requests"
ON public.support_requests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all support requests"
ON public.support_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update support requests"
ON public.support_requests
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_support_requests_updated_at
BEFORE UPDATE ON public.support_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default terms_privacy settings
INSERT INTO public.site_settings (setting_key, setting_value)
VALUES ('terms_privacy', '{
  "terms_of_service": "## Terms of Service\n\nWelcome to GTU Study Mates. By using our platform, you agree to the following terms:\n\n### 1. Acceptance of Terms\nBy accessing and using this platform, you accept and agree to be bound by these Terms of Service.\n\n### 2. User Responsibilities\n- Users must provide accurate information during registration\n- Users are responsible for maintaining account security\n- Users must not share copyrighted materials without permission\n\n### 3. Content Usage\n- Study materials are provided for educational purposes only\n- Users may not redistribute content without authorization\n- All uploaded content must comply with copyright laws\n\n### 4. Account Termination\nWe reserve the right to terminate accounts that violate these terms.\n\n### 5. Changes to Terms\nWe may update these terms at any time. Continued use constitutes acceptance of changes.",
  "privacy_policy": "## Privacy Policy\n\nYour privacy is important to us. This policy explains how we collect and use your data.\n\n### 1. Information We Collect\n- Account information (email, name)\n- Usage data and analytics\n- Uploaded documents and scans\n\n### 2. How We Use Your Information\n- To provide and improve our services\n- To communicate with you about your account\n- To ensure platform security\n\n### 3. Data Security\n- We implement industry-standard security measures\n- Your data is encrypted in transit and at rest\n- We never sell your personal information\n\n### 4. Your Rights\n- You can request access to your data\n- You can request deletion of your account\n- You can opt out of non-essential communications\n\n### 5. Contact Us\nFor privacy concerns, contact us through the Help & Support section."
}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- Insert default FAQ settings
INSERT INTO public.site_settings (setting_key, setting_value)
VALUES ('faqs', '{
  "faqs": [
    {
      "question": "How do I download study materials?",
      "answer": "Navigate to the Resources section, select your branch and semester, then click the download button on any resource. Downloaded materials will be saved to your Library."
    },
    {
      "question": "How do I scan documents?",
      "answer": "Tap the Scan button in the bottom navigation. Position your document within the frame, capture the image, adjust corners if needed, and save as PDF."
    },
    {
      "question": "Can I share my scanned documents?",
      "answer": "Yes! Go to your Library, find the scanned document, and use the share option. You can also request to make your scan public for other students."
    },
    {
      "question": "How do I change my profile information?",
      "answer": "Go to Profile > Settings to update your display name and other account details."
    },
    {
      "question": "What file formats are supported for resources?",
      "answer": "We support PDF files for study materials and documents. Images can be scanned and converted to PDF using our scanner."
    },
    {
      "question": "How can I report an issue or bug?",
      "answer": "Use the Contact Owner button in the Help & Support section to submit your issue. Our team will review and respond to your request."
    }
  ]
}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;