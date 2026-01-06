import { HeartIcon, Search, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import React from "react";
import HeaderBottom from "./header-bottom";

const Header = () => {
  return (
    <div className="bg-white min-w-full">
      <div className="flex justify-between items-center m-auto py-5 w-[80%]">
        <div>
          <Link href={"/"}>
            <span className="font-[600] font-Poppins text-2xl">Kinmel</span>
          </Link>
        </div>
        <div className="relative w-[50%]">
          <input
            type="text"
            placeholder="Search for products .. "
            className="px-4 border-[2.5px] border-blue-600 rounded-sm outline outline-none focus:outline-none focus:ring-0 w-full h-[50px] font-Poppins text-sm"
          />
          <div className="top-0 right-0 absolute flex justify-center items-center bg-blue-600 rounded-sm w-[60px] h-[50px] cursor-pointer">
            <Search color="white" size={20} />
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <Link
              href={"/login"}
              className="flex justify-center items-center border-[#010f1c1a] border-2 rounded-full w-[50px] h-[50px]"
            >
              <User />
            </Link>
            <Link href={"/login"}>
              <span className="block font-medium text-sm">Hello,</span>
              <span className="font-semibold text-md hover:underline">
                Sign In
              </span>
            </Link>
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
      </div>

      <div className="border-b border-b-[#99999938]" />
      <HeaderBottom />
    </div>
  );
};

export default Header;
