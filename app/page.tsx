"use client";
import { useEffect, useRef, useState } from "react";

// Type pour une section
interface Section {
  title: string;
  description: string;
  buttonText: string;
  buttonLink?: string;
  backgroundImage: string;
  backgroundOverlay?: string; // Overlay semi-transparent
}

// Type pour une page
interface PageData {
  id: string;
  name: string;
  sections: Section[];
}

// Page Component
function ScrollPage({
  sections,
  indicatorPosition = "right"
}: {
  sections: Section[];
  indicatorPosition?: "right" | "left";
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(1);
  const isScrolling = useRef(false);

  const extendedSections = [...sections, ...sections, ...sections];

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout;
    const sectionHeight = window.innerHeight;

    const handleScroll = () => {
      if (isScrolling.current) return;

      clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {
        const scrollTop = container.scrollTop;
        const index = Math.round(scrollTop / sectionHeight);

        setCurrentIndex(index);

        if (index === 0) {
          isScrolling.current = true;
          container.style.scrollBehavior = "auto";
          container.scrollTop = sections.length * sectionHeight;
          setTimeout(() => {
            container.style.scrollBehavior = "smooth";
            isScrolling.current = false;
          }, 50);
        } else if (index === extendedSections.length - 1) {
          isScrolling.current = true;
          container.style.scrollBehavior = "auto";
          container.scrollTop = (sections.length * 2 - 1) * sectionHeight;
          setTimeout(() => {
            container.style.scrollBehavior = "smooth";
            isScrolling.current = false;
          }, 50);
        }
      }, 150);
    };

    container.scrollTop = sections.length * sectionHeight;

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [sections.length, extendedSections.length]);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <div
        ref={scrollRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {extendedSections.map((section, index) => (
          <section
            key={index}
            className="relative h-screen w-full flex items-center snap-start snap-always"
            style={{
              backgroundImage: `url(${section.backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* Overlay pour améliorer la lisibilité */}
            <div
              className="absolute inset-0 bg-black/40"
              // style={{ backgroundColor: section.backgroundOverlay || "rgba(0, 0, 0, 0.4)" }}
            />

            {/* Contenu */}
            <div className="relative z-10 max-w-2xl ml-12 md:ml-20 lg:ml-32 text-white space-y-6">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                {section.title}
              </h2>

              <p className="text-lg md:text-xl text-white/90 max-w-xl leading-relaxed">
                {section.description}
              </p>

              <button
                onClick={() => section.buttonLink && window.open(section.buttonLink, '_blank')}
                className="px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-white/90 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                {section.buttonText}
              </button>
            </div>
          </section>
        ))}
      </div>

      {/* Indicateur de position */}
      <div
        className={`fixed ${indicatorPosition === "right" ? "right-8" : "left-8"} top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-20`}
      >
        {sections.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${(currentIndex % sections.length) === i
                ? "bg-white h-8"
                : "bg-white/40"
              }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const isHorizontalScrolling = useRef(false);

  // Données des pages - À PERSONNALISER
  const pages: PageData[] = [
    {
      id: "collection-automne",
      name: "Collection Automne",
      sections: Array.from({ length: 10 }, (_, i) => ({
        title: `Collection Automne ${i + 1}`,
        description: "Découvrez notre nouvelle collection automne avec des pièces élégantes et confortables pour toute la famille.",
        buttonText: "Découvrir",
        buttonLink: "#",
        backgroundImage: `/images/automne/section-${i + 1}.jpg`,
        backgroundOverlay: "rgba(139, 69, 19, 0.4)", // Overlay marron/automne
      })),
    },
    {
      id: "mode-printemps",
      name: "Mode Printemps",
      sections: Array.from({ length: 10 }, (_, i) => ({
        title: `Printemps Frais ${i + 1}`,
        description: "Des couleurs vives et des tissus légers pour célébrer le renouveau du printemps avec style.",
        buttonText: "Voir Plus",
        buttonLink: "#",
        backgroundImage: `/images/printemps/section-${i + 1}.jpg`,
        backgroundOverlay: "rgba(52, 152, 219, 0.4)", // Overlay bleu/printemps
      })),
    },
    {
      id: "style-ete",
      name: "Style Été",
      sections: Array.from({ length: 10 }, (_, i) => ({
        title: `Été Radieux ${i + 1}`,
        description: "Profitez du soleil avec notre collection estivale : légère, colorée et parfaite pour la plage.",
        buttonText: "Explorer",
        buttonLink: "#",
        backgroundImage: `/images/ete/section-${i + 1}.jpg`,
        backgroundOverlay: "rgba(231, 76, 60, 0.4)", // Overlay rouge/été
      })),
    },
  ];

  const extendedPages = [...pages, ...pages, ...pages];

  useEffect(() => {
    const container = horizontalScrollRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout;
    const pageWidth = window.innerWidth;

    const handleHorizontalScroll = () => {
      if (isHorizontalScrolling.current) return;

      clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {
        const scrollLeft = container.scrollLeft;
        const index = Math.round(scrollLeft / pageWidth);

        const targetScroll = index * pageWidth;
        if (Math.abs(scrollLeft - targetScroll) > 1) {
          container.scrollLeft = targetScroll;
        }

        setCurrentPageIndex(index);

        if (index === 0) {
          isHorizontalScrolling.current = true;
          container.style.scrollBehavior = "auto";
          container.scrollLeft = pages.length * pageWidth;
          setTimeout(() => {
            container.style.scrollBehavior = "smooth";
            isHorizontalScrolling.current = false;
          }, 50);
        } else if (index === extendedPages.length - 1) {
          isHorizontalScrolling.current = true;
          container.style.scrollBehavior = "auto";
          container.scrollLeft = (pages.length * 2 - 1) * pageWidth;
          setTimeout(() => {
            container.style.scrollBehavior = "smooth";
            isHorizontalScrolling.current = false;
          }, 50);
        }
      }, 100);
    };

    container.scrollLeft = pages.length * pageWidth;

    container.addEventListener("scroll", handleHorizontalScroll);
    return () => {
      container.removeEventListener("scroll", handleHorizontalScroll);
      clearTimeout(scrollTimeout);
    };
  }, [pages.length, extendedPages.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const container = horizontalScrollRef.current;
      if (!container || isHorizontalScrolling.current) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        container.scrollBy({
          left: window.innerWidth,
          behavior: "smooth"
        });
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        container.scrollBy({
          left: -window.innerWidth,
          behavior: "smooth"
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <div
        ref={horizontalScrollRef}
        className="h-full w-full overflow-x-scroll snap-x snap-mandatory scroll-smooth flex"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          scrollSnapType: "x mandatory",
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {extendedPages.map((page, pageIndex) => (
          <div
            key={`${page.id}-${pageIndex}`}
            className="snap-start snap-always"
            style={{ scrollSnapAlign: "start", scrollSnapStop: "always" }}
          >
            <ScrollPage
              sections={page.sections}
              indicatorPosition="right"
            />
          </div>
        ))}
      </div>

      {/* Indicateur de page horizontal */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-30">
        {pages.map((page, i) => (
          <div
            key={page.id}
            className={`w-2 h-2 rounded-full transition-all ${(currentPageIndex % pages.length) === i
                ? "bg-white w-8"
                : "bg-white/40"
              }`}
          />
        ))}
      </div>

      {/* Instructions */}
      <div className="fixed top-8 left-1/2 transform -translate-x-1/2 text-white/80 text-sm z-30 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
        ← → pour changer de page | ↑ ↓ pour scroller
      </div>
    </div>
  );
}