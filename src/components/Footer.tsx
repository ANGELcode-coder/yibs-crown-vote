import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-gradient-hero py-10 px-4">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-4 text-center">
        <img src={logo} alt="YIBS" className="w-14 h-14 opacity-80" />
        <p className="text-primary-foreground/60 font-body text-sm">
          © 2026 Yaoundé International Business School. All rights reserved.
        </p>
        <p className="text-primary-foreground/40 font-body text-xs">
          Miss & Mister YIBS 2026 — Official Voting Platform
        </p>
      </div>
    </footer>
  );
};

export default Footer;
