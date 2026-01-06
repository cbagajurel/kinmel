"use client";
import { AlignLeft, ChevronDown } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { navItems, type NavItemTypes } from "../config/constants";

const HeaderBottom = () => {
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
    </div>
  );
};

export default HeaderBottom;
