import React from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { ColorChangeCard } from "../ui/color-change-card";
import Link from "next/link";

export default function SportsDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="dark text-foreground sm:max-w-3xl w-full p-2 rounded-none">
        <div className="grid md:grid-cols-3">
          <Link href="https://cricket.cream11.live/">
            <ColorChangeCard heading="Cricket" imgSrc="/cricket.png" />
          </Link>
          <Link href="https://football.cream11.live/">
            <ColorChangeCard heading="Football" imgSrc="/football.png" />
          </Link>
          <Link href="https://basketball.cream11.live/">
            <ColorChangeCard heading="Basketball" imgSrc="/basketball.png" />
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
