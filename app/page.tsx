import { CTA } from "@/components/landing/cta";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { HeroGeometric } from "@/components/landing/hero";

export default function LandingPage() {
    return (
        <div className="bg-background dark">
            <HeroGeometric badge="Cream11"
                title1="Stop Gambling"
                title2="Start CHEATING" />
            <Features />
            <CTA />
            <Footer />
        </div>
    )
}