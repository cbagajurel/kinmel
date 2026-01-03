import { Search } from "lucide-react";
import Link from "next/link";
import React from "react";

const Header = () => {
  return (
    <div className="bg-white w-full">
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
            className="px-4 border-[#3489FF] border-[2.5px] outline w-full h-[50px] font-Poppins font-medium -none"
          />
          <div className="top-0 right-0 absolute flex justify-center items-center bg-[#3489FF] w-[60px] h-[50px] cursor-pointer">
            <Search color="white" size={25} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
