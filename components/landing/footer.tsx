import { Mail } from "lucide-react";
import Link from "next/link";

export function Footer() {
    return <footer>
        <div className="container mx-auto text-foreground py-10">
            <div className="flex flex-wrap justify-center md:flex-row md:justify-between items-center gap-4">
                <div className="text-3xl font-bold">
                    Cream11{" "}
                    <span className="text-sm max-md:block">The Fantasy Cheating AI</span>
                </div>
                <div className="flex items-center gap-2 hover:underline">
                    <Mail />
                    <Link href="mailto:hey@cream11.live">hey@cream11.live</Link>
                </div>
            </div>
        </div>
    </footer>
}