import WetPaintButton from "../ui/wet-button";
import SportsDialog from "./select-sports";

function CTA() {
    return (
        <div className="w-full pb-10">
            <div className="container mx-auto">
                <div className="flex flex-col text-center bg-background border border-muted rounded-md p-4 lg:p-14 gap-8 items-center">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-3xl md:text-5xl tracking-tighter max-w-xl font-regular text-foreground">
                            Try our platform today!
                        </h3>
                        <p className="text-lg leading-relaxed tracking-tight text-muted-foreground max-w-xl">
                            Managing a small business today is already tough. Avoid further
                            complications by ditching outdated, tedious trade methods. Our goal
                            is to streamline SMB trade, making it easier and faster than ever.
                        </p>
                    </div>
                    <SportsDialog>
                        <WetPaintButton className="bg-red-500 cursor-pointer hover:scale-125 duration-300 transition-all px-8 py-4 text-3xl">Get Started</WetPaintButton>
                    </SportsDialog>
                </div>
            </div>
        </div>
    );
}

export { CTA };
