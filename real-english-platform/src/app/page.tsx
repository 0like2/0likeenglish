
import HeroSection from "@/components/landing/HeroSection";
import CurriculumSection from "@/components/landing/CurriculumSection";
import TimetablePreview from "@/components/landing/TimetablePreview";
import AboutSection from "@/components/landing/AboutSection";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center w-full">
      <HeroSection />
      <CurriculumSection />
      <Separator className="max-w-7xl mx-auto" />
      <AboutSection />
      <TimetablePreview />

      {/* Footer (Simple Placeholder) */}
      <footer className="w-full py-12 bg-slate-900 text-slate-400 text-center">
        <p>© 2025 Real English. All rights reserved.</p>
        <div className="mt-4 flex justify-center gap-4 text-sm">
          <span className="hover:text-white cursor-pointer">이용약관</span>
          <span className="hover:text-white cursor-pointer">개인정보처리방침</span>
        </div>
      </footer>
    </main>
  );
}
