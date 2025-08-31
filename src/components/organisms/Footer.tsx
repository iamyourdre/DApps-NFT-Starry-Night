'use client';
import { Github, Linkedin, Mail } from 'lucide-react';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-white/10 bg-background/40 backdrop-blur py-10">
      <div className="box flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold tracking-tight">NFTDROP</p>
          <p className="text-xs text-muted-foreground">
            © {year} NFTDROP. All rights reserved.
          </p>
        </div>
        <div className="flex gap-4">
            <a
              href="https://github.com/iamyourdre/NFT-Starry-Night"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-4 w-4" /> GitHub
            </a>
            <a
              href="https://linkedin.com/in/iamyourdre"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Linkedin className="h-4 w-4" /> LinkedIn
            </a>
            <a
              href="mailto:adriansutansaty260403@gmail.com"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="h-4 w-4" /> Email
            </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
