import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getPlans } from "@/lib/paystack/action";
import { cn } from "@/lib/utils";
import { Award } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const HomePage = async () => {
  return (
    <>
      <section className="py-52 relative flex items-center justify-center flex-col bg-[url('/assets/circle.svg')] bg-cover bg-no-repeat">
        <div className="flex flex-col text-center items-center w-full gap-2 lg:pt-36 max-w-screen-lg px-2.5 sm:px-0">
          <h1 className="text-3xl md:text-7xl font-medium">
            <span className="block text-base sm:text-2xl">
              From Click to Cart —
            </span>
            <span className="">
              Accelerate Your E-Commerce Journey Effortlessly.
            </span>
          </h1>
          <p className="pt-2 text-muted-foreground my-3 text-sm sm:mt-5 lg:mb-0 sm:text-base lg:text-xl">
            Jamly is your express lane to online success.
            <br className="hidden md:block" />
            Set up your store swiftly, manage products effortlessly, and scale
            with confidence.
          </p>
        </div>
      </section>
      <section className="bg-[#f3f4f6] py-24 md:py-40">
        <MaxWidthWrapper>
          <div className="flex flex-col gap-3">
            <div className="flex text-muted-foreground">
              <Award className="text-muted-foreground w-6 h-6" />
              <p className="ml-1 text-base">Features</p>
            </div>
            <Separator className="bg-slate-200" />
            <div className="flex flex-col lg:flex-row justify-between my-5 gap-6 mlg:gap-16">
              <div className="flex gap-3">
                <h2 className="text-3xl md:text-5xl align-middle font-medium">
                  What does Jamly offer You?
                </h2>
              </div>
              <div className="flex max-w-2xl">
                <p className="text-lg lg:text-2xl text-muted-foreground">
                  Jamly brings you effortless integration and a straightforward
                  setup experience, providing a powerful platform tailored for
                  your operational ease and business growth.
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 my-5">
              <div>
                <Card className="flex flex-col-reverse rounded-3xl border border-slate-200 shadow-none">
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl">
                      Easy Setup
                    </CardTitle>
                    <CardDescription className="text-base md:text-lg">
                      Launch your store with just a few clicks using our
                      intuitive platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-1">
                    <Image
                      src={"/assets/74.png"}
                      alt="banner image"
                      width={300}
                      height={100}
                      className="rounded-tl-3xl rounded-tr-3xl border-2 border-muted w-full bg-[#f9fafb] h-52 object-contain"
                    />
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card className="flex flex-col-reverse rounded-3xl border border-slate-200 shadow-none">
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl">
                      Customizable Designs
                    </CardTitle>
                    <CardDescription className="text-base md:text-lg">
                      Choose from a variety of stunning templates that reflect
                      your brand's style
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-1">
                    <Image
                      src={"/assets/103.png"}
                      alt="banner image"
                      width={300}
                      height={100}
                      className="rounded-tl-3xl rounded-tr-3xl border-2 border-muted w-full bg-[#f9fafb] h-52 object-contain"
                    />
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card className="flex flex-col-reverse rounded-3xl border border-slate-200 shadow-none">
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl">
                      Powerful Tools
                    </CardTitle>
                    <CardDescription className="text-base md:text-lg">
                      Manage inventory, track orders, and analyze sales with our
                      comprehensive dashboard
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-1">
                    <Image
                      src={"/assets/197.png"}
                      alt="banner image"
                      width={300}
                      height={100}
                      className="rounded-tl-3xl rounded-tr-3xl border-2 border-muted w-full bg-[#f9fafb] h-52 object-contain"
                    />
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card className="flex flex-col-reverse rounded-3xl border border-slate-200 shadow-none">
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl">
                      Seamless Integrations
                    </CardTitle>
                    <CardDescription className="text-base md:text-lg">
                      Connect with popular payment gateways, marketing tools,
                      and more
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-1">
                    <Image
                      src={"/assets/211.png"}
                      alt="banner image"
                      width={300}
                      height={100}
                      className="rounded-tl-3xl rounded-tr-3xl border-2 border-muted w-full bg-[#f9fafb] h-52 object-contain"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </section>
      <section className="bg-[#f9fafb] py-24 md:py-40">
        <MaxWidthWrapper>
          <div className="flex flex-col gap-7 justify-center items-center">
            <div className="rounded-full border bg-white text-sm px-3 py-1">
              Community
            </div>
            <div className="items-center text-center space-y-2">
              <h3 className="font-semibold text-3xl">Join the Community</h3>
              <p className="text-muted-foreground text-xl">
                Supported by a network of early advocates, contributors, and
                champions.
              </p>
            </div>
            <div className="mt-14 w-full flex items-center justify-center mx-auto relative">
              <div className="shrink-0 h-[522px] w-[1420px] relative overflow-hidden">
                <div className="columns-4 gap-4 w-full">
                  <div className="flex flex-col-reverse h-full space-y-1.5 p-6 break-inside-avoid bg-white border rounded-2xl mb-4 gap-4">
                    <h3 className="font-medium tracking-tight text-lg">
                      - Ola
                    </h3>
                    <p className="text-slate-600 text-base md:text-xl flex-grow">
                      "Thanks to Jamly's architecture we've created tailored
                      commerce solutions for our clients in record time. Jamly's
                      flexibility makes adapting to new requirements painless."
                    </p>
                  </div>
                  <div className="flex flex-col-reverse h-full space-y-1.5 p-6 break-inside-avoid bg-white border rounded-2xl mb-4 gap-4">
                    <h3 className="font-medium tracking-tight text-lg">
                      - Sarah (Fashion Boutique Owner)
                    </h3>
                    <p className="text-slate-600 text-base md:text-xl flex-grow">
                      "Jamly transformed my boutique business! Setting up my
                      online store was a breeze, and the customizable designs
                      allowed me to showcase my unique brand. Plus, the seamless
                      integrations with payment gateways made transactions
                      smooth. Highly recommended!"
                    </p>
                  </div>
                  <div className="flex flex-col-reverse h-full space-y-1.5 p-6 break-inside-avoid bg-white border rounded-2xl mb-4 gap-4 translate-y-8">
                    <h3 className="font-medium tracking-tight text-lg">
                      - Mark (Tech Gadgets Retailer)
                    </h3>
                    <p className="text-slate-600 text-base md:text-xl flex-grow">
                      "As a tech retailer, I needed an e-commerce platform that
                      could handle inventory management and real-time analytics.
                      Jamly delivered! The case studies convinced me, and now my
                      business is thriving."
                    </p>
                  </div>
                  <div className="flex flex-col-reverse h-full space-y-1.5 p-6 break-inside-avoid bg-white border rounded-2xl mb-4 gap-4 translate-y-8">
                    <h3 className="font-medium tracking-tight text-lg">
                      - Emily (Handmade Crafts Seller)
                    </h3>
                    <p className="text-slate-600 text-base md:text-xl flex-grow">
                      "Jamly’s powerful tools helped me scale my handmade crafts
                      business. From order tracking to secure storage, it’s all
                      there. My sales have skyrocketed since joining!"
                    </p>
                  </div>
                  <div className="flex flex-col-reverse h-full space-y-1.5 p-6 break-inside-avoid bg-white border rounded-2xl mb-4 gap-4 translate-y-16">
                    <h3 className="font-medium tracking-tight text-lg">
                      - Alex (Fitness Apparel Brand)
                    </h3>
                    <p className="text-slate-600 text-base md:text-xl flex-grow">
                      "Just launched my fitness apparel store using Jamly! The
                      easy setup and responsive support team made the process
                      stress-free. #JamlySuccess"
                    </p>
                  </div>
                  <div className="flex flex-col-reverse h-full space-y-1.5 p-6 break-inside-avoid bg-white border rounded-2xl mb-4 gap-4 translate-y-16">
                    <h3 className="font-medium tracking-tight text-lg">
                      - Anita
                    </h3>
                    <p className="text-slate-600 text-base md:text-xl flex-grow">
                      "Choosing Jamly for my online art gallery was the best
                      decision I've made. The seamless integration with other
                      tools and the user-friendly interface have made managing
                      my gallery a breeze."
                    </p>
                  </div>
                  <div className="flex flex-col-reverse h-full space-y-1.5 p-6 break-inside-avoid bg-white border rounded-2xl mb-4 gap-4">
                    <h3 className="font-medium tracking-tight text-lg">
                      - Lucas (Home Decor Store Owner)
                    </h3>
                    <p className="text-slate-600 text-base md:text-xl flex-grow">
                      "Jamly has been a game-changer for my home decor business.
                      The platform's ease of use and powerful features have
                      allowed me to expand my customer base and increase sales
                      significantly"
                    </p>
                  </div>
                  <div className="flex flex-col-reverse h-full space-y-1.5 p-6 break-inside-avoid bg-white border rounded-2xl mb-4 gap-4">
                    <h3 className="font-medium tracking-tight text-lg">
                      - Chidi (Entrepreneur and Startup Advisor)
                    </h3>
                    <p className="text-slate-600 text-base md:text-xl flex-grow">
                      "I've advised many startups to use Jamly for their
                      e-commerce needs, and the results have been outstanding.
                      The platform's scalability and robust infrastructure make
                      it an excellent choice for businesses of all sizes."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </section>
      <section className="bg-[#f3f4f6] py-24 md:py-40">
        <MaxWidthWrapper>
          <div className="h-full flex flex-col gap-40 justify-center items-center">
            <div className="items-center text-center">
              <h3 className="font-semibold text-3xl">Get Started with Jamly</h3>
              <p className="text-muted-foreground text-xl">
                Get a head start and grow your business like a pro🏈
              </p>
              <Link href="/store" className={cn(buttonVariants(), "mt-10")}>
                Get Started
              </Link>
            </div>
            <div className="flex justify-end items-end w-full">
              <Image
                src={"/assets/updatedstarter.webp"}
                alt="banner image"
                width={1500}
                height={1500}
                className="border-2 border-muted w-full object-contain"
              />
            </div>
          </div>
        </MaxWidthWrapper>
      </section>
    </>
  );
};

export default HomePage;
