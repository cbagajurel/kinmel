"use client";
import {
  AlignLeft,
  ChevronDown,
  HeartIcon,
  ShoppingCart,
  User,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { navItems, type NavItemTypes } from "../config/constants";
import { useUser } from "../hooks/useUser";

const HeaderBottom = () => {
  const { user, isLoading } = useUser();
  const [show, setShow] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`w-full transition-all duration-300 min-w-full flex ${
        isSticky ? "fixed top-0 left-0 bg-white shadow-lg" : "relative"
      }`}
    >
      <div
        className={`w-[80%] relative m-auto flex items-center justify-between ${
          isSticky ? "pt-3" : "py-0"
        }`}
      >
        <div
          className={`w-[260px] ${
            isSticky && "-mb-2"
          } cursor-pointer flex items-center justify-between px-5 h-[50px] bg-blue-600`}
          onClick={() => setShow(!show)}
        >
          <div className="flex items-center gap-2">
            <AlignLeft color="white" />
            <span className="text-white text-sm">All Departments</span>
          </div>
          <ChevronDown color="white" />
        </div>
        {/* dropdown menu */}
        {show && (
          <div
            className={`absolute left-0 ${
              isSticky ? "top-[70px]" : "top-[50px]"
            } w-[260px] h-[400px] bg-[#f5f5f5]`}
          ></div>
        )}
        {/* Navigation Links */}
        <div className="flex">
          {navItems.map((item: NavItemTypes, i: number) => (
            <Link
              href={item.href}
              className="px-4 font-medium text-black text-sm"
              key={i}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </div>
      <div>
        {isSticky && (
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              {!isLoading && user ? (
                <>
                  <Link
                    href={"/profile"}
                    className="flex justify-center items-center border-[#010f1c1a] border-2 rounded-full w-[50px] h-[50px]"
                  >
                    <User />
                  </Link>
                  <Link href={"/profile"}>
                    <span className="block font-medium text-sm">Hello,</span>
                    <span className="font-semibold text-md hover:underline">
                      {user?.name?.split(" ")[0]}
                    </span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href={"/login"}
                    className="flex justify-center items-center border-[#010f1c1a] border-2 rounded-full w-[50px] h-[50px]"
                  >
                    <User />
                  </Link>
                  <Link href={"/login"}>
                    <span className="block font-medium text-sm">Hello,</span>
                    <span className="font-semibold text-md hover:underline">
                      {isLoading ? "......." : "Sign In"}
                    </span>
                  </Link>
                </>
              )}
            </div>
            <div className="flex items-center gap-5">
              <Link href={"/wishlist"} className="relative">
                <HeartIcon />
                <div className="top-[-10px] right-[-10px] absolute flex justify-center items-center bg-red-500 border-3 border-white rounded-full w-6 h-6">
                  <span className="font-medium text-white text-sm">0</span>
                </div>
              </Link>
              <Link href={"/cart"} className="relative">
                <ShoppingCart />
                <div className="top-[-10px] right-[-10px] absolute flex justify-center items-center bg-red-500 border-3 border-white rounded-full w-6 h-6">
                  <span className="font-medium text-white text-sm">0</span>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeaderBottom;
