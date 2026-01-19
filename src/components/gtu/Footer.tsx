import { Link } from 'react-router-dom';
import { GraduationCap, Mail, MapPin, Phone } from 'lucide-react';

const GTU_LOGO = 'https://www.gtu.ac.in/img/gtu_logo.png';

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={GTU_LOGO}
                alt="GTU Logo"
                className="h-12 w-12 object-contain bg-white rounded-lg p-1"
              />
              <div>
                <h3 className="font-display text-lg font-bold">GTU Study Mates</h3>
                <p className="text-sm text-background/70">Engineering Resources Portal</p>
              </div>
            </div>
            <p className="text-sm text-background/70 max-w-md">
              A comprehensive platform for GTU engineering students to access study materials, 
              previous year papers, solutions, and more.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li>
                <Link to="/" className="hover:text-secondary transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/resources" className="hover:text-secondary transition-colors">Resources</Link>
              </li>
              <li>
                <Link to="/branches" className="hover:text-secondary transition-colors">Branches</Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-secondary transition-colors">Login</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-background/70">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-secondary" />
                Gujarat, India
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-secondary" />
                support@gtustudymates.com
              </li>
              <li className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-secondary" />
                GTU Affiliated
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-8 pt-8 text-center text-sm text-background/50">
          <p>© 2025 GTU Study Mates. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;