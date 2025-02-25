import image from "@/assets/demo_img.png";
import ButtonRing from "@/icons/ButtonRing";
import Image from "next/image";
import Link from "next/link";

export const IndexPage = () => {
  return (
    <div className="w-screen p-16 pt-0">
      <div className="flex justify-center items-center h-screen flex-col max-w-[1024px] mx-auto">
        <h2 className="text-[110px] font-bold text-center">
          Dialogs that work for you
        </h2>
        <p className="text-4xl font-medium mt-4 text-center">
          Chatsky UI helps you create versatile chatbots for business purposes
          and personal needs.
        </p>
        <div className="flex items-center justify-center gap-8 mt-12">
          <div className="flex items-center justify-center">
            <ButtonRing />
            <Link
              className="text-2xl font-medium bg-foreground border-3 border-foreground text-background py-2 px-4 rounded-xl"
              href="/docs"
            >
              Try Chatsky UI for free
            </Link>
          </div>
          <div className="flex items-center justify-center">
            <ButtonRing />
            <Link
              className="text-2xl font-medium bg-transparent border-3 border-foreground text-foreground py-2 px-4 rounded-xl"
              href="/docs"
            >
              Learn how it works {"->"}
            </Link>
          </div>
        </div>
      </div>
      <div className="flex justify-center items-center h-max">
        <Image
          className="rounded-[32px] border-[32px] border-black"
          src={image}
          alt="demo_img"
        />
      </div>
    </div>
  );
};
