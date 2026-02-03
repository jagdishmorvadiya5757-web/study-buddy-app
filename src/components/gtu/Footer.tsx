import { Link } from 'react-router-dom';
import { Mail, MapPin } from 'lucide-react';
import gtuVerseLogo from '@/assets/gtu-verse-logo.jpeg';
import { useAboutSettings } from '@/hooks/useSiteSettings';

const Footer = () => {
  const { data: settings } = useAboutSettings();

  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={settings?.logo_url || gtuVerseLogo}
                alt={settings?.title || 'GTU-VERSE'}
                className="h-12 w-12 object-cover rounded-full"
              />
              <div>
                <h3 className="font-display text-lg font-bold">{settings?.title || 'GTU-VERSE'}</h3>
                <p className="text-sm text-background/70">{settings?.tagline || 'Engineering Resources Portal'}</p>
              </div>
            </div>
            <p className="text-sm text-background/70 max-w-md">
              {settings?.description || 'A comprehensive platform for GTU engineering students to access study materials, previous year papers, solutions, and more.'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-background/70">
              {settings?.quick_links?.map((link, index) => (
                <li key={index}>
                  {link.url.startsWith('http') ? (
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-secondary transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link to={link.url} className="hover:text-secondary transition-colors">
                      {link.label}
                    </Link>
                  )}
                </li>
              )) || (
                <>
                  <li><Link to="/" className="hover:text-secondary transition-colors">Home</Link></li>
                  <li><Link to="/resources" className="hover:text-secondary transition-colors">Resources</Link></li>
                  <li><Link to="/branches" className="hover:text-secondary transition-colors">Branches</Link></li>
                  <li><Link to="/auth" className="hover:text-secondary transition-colors">Login</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-background/70">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-secondary" />
                {settings?.contact_location || 'Gujarat, India'}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-secondary" />
                {settings?.contact_email || 'support@gtuverse.com'}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-8 pt-8 text-center text-sm text-background/50">
          <p>© 2025 {settings?.title || 'GTU-VERSE'}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
