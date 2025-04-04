"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { CartButton } from "@/components/CartButton";

const Navbar = () => {
  const { data: session } = useSession();
  const [menuState, setMenuState] = useState(false);

  return (
    <nav
      data-state={menuState ? "active" : ""}
      className="fixed z-20 w-full border-b border-dashed dark:border-slate-700 bg-transparent backdrop-blur md:relative lg:dark:bg-transparent lg:bg-black/10"
    >
      <div className="m-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
          <div className="flex w-full justify-between lg:w-auto">
            <Link
              href="/"
              aria-label="home"
              className="flex items-center space-x-2"
            >
              <Image
                src="/images/logobgr.png"
                alt="Integration Platform"
                width={44}
                height={44}
                className="rounded-lg"
                priority
              />
              <span className="font-bold text-2xl text-green-200 dark:text-green-600">
                FreshLeap
              </span>
            </Link>

            <button
              onClick={() => setMenuState(!menuState)}
              aria-label={menuState ? "Close Menu" : "Open Menu"}
              className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
            >
              <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
              <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
            </button>
          </div>

          <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
            <div className="lg:pr-4">
              {session ? (
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-gray-200 dark:text-gray-300">
                    Welcome, {session?.user?.name}
                  </span>
                </div>
              ) : (
                <div className="flex space-x-3 items-center">
                  <CartButton />
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="p-5 bg-input/10 text-white"
                  >
                    <Link href={`/products`}>
                      <span>All Products</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="p-5">
                    <Link href="/sign-in">
                      <span>Login</span>
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="p-5 bg-green-500">
                    <Link href="/sign-up">
                      <span>Sign Up</span>
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit lg:border-l lg:pl-6">
              {session && (
                <>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="p-5 bg-input/10 text-white"
                  >
                    <Link href={`/orders/${session?.user?.id}`}>
                      <span>My Orders</span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="p-5 bg-input/10 text-white"
                  >
                    <Link href={`/products`}>
                      <span>All Products</span>
                    </Link>
                  </Button>
                  <CartButton />
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="p-5 bg-input/10 text-white"
                    onClick={() => signOut()}
                  >
                    <Link href="/sign-in">
                      <span>Logout</span>
                    </Link>
                  </Button>
                  {session?.user?.role?.toLowerCase() !== "customer" && (
                    <Button asChild size="sm" className="p-5 bg-green-500">
                      <Link
                        href={`/dashboard/${session?.user?.role?.toLowerCase()}/${session?.user?.id}`}
                      >
                        <span>Dashboard</span>
                      </Link>
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
